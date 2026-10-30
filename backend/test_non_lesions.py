import os
import sys
import time
import requests
import json

API_URL = "http://127.0.0.1:8000/api/predict"

non_lesion_paths = [
    ("pen", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\pen_test_photo_1793354979095.jpg"),
    ("notebook", r"d:\mini-project\SKINDERMO_WEBSITE\scratch\test_images\notebook.jpg"),
    ("face", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\face_test_photo_1793354997995.jpg"),
    ("hand", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\hand_test_photo_1793355023602.jpg"),
    ("object (mug)", r"C:\Users\richa\.gemini\antigravity-ide\brain\97646e99-e233-4f44-92f9-612ee13a7e0e\object_test_photo_1793355046098.jpg"),
]

print("=" * 80, flush=True)
print("TASK 7 - NON-LESION IMAGES TEST (pen, notebook, face, hand, object)", flush=True)
print("=" * 80, flush=True)

results = []
for name, path in non_lesion_paths:
    print(f"\nTesting '{name}' ({path})...", flush=True)
    if not os.path.exists(path):
        print(f"  ERROR: File not found at {path}", flush=True)
        continue
    
    t0 = time.perf_counter()
    with open(path, "rb") as f:
        files = {"file": (os.path.basename(path), f, "image/jpeg")}
        data = {"model": "inceptionv3"}
        resp = requests.post(API_URL, files=files, data=data, timeout=120)
    elapsed = (time.perf_counter() - t0) * 1000

    if resp.status_code != 200:
        err_detail = ""
        try:
            err_detail = resp.json().get("detail", resp.text)
        except Exception:
            err_detail = resp.text
        print(f"  [x] REJECTED (HTTP {resp.status_code}) in {elapsed:.1f}ms: {err_detail}", flush=True)
        results.append((name, "REJECTED", resp.status_code, err_detail, elapsed))
    else:
        d = resp.json()
        pred_cls = d.get("predicted_class")
        conf = d.get("confidence", 0.0)
        is_low = d.get("is_low_confidence", False)
        is_unc = d.get("is_uncertain", False)
        top3 = d.get("top_3_predictions", [])
        status_label = "UNCERTAIN" if (pred_cls == "uncertain" or is_unc or is_low) else "PREDICTED"
        print(f"  [x] HTTP 200 in {elapsed:.1f}ms -> Predicted: '{pred_cls}' (Conf: {conf*100:.2f}%, Top-1: {top3[0]['class'] if top3 else 'N/A'}, LowConf: {is_low}, Uncertain: {is_unc}) -> {status_label}", flush=True)
        results.append((name, status_label, 200, f"class={pred_cls}, conf={conf*100:.1f}%", elapsed))

print("\n" + "=" * 80, flush=True)
print("NON-LESION TEST SUMMARY TABLE", flush=True)
print("=" * 80, flush=True)
print(f"{'Image':<15} | {'Status':<12} | {'HTTP Code':<10} | {'Latency':<10} | {'Details'}", flush=True)
print("-" * 80, flush=True)
for name, st, code, det, lat in results:
    print(f"{name:<15} | {st:<12} | {code:<10} | {lat:<8.1f}ms | {det[:50]}", flush=True)

uncertain_or_rejected = sum(1 for _, st, _, _, _ in results if st in ["REJECTED", "UNCERTAIN"])
print(f"\nFinal Non-Lesion Verdict: {uncertain_or_rejected}/{len(results)} images were flagged as UNCERTAIN or REJECTED!", flush=True)
print("=" * 80, flush=True)
