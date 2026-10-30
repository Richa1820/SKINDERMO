import os
import sys
import json
import numpy as np
import pandas as pd
from PIL import Image, ImageOps
import tensorflow as tf
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    recall_score,
    confusion_matrix,
    classification_report
)

# 1. Paths & Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "inceptionv3_best.keras")
LABELS_PATH = os.path.join(MODELS_DIR, "labels.json")

# Metadata and image folders
DATA_DIR = r"D:\mini-project\archive (1)"
METADATA_PATH = os.path.join(DATA_DIR, "HAM10000_metadata.csv")
IMG_DIR_1 = os.path.join(DATA_DIR, "HAM10000_images_part_1")
IMG_DIR_2 = os.path.join(DATA_DIR, "HAM10000_images_part_2")

# Load LABELS
with open(LABELS_PATH, "r", encoding="utf-8") as f:
    LABELS = json.load(f)

print("=" * 80)
print(f"SKINDERMO InceptionV3 Comprehensive Preprocessing & Spread Evaluation")
print(f"Model path: {MODEL_PATH}")
print(f"Classes ({len(LABELS)}): {LABELS}")
print("=" * 80)

# Verify model existence & size
if not os.path.exists(MODEL_PATH):
    print(f"FATAL: Model file not found at {MODEL_PATH}")
    sys.exit(1)

file_size_mb = os.path.getsize(MODEL_PATH) / (1024 * 1024)
print(f"Model file size: {file_size_mb:.2f} MB")
if file_size_mb < 1.0:
    print("FATAL: Model file is < 1 MB. This is a Git LFS pointer!")
    sys.exit(1)

# 2. Select 20 images per class (140 total)
meta_df = pd.read_csv(METADATA_PATH)

sampled_records = []
for label in LABELS:
    class_df = meta_df[meta_df['dx'] == label]
    # Check image availability
    valid_paths = []
    for _, row in class_df.iterrows():
        img_id = row['image_id']
        path1 = os.path.join(IMG_DIR_1, f"{img_id}.jpg")
        path2 = os.path.join(IMG_DIR_2, f"{img_id}.jpg")
        if os.path.exists(path1):
            valid_paths.append((path1, label, img_id))
        elif os.path.exists(path2):
            valid_paths.append((path2, label, img_id))
        if len(valid_paths) >= 20:
            break
    
    if len(valid_paths) < 20:
        print(f"WARNING: Only found {len(valid_paths)} images for class {label}")
    sampled_records.extend(valid_paths[:20])

print(f"Total test images selected: {len(sampled_records)} (20 per class across {len(LABELS)} classes)")

# 3. Load InceptionV3 model
print("\nLoading model with safe_mode=False, compile=False...")
model = tf.keras.models.load_model(MODEL_PATH, compile=False, safe_mode=False)
print("Model loaded successfully.")
print(f"Input Shape: {model.input_shape}, Output Shape: {model.output_shape}")

# 4. Prepare base images (PIL RGB at 299x299 with exif_transpose)
pil_images = []
y_true = []
y_true_labels = []

for img_path, label, img_id in sampled_records:
    with Image.open(img_path) as raw_img:
        transposed = ImageOps.exif_transpose(raw_img)
        rgb_img = transposed.convert("RGB")
        resized = rgb_img.resize((299, 299), Image.Resampling.BILINEAR)
        pil_images.append(np.array(resized, dtype=np.float32))
        y_true.append(LABELS.index(label))
        y_true_labels.append(label)

base_batch = np.stack(pil_images, axis=0) # shape (140, 299, 299, 3) in [0, 255]
y_true = np.array(y_true)

# 5. Define 3 preprocessing variants
variants = {
    "Variant 1: Raw 0-255 float32 (main.py baseline)": base_batch.copy(),
    "Variant 2: Pixels divided by 255 (0.0 to 1.0)": base_batch.copy() / 255.0,
    "Variant 3: InceptionV3 preprocess_input (-1.0 to 1.0 outside model)": tf.keras.applications.inception_v3.preprocess_input(base_batch.copy())
}

# 6. Evaluate each variant
results = {}

for variant_name, input_data in variants.items():
    print("\n" + "=" * 80)
    print(f"RUNNING EVALUATION: {variant_name}")
    print(f"Input batch shape: {input_data.shape}, min: {input_data.min():.3f}, max: {input_data.max():.3f}, mean: {input_data.mean():.3f}")
    print("=" * 80)

    # Predict in batches of 32
    preds = model.predict(input_data, batch_size=32, verbose=0)
    pred_classes = np.argmax(preds, axis=1)

    acc = accuracy_score(y_true, pred_classes)
    bacc = balanced_accuracy_score(y_true, pred_classes)
    macro_f1 = f1_score(y_true, pred_classes, average="macro", zero_division=0)
    recalls = recall_score(y_true, pred_classes, average=None, zero_division=0)
    cm = confusion_matrix(y_true, pred_classes, labels=range(len(LABELS)))

    # Distribution of predicted classes
    unique_preds, counts = np.unique(pred_classes, return_counts=True)
    pred_dist = {LABELS[i]: 0 for i in range(len(LABELS))}
    for u, c in zip(unique_preds, counts):
        pred_dist[LABELS[u]] = int(c)

    results[variant_name] = {
        "accuracy": acc,
        "balanced_accuracy": bacc,
        "macro_f1": macro_f1,
        "recalls": recalls,
        "pred_dist": pred_dist,
        "confusion_matrix": cm,
        "predictions": pred_classes
    }

    print(f"\n--- Metrics for {variant_name} ---")
    print(f"Overall Accuracy:          {acc * 100:.2f}%")
    print(f"Balanced Accuracy:         {bacc * 100:.2f}%")
    print(f"Macro F1-Score:            {macro_f1:.4f}")
    print("\nPredicted Class Distribution (out of 140 total):")
    for lbl, count in pred_dist.items():
        pct = (count / len(sampled_records)) * 100
        print(f"  {lbl:<6}: {count:3d} images ({pct:5.1f}%)")

    print("\nPer-Class Recall:")
    for idx, lbl in enumerate(LABELS):
        print(f"  {lbl:<6} recall: {recalls[idx] * 100:5.2f}% ({cm[idx, idx]}/20 correct)")

    print("\nConfusion Matrix (Rows=True, Columns=Predicted):")
    header = f"{'True/Pred':<10}" + "".join([f"{l:>8}" for l in LABELS])
    print(header)
    for idx, lbl in enumerate(LABELS):
        row = f"{lbl:<10}" + "".join([f"{cm[idx, j]:>8}" for j in range(len(LABELS))])
        print(row)

# 7. Summary Comparison
print("\n" + "=" * 80)
print("SUMMARY COMPARISON ACROSS PREPROCESSING VARIANTS")
print("=" * 80)
print(f"{'Variant':<45} | {'Acc':<8} | {'Bal Acc':<8} | {'Macro F1':<8} | {'Classes Predicted':<18}")
print("-" * 95)
for v_name, res in results.items():
    active_preds = sum(1 for c in res['pred_dist'].values() if c > 0)
    print(f"{v_name[:45]:<45} | {res['accuracy']*100:6.2f}% | {res['balanced_accuracy']*100:6.2f}% | {res['macro_f1']:8.4f} | {active_preds}/7 classes predicted")

print("=" * 80)
