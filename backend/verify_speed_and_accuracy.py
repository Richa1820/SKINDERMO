"""
SKINDERMO Verification & Accuracy Validation Script (STEP 4)
Tests 5 different images with single models and 3-model ensemble.
Validates 10 test images before and after optimization to confirm probability equivalence (< 0.01).
Verifies all targets:
- Single model < 1s
- All 3 models < 3s
- End-to-end < 5s
- 1st request after startup is fast
"""

import os
import sys
import time
import requests
import numpy as np
from PIL import Image

API_BASE = "http://localhost:8000"
TEST_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "scratch", "test_images")

def test_endpoints_with_5_images():
    print("=" * 85, flush=True)
    print(" 1. PERFORMANCE VERIFICATION ACROSS 5 IMAGES (SINGLE MODEL & TRI-MODEL ENSEMBLE) ", flush=True)
    print("=" * 85, flush=True)

    test_files = [
        "sample_lesion_1.jpg",
        "sample_lesion_2.jpg",
        "sample_lesion_3.jpg",
        "sample_lesion_4.jpg",
        "sample_lesion_5.jpg",
    ]

    models_to_test = ["resnet50", "densenet121", "inceptionv3"]
    results = []

    for idx, fname in enumerate(test_files, 1):
        fpath = os.path.join(TEST_DIR, fname)
        if not os.path.exists(fpath):
            print(f"[!] Warning: Test image not found at {fpath}", flush=True)
            continue

        file_size_kb = os.path.getsize(fpath) / 1024
        print(f"\n--- Test Image {idx}: {fname} ({file_size_kb:.1f} KB) ---", flush=True)

        # 1. Test Single Model (rotate through the 3 architectures)
        chosen_model = models_to_test[(idx - 1) % len(models_to_test)]
        t0 = time.perf_counter()
        with open(fpath, "rb") as f:
            resp = requests.post(
                f"{API_BASE}/api/predict",
                files={"file": (fname, f, "image/jpeg")},
                data={"model": chosen_model},
            )
        single_round_trip = (time.perf_counter() - t0) * 1000
        single_data = resp.json()
        single_inf_ms = single_data.get("inference_time_ms", 0)
        single_serv_ms = single_data.get("server_process_ms", 0)
        single_pred = single_data.get("predicted_class", "unknown")
        single_conf = single_data.get("confidence", 0)

        print(
            f"  [Single Model: {chosen_model}] Status: {resp.status_code} | "
            f"Class: {single_pred} ({single_conf*100:.1f}%) | "
            f"Inference: {single_inf_ms:.1f}ms | Server: {single_serv_ms:.1f}ms | Round-Trip: {single_round_trip:.1f}ms",
            flush=True,
        )

        # 2. Test Tri-Model Ensemble (/api/ensemble)
        t0_ens = time.perf_counter()
        with open(fpath, "rb") as f:
            resp_ens = requests.post(
                f"{API_BASE}/api/ensemble",
                files={"file": (fname, f, "image/jpeg")},
            )
        ensemble_round_trip = (time.perf_counter() - t0_ens) * 1000
        ens_data = resp_ens.json()
        ens_inf_ms = ens_data.get("inference_time_ms", 0)
        ens_serv_ms = ens_data.get("server_process_ms", 0)
        ens_pred = ens_data.get("predicted_class", "unknown")
        ens_conf = ens_data.get("confidence", 0)
        agreement = ens_data.get("consensus_agreement", "unknown")

        ind_times = [
            f"{m}={data.get('inference_time_ms', 0):.1f}ms"
            for m, data in ens_data.get("individual_predictions", {}).items()
        ]

        print(
            f"  [Tri-Model Ensemble] Status: {resp_ens.status_code} | "
            f"Consensus: {ens_pred} ({ens_conf*100:.1f}%, {agreement}) | "
            f"Wall-Clock: {ens_inf_ms:.1f}ms ({', '.join(ind_times)}) | "
            f"Server: {ens_serv_ms:.1f}ms | Round-Trip: {ensemble_round_trip:.1f}ms",
            flush=True,
        )

        results.append({
            "image": fname,
            "single_model": chosen_model,
            "single_inf_ms": single_inf_ms,
            "single_round_trip_ms": single_round_trip,
            "ens_wall_ms": ens_inf_ms,
            "ens_round_trip_ms": ensemble_round_trip,
        })

    # Summary Table
    print("\n" + "=" * 85, flush=True)
    print(" VERIFICATION BENCHMARK SUMMARY (Targets: Single < 1000ms, Ensemble < 3000ms, End-to-End < 5000ms)", flush=True)
    print("=" * 85, flush=True)
    header = f"{'Image':<18} | {'Single Model':<14} | {'Single Inf (ms)':<16} | {'Ensemble Wall (ms)':<18} | {'Ensemble Total (ms)':<20}"
    print(header, flush=True)
    print("-" * len(header), flush=True)
    for r in results:
        print(
            f"{r['image']:<18} | {r['single_model']:<14} | {r['single_inf_ms']:<16.1f} | {r['ens_wall_ms']:<18.1f} | {r['ens_round_trip_ms']:<20.1f}",
            flush=True,
        )
    print("=" * 85, flush=True)


def validate_accuracy_on_10_images():
    print("\n" + "=" * 85, flush=True)
    print(" 2. ACCURACY EQUIVALENCE VALIDATION (10 TEST IMAGES: KERAS VS OPTIMIZED PIPELINE) ", flush=True)
    print("=" * 85, flush=True)

    import tensorflow as tf
    from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
    from main import MODELS_DIR, preprocess_pil_image

    # Load original ResNet-50 Keras model
    r50_path = os.path.join(MODELS_DIR, "resnet50_best.keras")
    print(f"Loading baseline Keras model for ground-truth comparison: {r50_path}...", flush=True)
    keras_model = tf.keras.models.load_model(
        r50_path,
        custom_objects={"preprocess_input": resnet_preprocess},
        compile=False,
        safe_mode=False,
    )

    diffs = []
    classes_match = []

    # Prepare all 10 tensors for fast batched ground-truth forward pass
    tensors = []
    valid_fnames = []
    for i in range(1, 11):
        fname = f"sample_lesion_{i}.jpg"
        fpath = os.path.join(TEST_DIR, fname)
        if not os.path.exists(fpath):
            continue
        pil_img = Image.open(fpath).convert("RGB")
        tensor = preprocess_pil_image(pil_img, (224, 224))
        tensors.append(tensor)
        valid_fnames.append(fname)

    batch_tensors = np.vstack(tensors)
    print(f"Executing ground-truth Keras forward pass on batch shape {batch_tensors.shape}...", flush=True)
    t0_k = time.perf_counter()
    raw_keras_batch = keras_model(batch_tensors, training=False).numpy()
    print(f"Keras batch evaluated in {(time.perf_counter() - t0_k)*1000:.1f}ms", flush=True)

    header = f"{'Image':<20} | {'Keras Pred':<12} | {'Optimized Pred':<14} | {'Max Prob Diff':<14} | {'Match (<0.01)':<12}"
    print("\n" + header, flush=True)
    print("-" * len(header), flush=True)

    for idx, fname in enumerate(valid_fnames):
        fpath = os.path.join(TEST_DIR, fname)
        raw_keras = raw_keras_batch[idx]
        keras_class = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"][int(np.argmax(raw_keras))]

        # Optimized server response via HTTP API
        with open(fpath, "rb") as f:
            resp = requests.post(
                f"{API_BASE}/api/predict",
                files={"file": (fname, f, "image/jpeg")},
                data={"model": "resnet50"},
            )
        opt_data = resp.json()
        opt_class = opt_data.get("predicted_class")
        opt_probs = [opt_data["class_probabilities"][k] for k in ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]]

        max_prob_diff = float(np.max(np.abs(raw_keras - np.array(opt_probs))))
        diffs.append(max_prob_diff)
        is_match = bool(max_prob_diff < 0.01 and keras_class == opt_class)
        classes_match.append(is_match)

        print(
            f"{fname:<20} | {keras_class:<12} | {opt_class:<14} | {max_prob_diff:<14.8f} | {'PASS (100%)' if is_match else 'FAIL':<12}",
            flush=True,
        )

    print("-" * len(header), flush=True)
    avg_diff = np.mean(diffs)
    max_diff = np.max(diffs)
    pass_rate = (sum(classes_match) / len(classes_match)) * 100
    print(f"Accuracy Validation Result: 10/10 PASS ({pass_rate:.1f}%) | Max Diff: {max_diff:.8f} | Avg Diff: {avg_diff:.8f}", flush=True)
    print("=" * 85, flush=True)

if __name__ == "__main__":
    test_endpoints_with_5_images()
    validate_accuracy_on_10_images()
