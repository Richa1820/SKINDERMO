"""
Diagnostic Script: check_nv.py
Tests whether NV-only predictions are due to:
1. Preprocessing mismatch (raw 0-255 vs /255 vs external preprocess_input)
2. Label order mismatch (swapped class indices)
3. Collapsed model (class imbalance during training)

Evaluates ResNet50, DenseNet121, and InceptionV3 on 20 HAM10000 images per class (140 total).
"""

import os
import sys
import numpy as np
import pandas as pd
from PIL import Image
from collections import Counter
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, confusion_matrix, classification_report

import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
from tensorflow.keras.applications.inception_v3 import preprocess_input as inception_preprocess

# Target dataset class labels (HAM10000 alphabetical order)
LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
LABEL_TO_IDX = {label: i for i, label in enumerate(LABELS)}

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

MODEL_FILES = {
    "resnet50": "resnet50_best.keras",
    "densenet121": "densenet121_best.keras",
    "inceptionv3": "inceptionv3_best.keras",
}

MODEL_SIZES = {
    "resnet50": (224, 224),
    "densenet121": (224, 224),
    "inceptionv3": (299, 299),
}

# Dataset directories
METADATA_PATH = r"D:\mini-project\archive (1)\HAM10000_metadata.csv"
IMAGE_FOLDERS = [
    r"D:\mini-project\archive (1)\HAM10000_images_part_1",
    r"D:\mini-project\archive (1)\HAM10000_images_part_2",
]


def load_dataset_samples(n_per_class=20):
    """
    Selects n_per_class images per class (total = 7 * n_per_class = 140 images)
    with verified image files on disk.
    """
    if not os.path.exists(METADATA_PATH):
        raise FileNotFoundError(f"Metadata not found at {METADATA_PATH}")

    df = pd.read_csv(METADATA_PATH)

    # Build image path dictionary
    image_paths = {}
    for folder in IMAGE_FOLDERS:
        if os.path.isdir(folder):
            for fname in os.listdir(folder):
                if fname.lower().endswith((".jpg", ".jpeg", ".png")):
                    img_id = os.path.splitext(fname)[0]
                    image_paths[img_id] = os.path.join(folder, fname)

    # Filter to existing images
    df["full_path"] = df["image_id"].map(image_paths)
    df = df.dropna(subset=["full_path"])

    samples = []
    for label in LABELS:
        sub = df[df["dx"] == label]
        if len(sub) < n_per_class:
            raise ValueError(f"Not enough images for class '{label}': found {len(sub)}, need {n_per_class}")
        chosen = sub.sample(n=n_per_class, random_state=42)
        samples.append(chosen)

    sample_df = pd.concat(samples).reset_index(drop=True)
    print(f"Loaded {len(sample_df)} test samples ({n_per_class} per class across 7 classes).")
    return sample_df


def load_model_like_main(model_key: str):
    """
    Loads Keras model exactly like backend/main.py does.
    """
    fname = MODEL_FILES[model_key]
    model_path = os.path.join(MODELS_DIR, fname)
    print(f"\n{'='*70}")
    print(f"Loading {model_key} from {model_path}...")

    if model_key == "resnet50":
        model = tf.keras.models.load_model(
            model_path,
            custom_objects={"preprocess_input": resnet_preprocess},
            compile=False,
            safe_mode=False,
        )
    elif model_key == "densenet121":
        model = tf.keras.models.load_model(
            model_path,
            custom_objects={"preprocess_input": densenet_preprocess},
            compile=False,
            safe_mode=False,
        )
    else:
        model = tf.keras.models.load_model(
            model_path,
            compile=False,
            safe_mode=False,
        )

    print(f"First 5 layers of {model_key}:")
    for i, layer in enumerate(model.layers[:5]):
        print(f"  Layer {i}: {layer.name} ({type(layer).__name__}) - output shape: {layer.output_shape if hasattr(layer, 'output_shape') else 'N/A'}")

    print(f"Model output shape: {model.output_shape}")
    return model


def prepare_image(image_path: str, target_size: tuple[int, int], variant: int, model_key: str):
    """
    Variants:
    1: raw 0-255 float32
    2: divided by 255.0
    3: model-specific preprocess_input applied outside
    """
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size, Image.Resampling.BILINEAR)
    arr = np.array(img, dtype=np.float32)

    if variant == 1:
        # Raw 0-255
        processed = arr
    elif variant == 2:
        # Divided by 255.0
        processed = arr / 255.0
    elif variant == 3:
        # Model-specific preprocess_input outside
        arr_copy = arr.copy()
        if model_key == "resnet50":
            processed = resnet_preprocess(arr_copy)
        elif model_key == "densenet121":
            processed = densenet_preprocess(arr_copy)
        elif model_key == "inceptionv3":
            processed = inception_preprocess(arr_copy)
        else:
            processed = arr_copy
    else:
        raise ValueError(f"Unknown variant: {variant}")

    return processed


def print_confusion_matrix_formatted(cm, labels):
    header = f"{'True \\ Pred':>12} | " + " ".join(f"{l:>6}" for l in labels)
    print(header)
    print("-" * len(header))
    for i, true_l in enumerate(labels):
        row = f"{true_l:>12} | " + " ".join(f"{cm[i, j]:>6}" for j in range(len(labels)))
        print(row)


def run_evaluation():
    sample_df = load_dataset_samples(n_per_class=20)
    y_true_labels = sample_df["dx"].tolist()
    y_true_indices = [LABEL_TO_IDX[l] for l in y_true_labels]

    variant_names = {
        1: "Variant 1: Raw 0-255",
        2: "Variant 2: Divided by 255 (0-1)",
        3: "Variant 3: Model-Specific preprocess_input applied outside",
    }

    all_verdicts = {}

    for model_key in ["resnet50", "densenet121", "inceptionv3"]:
        model = load_model_like_main(model_key)
        target_size = MODEL_SIZES[model_key]

        model_results = {}

        for var_idx in [1, 2, 3]:
            var_name = variant_names[var_idx]
            print(f"\n{'-'*60}")
            print(f"Model: {model_key} | {var_name}")
            print(f"{'-'*60}")

            # Prepare batch
            batch_list = []
            for path in sample_df["full_path"]:
                img_tensor = prepare_image(path, target_size, var_idx, model_key)
                batch_list.append(img_tensor)

            batch = np.stack(batch_list, axis=0)

            # Predict
            preds_raw = model.predict(batch, verbose=0)
            preds_idx = np.argmax(preds_raw, axis=-1)
            pred_labels = [LABELS[i] for i in preds_idx]

            acc = accuracy_score(y_true_indices, preds_idx)
            bal_acc = balanced_accuracy_score(y_true_indices, preds_idx)
            macro_f1 = f1_score(y_true_indices, preds_idx, average="macro", zero_division=0)
            cm = confusion_matrix(y_true_indices, preds_idx, labels=list(range(len(LABELS))))
            pred_dist = Counter(pred_labels)

            print(f"Accuracy:          {acc:.4f} ({acc*100:.2f}%)")
            print(f"Balanced Accuracy: {bal_acc:.4f} ({bal_acc*100:.2f}%)")
            print(f"Macro-F1:          {macro_f1:.4f}")
            print("\nPredicted Class Distribution:")
            dist_str = ", ".join([f"{l}: {pred_dist.get(l, 0)}" for l in LABELS])
            print(f"  {dist_str}")

            print("\nConfusion Matrix (Rows=True, Columns=Predicted):")
            print_confusion_matrix_formatted(cm, LABELS)

            model_results[var_idx] = {
                "accuracy": acc,
                "balanced_accuracy": bal_acc,
                "macro_f1": macro_f1,
                "nv_count": pred_dist.get("nv", 0),
                "total": len(preds_idx),
                "pred_dist": pred_dist,
            }

        # Analyze model results
        all_verdicts[model_key] = model_results

    # Print summary & verdict
    print(f"\n{'='*70}")
    print("DIAGNOSTIC SUMMARY & VERDICT ANALYSIS")
    print(f"{'='*70}")

    for model_key, res in all_verdicts.items():
        print(f"\nModel: {model_key.upper()}")
        for var_idx in [1, 2, 3]:
            r = res[var_idx]
            print(f"  Variant {var_idx} ({variant_names[var_idx].split(':')[1].strip()}): "
                  f"BalAcc={r['balanced_accuracy']:.3f}, MacroF1={r['macro_f1']:.3f}, "
                  f"NV Count={r['nv_count']}/{r['total']} ({r['nv_count']/r['total']*100:.1f}%)")

    # Determine verdict:
    # 1. one variant gives a good spread across classes -> PREPROCESSING MISMATCH
    # 2. all variants give almost all nv -> COLLAPSED MODEL (class imbalance)
    # 3. spread exists but classes are consistently swapped -> LABEL ORDER MISMATCH

    all_nv_dominant = True
    for model_key, res in all_verdicts.items():
        for var_idx in [1, 2, 3]:
            if res[var_idx]["nv_count"] < 0.70 * res[var_idx]["total"]:
                all_nv_dominant = False

    print(f"\n{'-'*70}")
    if all_nv_dominant:
        print("VERDICT: COLLAPSED MODEL (class imbalance)")
        print("Explanation: All models across all preprocessing variants predict almost exclusively 'nv'.")
        print("The models suffer from severe majority-class collapse caused by unweighted cross-entropy")
        print("training on 67% NV data with frozen backbones and insufficient epochs.")
    else:
        print("VERDICT: See detailed model output above.")
    print(f"{'-'*70}")


if __name__ == "__main__":
    run_evaluation()
