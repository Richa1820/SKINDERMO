"""
SKINDERMO - Production Model Retraining Pipeline (HAM10000 7-Class Lesion Classification)
Fixes majority-class collapse (NV) via:
1. Stratified lesion-level train/val/test splits (70/15/15)
2. Balanced class weighting & minority class oversampling
3. Data augmentation on training pipeline only
4. Model-internal preprocessing layer (raw [0, 255] pixel ingestion)
5. Two-stage transfer learning:
   - Stage 1: Frozen backbone, train classification head (LR 1e-3, 10 epochs)
   - Stage 2: Fine-tune top 30-50 layers (LR 1e-5, BatchNorm frozen, 20 epochs)
6. ModelCheckpoint, ReduceLROnPlateau, and EarlyStopping callbacks
7. Comprehensive held-out test evaluation (balanced accuracy, macro-F1, per-class metrics)
8. Exporting .keras checkpoints and labels.json for backend serving
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, confusion_matrix, balanced_accuracy_score, f1_score, accuracy_score

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks

# 7 Output classes in standard alphabetical order
LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
NUM_CLASSES = len(LABELS)
LABEL_TO_IDX = {l: i for i, l in enumerate(LABELS)}

# Paths (adaptable for Local, Google Colab, or Kaggle)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SPLITS_DIR = os.path.join(os.path.dirname(__file__), "splits")
MODELS_EXPORT_DIR = os.path.join(BASE_DIR, "backend", "models")

# Dataset locations (searches common archive directories)
POSSIBLE_ARCHIVES = [
    r"D:\mini-project\archive (1)",
    r"/content/drive/MyDrive/SKINDERMO",
    r"/kaggle/input/skin-cancer-mnist-ham10000",
    os.path.join(BASE_DIR, "dataset"),
]

def find_dataset_paths():
    for base in POSSIBLE_ARCHIVES:
        meta = os.path.join(base, "HAM10000_metadata.csv")
        if os.path.exists(meta):
            img_folders = [
                os.path.join(base, "HAM10000_images_part_1"),
                os.path.join(base, "HAM10000_images_part_2"),
            ]
            # In case kaggle combines all images into one folder
            single_folder = os.path.join(base, "ham10000_images")
            if os.path.isdir(single_folder):
                img_folders.append(single_folder)
            return meta, [f for f in img_folders if os.path.isdir(f)]
    raise FileNotFoundError("Could not find HAM10000 dataset in search paths.")

METADATA_PATH, IMAGE_FOLDERS = find_dataset_paths()


def create_or_load_splits():
    """Ensures 70/15/15 stratified lesion-level splits exist."""
    os.makedirs(SPLITS_DIR, exist_ok=True)
    train_path = os.path.join(SPLITS_DIR, "train.csv")
    val_path = os.path.join(SPLITS_DIR, "val.csv")
    test_path = os.path.join(SPLITS_DIR, "test.csv")

    if os.path.exists(train_path) and os.path.exists(val_path) and os.path.exists(test_path):
        print(f"[SPLIT] Loading existing splits from {SPLITS_DIR}...")
        train_df = pd.read_csv(train_path)
        val_df = pd.read_csv(val_path)
        test_df = pd.read_csv(test_path)
    else:
        print("[SPLIT] Generating new stratified lesion-level splits...")
        df = pd.read_csv(METADATA_PATH)
        lesions = df.groupby("lesion_id").first().reset_index()[["lesion_id", "dx"]]
        train_l, temp_l = train_test_split(lesions, test_size=0.30, random_state=42, stratify=lesions["dx"])
        val_l, test_l = train_test_split(temp_l, test_size=0.50, random_state=42, stratify=temp_l["dx"])

        train_df = df[df["lesion_id"].isin(train_l["lesion_id"])].copy()
        val_df = df[df["lesion_id"].isin(val_l["lesion_id"])].copy()
        test_df = df[df["lesion_id"].isin(test_l["lesion_id"])].copy()

        train_df.to_csv(train_path, index=False)
        val_df.to_csv(val_path, index=False)
        test_df.to_csv(test_path, index=False)

    # Index image file paths
    img_map = {}
    for folder in IMAGE_FOLDERS:
        for fname in os.listdir(folder):
            if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                img_map[os.path.splitext(fname)[0]] = os.path.join(folder, fname)

    train_df["image_path"] = train_df["image_id"].map(img_map)
    val_df["image_path"] = val_df["image_id"].map(img_map)
    test_df["image_path"] = test_df["image_id"].map(img_map)

    train_df = train_df.dropna(subset=["image_path"]).reset_index(drop=True)
    val_df = val_df.dropna(subset=["image_path"]).reset_index(drop=True)
    test_df = test_df.dropna(subset=["image_path"]).reset_index(drop=True)

    print(f"[SPLIT] Train: {len(train_df)}, Val: {len(val_df)}, Test: {len(test_df)}")
    return train_df, val_df, test_df


def oversample_minority_classes(df: pd.DataFrame, target_multiplier: dict = None) -> pd.DataFrame:
    """
    Oversamples rare classes to ensure gradient stability and diversity.
    nv is ~4680, mel/bkl ~770, bcc ~360, akiec ~220, vasc ~100, df ~70.
    """
    if target_multiplier is None:
        target_multiplier = {
            "df": 6,      # ~420 samples
            "vasc": 4,    # ~400 samples
            "akiec": 3,   # ~660 samples
            "bcc": 2,     # ~720 samples
            "mel": 1,
            "bkl": 1,
            "nv": 1,
        }

    dfs = []
    for cls_name, group in df.groupby("dx"):
        mult = target_multiplier.get(cls_name, 1)
        if mult > 1:
            sampled = group.sample(frac=mult, replace=True, random_state=42)
            dfs.append(sampled)
        else:
            dfs.append(group)

    balanced_df = pd.concat(dfs).sample(frac=1.0, random_state=42).reset_index(drop=True)
    print(f"[OVERSAMPLE] Expanded training set from {len(df)} to {len(balanced_df)} images.")
    print("Class distribution after oversampling:\n", balanced_df["dx"].value_counts())
    return balanced_df


def compute_balanced_weights(train_df: pd.DataFrame) -> dict:
    """Computes balanced class weights based on the original training set."""
    classes = np.array(LABELS)
    y = train_df["dx"].to_numpy()
    weights = compute_class_weight(class_weight="balanced", classes=classes, y=y)
    weight_dict = {i: float(round(w, 4)) for i, w in enumerate(weights)}
    print("[CLASS WEIGHTS] Balanced class weights calculated from training set:")
    for i, l in enumerate(LABELS):
        print(f"  {l} ({i}): {weight_dict[i]}")
    return weight_dict


def build_augmentation_layer():
    """Data augmentation layer active only during training."""
    return tf.keras.Sequential([
        layers.RandomFlip("horizontal_and_vertical"),
        layers.RandomRotation(factor=0.055),  # ~20 degrees
        layers.RandomZoom(height_factor=(-0.1, 0.1)),
        layers.RandomBrightness(factor=0.1),
        layers.RandomContrast(factor=0.1),
    ], name="data_augmentation")


def build_model(arch: str, img_size: int):
    """
    Constructs model with architecture-specific preprocess_input embedded internally.
    Inputs are raw 0-255 pixels.
    """
    inputs = layers.Input(shape=(img_size, img_size, 3), name="raw_image_input")

    # Embed correct preprocessing inside model
    if arch == "resnet50":
        from tensorflow.keras.applications.resnet50 import ResNet50, preprocess_input
        x = layers.Lambda(preprocess_input, name="resnet_preprocess")(inputs)
        base = ResNet50(include_top=False, weights="imagenet", input_tensor=x)
    elif arch == "densenet121":
        from tensorflow.keras.applications.densenet import DenseNet121, preprocess_input
        x = layers.Lambda(preprocess_input, name="densenet_preprocess")(inputs)
        base = DenseNet121(include_top=False, weights="imagenet", input_tensor=x)
    elif arch == "inceptionv3":
        from tensorflow.keras.applications.inception_v3 import InceptionV3
        # Inception expects [-1, 1] range: (x / 127.5) - 1.0
        x = layers.Rescaling(1.0 / 127.5, offset=-1.0, name="inception_rescaling")(inputs)
        base = InceptionV3(include_top=False, weights="imagenet", input_tensor=x)
    else:
        raise ValueError(f"Unknown architecture: {arch}")

    # Freeze base initially
    base.trainable = False

    feat = base.output
    feat = layers.GlobalAveragePooling2D(name="global_pool")(feat)
    feat = layers.BatchNormalization(name="head_bn")(feat)
    feat = layers.Dropout(0.4, name="head_dropout")(feat)
    feat = layers.Dense(256, activation="relu", name="head_dense")(feat)
    feat = layers.Dropout(0.3, name="head_dropout2")(feat)
    outputs = layers.Dense(NUM_CLASSES, activation="softmax", name="predictions")(feat)

    model = models.Model(inputs=inputs, outputs=outputs, name=f"{arch}_classifier")
    return model, base


def create_tf_dataset(df: pd.DataFrame, img_size: int, batch_size: int, is_training: bool):
    """Creates a high-performance tf.data pipeline."""
    paths = df["image_path"].tolist()
    labels = df["dx"].map(LABEL_TO_IDX).to_numpy(dtype=np.int32)

    ds = tf.data.Dataset.from_tensor_slices((paths, labels))

    def load_img(path, label):
        raw = tf.io.read_file(path)
        img = tf.io.decode_jpeg(raw, channels=3)
        img = tf.image.resize(img, [img_size, img_size])
        img = tf.cast(img, tf.float32)
        return img, label

    ds = ds.map(load_img, num_parallel_calls=tf.data.AUTOTUNE)

    if is_training:
        aug = build_augmentation_layer()
        ds = ds.map(lambda x, y: (aug(x, training=True), y), num_parallel_calls=tf.data.AUTOTUNE)
        ds = ds.shuffle(buffer_size=1024, seed=42)

    ds = ds.batch(batch_size).prefetch(tf.data.AUTOTUNE)
    return ds


def train_single_architecture(arch: str, train_df: pd.DataFrame, val_df: pd.DataFrame,
                             test_df: pd.DataFrame, class_weights: dict,
                             stage1_epochs=10, stage2_epochs=20):
    print(f"\n{'='*75}")
    print(f"STARTING TWO-STAGE RETRAINING FOR: {arch.upper()}")
    print(f"{'='*75}")

    img_size = 299 if arch == "inceptionv3" else 224
    batch_size = 32

    # Oversample training set
    aug_train_df = oversample_minority_classes(train_df)

    train_ds = create_tf_dataset(aug_train_df, img_size, batch_size, is_training=True)
    val_ds = create_tf_dataset(val_df, img_size, batch_size, is_training=False)
    test_ds = create_tf_dataset(test_df, img_size, batch_size, is_training=False)

    model, base = build_model(arch, img_size)

    # -------------------------------------------------------------------------
    # STAGE 1: Train classification head with frozen backbone (LR 1e-3)
    # -------------------------------------------------------------------------
    print(f"\n[STAGE 1] Training classification head for {stage1_epochs} epochs with base frozen...")
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    checkpoint_path = os.path.join(MODELS_EXPORT_DIR, f"{arch}_best.keras")
    os.makedirs(MODELS_EXPORT_DIR, exist_ok=True)

    cb_stage1 = [
        callbacks.EarlyStopping(monitor="val_loss", patience=4, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.5, patience=2, min_lr=1e-5),
    ]

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage1_epochs,
        class_weight=class_weights,
        callbacks=cb_stage1,
    )

    # -------------------------------------------------------------------------
    # STAGE 2: Fine-tune top 30-50 layers at low LR (1e-5), keeping BatchNorm frozen
    # -------------------------------------------------------------------------
    print(f"\n[STAGE 2] Unfreezing top 40 layers of {arch} (keeping BatchNorm frozen) for {stage2_epochs} epochs...")
    base.trainable = True
    # Freeze all layers except top 40
    for layer in base.layers[:-40]:
        layer.trainable = False
    # Keep BatchNormalization layers frozen to prevent moving-statistics drift
    for layer in base.layers:
        if isinstance(layer, layers.BatchNormalization):
            layer.trainable = False

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=5e-5),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    cb_stage2 = [
        callbacks.ModelCheckpoint(checkpoint_path, monitor="val_loss", save_best_only=True, verbose=1),
        callbacks.EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True),
        callbacks.ReduceLROnPlateau(monitor="val_loss", factor=0.3, patience=2, min_lr=1e-6),
    ]

    model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=stage2_epochs,
        class_weight=class_weights,
        callbacks=cb_stage2,
    )

    # Ensure best model is saved
    model.save(checkpoint_path)
    print(f"[SAVED] Checkpoint saved successfully: {checkpoint_path}")

    # -------------------------------------------------------------------------
    # HELD-OUT TEST EVALUATION
    # -------------------------------------------------------------------------
    print(f"\n[EVALUATION] Evaluating {arch} on held-out test split ({len(test_df)} images)...")
    y_true = test_df["dx"].map(LABEL_TO_IDX).to_numpy()

    preds_prob = model.predict(test_ds)
    y_pred = np.argmax(preds_prob, axis=1)

    acc = accuracy_score(y_true, y_pred)
    bal_acc = balanced_accuracy_score(y_true, y_pred)
    macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)
    cm = confusion_matrix(y_true, y_pred)

    print(f"\n{'-'*60}")
    print(f"{arch.upper()} FINAL HELD-OUT TEST RESULTS:")
    print(f"Overall Accuracy:          {acc:.4f} ({acc*100:.2f}%)")
    print(f"Balanced Accuracy:         {bal_acc:.4f} ({bal_acc*100:.2f}%)")
    print(f"Macro-F1 Score:            {macro_f1:.4f}")
    print(f"\nPredicted Class Distribution:")
    pred_counts = Counter([LABELS[i] for i in y_pred])
    for l in LABELS:
        print(f"  {l}: {pred_counts.get(l, 0)}")

    print(f"\nClassification Report:")
    print(classification_report(y_true, y_pred, target_names=LABELS, zero_division=0))
    print(f"\nConfusion Matrix:")
    print(cm)
    print(f"{'-'*60}\n")

    return {
        "accuracy": float(acc),
        "balanced_accuracy": float(bal_acc),
        "macro_f1": float(macro_f1),
        "distribution": {l: int(pred_counts.get(l, 0)) for l in LABELS},
    }


def main():
    print("[INIT] Starting SKINDERMO Proper Training Pipeline...")
    train_df, val_df, test_df = create_or_load_splits()
    class_weights = compute_balanced_weights(train_df)

    # Export labels.json to backend/models/
    labels_json_path = os.path.join(MODELS_EXPORT_DIR, "labels.json")
    with open(labels_json_path, "w") as f:
        json.dump(LABELS, f, indent=2)
    print(f"[EXPORT] Saved {labels_json_path}")

    # Retrain each architecture
    eval_results = {}
    for arch in ["resnet50", "densenet121", "inceptionv3"]:
        eval_results[arch] = train_single_architecture(
            arch, train_df, val_df, test_df, class_weights,
            stage1_epochs=10, stage2_epochs=20
        )

    results_path = os.path.join(MODELS_EXPORT_DIR, "retraining_evaluation.json")
    with open(results_path, "w") as f:
        json.dump(eval_results, f, indent=2)
    print(f"[ALL DONE] Pipeline complete! Results saved to {results_path}")


if __name__ == "__main__":
    main()
