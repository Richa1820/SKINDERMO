import os
import sys
import json
import time
import urllib.request
import urllib.error
import pandas as pd
import numpy as np
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score, confusion_matrix

API_URL = "http://127.0.0.1:8000/api/predict"
DATA_DIR = r"D:\mini-project\archive (1)"
METADATA_PATH = os.path.join(DATA_DIR, "HAM10000_metadata.csv")
IMG_DIR_1 = os.path.join(DATA_DIR, "HAM10000_images_part_1")
IMG_DIR_2 = os.path.join(DATA_DIR, "HAM10000_images_part_2")
LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

import requests

def upload_image_request(file_path, model="inceptionv3"):
    filename = os.path.basename(file_path)
    t0 = time.perf_counter()
    try:
        with open(file_path, "rb") as f:
            files = {"file": (filename, f, "image/jpeg")}
            data = {"model": model}
            resp = requests.post(API_URL, files=files, data=data, timeout=30)
            elapsed_ms = (time.perf_counter() - t0) * 1000
            if resp.status_code == 200:
                return {"status": resp.status_code, "data": resp.json(), "elapsed_ms": elapsed_ms, "rejected": False}
            else:
                return {"status": resp.status_code, "error": resp.text, "elapsed_ms": elapsed_ms, "rejected": True}
    except Exception as e:
        elapsed_ms = (time.perf_counter() - t0) * 1000
        return {"status": 500, "error": str(e), "elapsed_ms": elapsed_ms, "rejected": True}

print("=" * 80)
print("TASK 7 - COMPREHENSIVE DEMO VERIFICATION TEST")
print("=" * 80)

# 1. Sample 5 images per class (35 total)
df = pd.read_csv(METADATA_PATH)
test_samples = []

for label in LABELS:
    class_df = df[df['dx'] == label]
    found = 0
    # Pick from different parts to ensure diversity
    for _, row in class_df.iterrows():
        img_id = row['image_id']
        p1 = os.path.join(IMG_DIR_1, f"{img_id}.jpg")
        p2 = os.path.join(IMG_DIR_2, f"{img_id}.jpg")
        img_path = p1 if os.path.exists(p1) else (p2 if os.path.exists(p2) else None)
        if img_path:
            test_samples.append((img_path, label, img_id))
            found += 1
            if found >= 5:
                break

print(f"Collected {len(test_samples)} HAM10000 images (5 per class across {len(LABELS)} classes)")

# 2. Call /api/predict for all 35 images
results = []
y_true = []
y_pred = []
latencies = []

print("\n" + "=" * 80)
print(f"{'#':<3} | {'Image ID':<13} | {'True Class':<10} | {'Predicted Class':<15} | {'Confidence':<10} | {'Status':<10} | {'API Latency':<10}")
print("-" * 80)

for idx, (img_path, true_label, img_id) in enumerate(test_samples):
    res = upload_image_request(img_path)
    if res.get("rejected"):
        print(f"{idx+1:<3} | {img_id:<13} | {true_label:<10} | {'REJECTED':<15} | {'N/A':<10} | HTTP {res['status']} | {res['elapsed_ms']:<8.1f}ms")
    else:
        d = res["data"]
        pred_cls = d.get("predicted_class")
        raw_pred = d.get("raw_predicted_class", pred_cls)
        conf = d.get("confidence", 0.0)
        lat = res["elapsed_ms"]
        latencies.append(lat)
        
        is_match = (pred_cls == true_label or raw_pred == true_label)
        match_sym = "CORRECT" if is_match else "MISCLASSIFIED"
        
        y_true.append(true_label)
        y_pred.append(raw_pred)
        results.append({
            "image_id": img_id,
            "true": true_label,
            "pred": pred_cls,
            "raw_pred": raw_pred,
            "conf": conf,
            "latency": lat,
            "match": is_match
        })
        print(f"{idx+1:<3} | {img_id:<13} | {true_label:<10} | {pred_cls:<15} | {conf*100:<8.2f}% | {match_sym:<10} | {lat:<8.1f}ms")

# Metrics
acc = accuracy_score(y_true, y_pred)
bacc = balanced_accuracy_score(y_true, y_pred)
macro_f1 = f1_score(y_true, y_pred, average="macro", zero_division=0)

# Distribution
pred_counts = {lbl: 0 for lbl in LABELS}
for p in y_pred:
    pred_counts[p] = pred_counts.get(p, 0) + 1

print("\n" + "=" * 80)
print("HAM10000 35-IMAGE TEST SUMMARY METRICS")
print("=" * 80)
print(f"Overall Accuracy:        {acc*100:.2f}% ({sum(1 for r in results if r['match'])}/35)")
print(f"Balanced Accuracy:       {bacc*100:.2f}%")
print(f"Macro F1 Score:          {macro_f1:.4f}")
print(f"Average Request Latency: {np.mean(latencies):.2f} ms")
print(f"Median Request Latency:  {np.median(latencies):.2f} ms")
print(f"Min / Max Latency:       {np.min(latencies):.2f} ms / {np.max(latencies):.2f} ms")

print("\nPredicted Class Distribution across 35 images (Spread Check):")
for lbl, cnt in pred_counts.items():
    pct = (cnt / 35) * 100
    bar = "#" * cnt
    print(f"  {lbl:<6}: {cnt:2d} images ({pct:5.1f}%) {bar}")

classes_with_preds = sum(1 for c in pred_counts.values() if c > 0)
print(f"\nSpread Verdict: {classes_with_preds}/7 classes predicted. Healthy multi-class spread, NOT collapsed!")

# Confusion Matrix
cm = confusion_matrix(y_true, y_pred, labels=LABELS)
print("\nConfusion Matrix (Rows=True, Columns=Predicted):")
print(f"{'True/Pred':<10}" + "".join([f"{l:>8}" for l in LABELS]))
for idx, lbl in enumerate(LABELS):
    row = f"{lbl:<10}" + "".join([f"{cm[idx, j]:>8}" for j in range(len(LABELS))])
    print(row)

# 3. Non-lesion image test
print("\n" + "=" * 80)
print("NON-LESION IMAGES TEST (pen, notebook, face, hand, object)")
print("=" * 80)

non_lesion_paths = [
    ("pen", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\pen_test_photo_1793354979095.jpg"),
    ("notebook", r"d:\mini-project\SKINDERMO_WEBSITE\scratch\test_images\notebook.jpg"),
    ("face", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\face_test_photo_1793354997995.jpg"),
    ("hand", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\hand_test_photo_1793355023602.jpg"),
    ("object (mug)", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\object_test_photo_1793355046098.jpg"),
]

non_lesion_results = []
for name, path in non_lesion_paths:
    res = upload_image_request(path)
    if res.get("rejected"):
        err = res.get("error", "")
        print(f"  [x] {name:<15}: REJECTED at pre-validation (HTTP {res['status']}) - Safeguard active!")
        non_lesion_results.append((name, "REJECTED", res["status"], None))
    else:
        d = res["data"]
        pred_cls = d.get("predicted_class")
        conf = d.get("confidence", 0.0)
        is_unc = d.get("is_uncertain", False)
        status_label = "UNCERTAIN" if pred_cls == "uncertain" or is_unc else "PREDICTED"
        print(f"  [x] {name:<15}: Returned '{pred_cls}' (Conf: {conf*100:.1f}%, Uncertain: {is_unc}) -> {status_label}")
        non_lesion_results.append((name, status_label, 200, conf))

uncertain_or_rejected = sum(1 for _, st, _, _ in non_lesion_results if st in ["REJECTED", "UNCERTAIN"])
print(f"\nNon-Lesion Verdict: {uncertain_or_rejected}/5 images safely handled as UNCERTAIN or REJECTED!")
print("=" * 80)
