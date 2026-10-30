import time
import requests
import json

url = "http://127.0.0.1:8000/api/predict"
img_path = r"d:\mini-project\SKINDERMO_WEBSITE\scratch\test_images\ham_test.jpg"

print(f"Opening {img_path}...", flush=True)
with open(img_path, "rb") as f:
    files = {"file": ("ham_test.jpg", f, "image/jpeg")}
    data = {"model": "inceptionv3"}
    print(f"Sending POST to {url}...", flush=True)
    t0 = time.perf_counter()
    resp = requests.post(url, files=files, data=data, timeout=120)
    elapsed = time.perf_counter() - t0
    print(f"Received response {resp.status_code} in {elapsed:.2f}s", flush=True)
    print("Response JSON:")
    print(json.dumps(resp.json(), indent=2))
