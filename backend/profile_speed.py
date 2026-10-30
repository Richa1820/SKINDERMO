"""
SKINDERMO — Diagnostic Speed & Latency Profiler (STEP 1)
Measures TensorFlow import, cold load, first prediction, warm predictions,
validation latency, GPU status, and hardware threading settings.
"""

import os
import sys
import time
import io
import numpy as np
from PIL import Image

# a) Measure time to import TensorFlow
t_import_start = time.perf_counter()
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess
t_import_end = time.perf_counter()
tf_import_ms = (t_import_end - t_import_start) * 1000

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from main import (
    validate_and_decode_image,
    check_dermoscopic_domain,
    preprocess_pil_image,
    MODEL_INPUT_SIZES,
    MODEL_FILES,
    MODELS_DIR,
    LABELS,
)


def run_profiler():
    print("=" * 85, flush=True)
    print("       SKINDERMO BENCHMARK & PERFORMANCE PROFILING REPORT (STEP 1)       ", flush=True)
    print("=" * 85, flush=True)

    # a) TensorFlow import time
    print(f"\n[a] TensorFlow Import Time: {tf_import_ms:.2f} ms", flush=True)

    # f) Hardware acceleration & Threading
    gpus = tf.config.list_physical_devices('GPU')
    cpus = tf.config.list_physical_devices('CPU')
    intra_threads = tf.config.threading.get_intra_op_parallelism_threads()
    inter_threads = tf.config.threading.get_inter_op_parallelism_threads()
    cpu_count = os.cpu_count()

    print(f"\n[f] Hardware Acceleration & Threading Settings:", flush=True)
    print(f"    - Physical GPUs detected: {len(gpus)} ({'None - TensorFlow runs on CPU natively on Windows' if len(gpus) == 0 else gpus})", flush=True)
    print(f"    - Physical CPUs detected: {len(cpus)} -> {cpus}", flush=True)
    print(f"    - System CPU Logical Processors: {cpu_count}", flush=True)
    print(f"    - TensorFlow Intra-Op Parallelism Threads: {intra_threads}", flush=True)
    print(f"    - TensorFlow Inter-Op Parallelism Threads: {inter_threads}", flush=True)

    # e) Image Validation, Domain Safeguard, and Resizing Benchmarks
    print("\n" + "-" * 85, flush=True)
    print(" [e] IMAGE INGESTION & PIPELINE BENCHMARKS", flush=True)
    print("-" * 85, flush=True)

    # 1. 5 MB Image
    w_5mb, h_5mb = 3200, 2400
    img_5mb = Image.new("RGB", (w_5mb, h_5mb), color=(190, 140, 120))
    arr_5mb = np.array(img_5mb)
    noise = np.random.randint(0, 35, (h_5mb, w_5mb, 3), dtype=np.uint8)
    arr_5mb = np.clip(arr_5mb.astype(np.int16) + noise.astype(np.int16), 0, 255).astype(np.uint8)
    arr_5mb[800:1600, 1000:2200, :] = [70, 40, 25]
    buf_5mb = io.BytesIO()
    Image.fromarray(arr_5mb).save(buf_5mb, format="JPEG", quality=95)
    bytes_5mb = buf_5mb.getvalue()
    actual_5mb_mb = len(bytes_5mb) / (1024 * 1024)

    t0 = time.perf_counter()
    v_5mb = validate_and_decode_image(bytes_5mb, "test_5mb.jpg")
    t_val_5mb = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    _, d_reason_5mb = check_dermoscopic_domain(v_5mb)
    t_dom_5mb = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    _ = preprocess_pil_image(v_5mb, (224, 224))
    t_res_5mb = (time.perf_counter() - t0) * 1000

    print(f"  • Typical ~5 MB Image ({actual_5mb_mb:.2f} MB, {w_5mb}x{h_5mb} px):", flush=True)
    print(f"      - Validation + Pre-downscale + Decode: {t_val_5mb:.2f} ms", flush=True)
    print(f"      - Cutaneous Domain Check:             {t_dom_5mb:.2f} ms", flush=True)
    print(f"      - Model Preprocessing Resize (224x224):{t_res_5mb:.2f} ms", flush=True)
    print(f"      - Total Ingestion Latency:             {(t_val_5mb + t_res_5mb):.2f} ms", flush=True)

    # 2. 4000x3000 Image
    w_4k, h_4k = 4000, 3000
    img_4k = Image.new("RGB", (w_4k, h_4k), color=(185, 135, 115))
    arr_4k = np.array(img_4k)
    arr_4k[1000:2000, 1200:2800, :] = [75, 45, 30]
    buf_4k = io.BytesIO()
    Image.fromarray(arr_4k).save(buf_4k, format="JPEG", quality=90)
    bytes_4k = buf_4k.getvalue()
    actual_4k_mb = len(bytes_4k) / (1024 * 1024)

    t0 = time.perf_counter()
    v_4k = validate_and_decode_image(bytes_4k, "test_4k.jpg")
    t_val_4k = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    _, d_reason_4k = check_dermoscopic_domain(v_4k)
    t_dom_4k = (time.perf_counter() - t0) * 1000

    t0 = time.perf_counter()
    _ = preprocess_pil_image(v_4k, (224, 224))
    t_res_4k = (time.perf_counter() - t0) * 1000

    print(f"\n  • 4000x3000 Mobile Camera Image ({actual_4k_mb:.2f} MB):", flush=True)
    print(f"      - Validation + Pre-downscale + Decode: {t_val_4k:.2f} ms", flush=True)
    print(f"      - Cutaneous Domain Check:             {t_dom_4k:.2f} ms", flush=True)
    print(f"      - Model Preprocessing Resize (224x224):{t_res_4k:.2f} ms", flush=True)
    print(f"      - Total Ingestion Latency:             {(t_val_4k + t_res_4k):.2f} ms", flush=True)

    # Model Inferences
    print("\n" + "-" * 85, flush=True)
    print(" [b, c, d] NEURAL NETWORK FORWARD PASS PROFILING", flush=True)
    print("-" * 85, flush=True)

    test_input_224 = np.zeros((1, 224, 224, 3), dtype=np.float32)
    test_input_299 = np.zeros((1, 299, 299, 3), dtype=np.float32)

    models_config = [
        ("ResNet-50", "resnet50_best.keras", "resnet50_best.tflite", (224, 224), {"preprocess_input": resnet_preprocess}),
        ("DenseNet-121", "densenet121_best.keras", "densenet121_best.tflite", (224, 224), {"preprocess_input": densenet_preprocess}),
        ("Inception-V3", "inceptionv3_best.keras", "inceptionv3_best.tflite", (299, 299), {}),
    ]

    report_rows = []

    for name, keras_file, tflite_file, target_size, custom_objs in models_config:
        keras_path = os.path.join(MODELS_DIR, keras_file)
        tflite_path = os.path.join(MODELS_DIR, tflite_file)
        test_input = test_input_299 if target_size[0] == 299 else test_input_224

        print(f"\nEvaluating Architecture: {name} ({keras_file})...", flush=True)

        # b) Cold model load
        t0 = time.perf_counter()
        if custom_objs:
            model = tf.keras.models.load_model(keras_path, custom_objects=custom_objs, compile=False, safe_mode=False)
        else:
            model = tf.keras.models.load_model(keras_path, compile=False, safe_mode=False)
        t_cold_load = (time.perf_counter() - t0) * 1000
        print(f"  [b] Cold Load Time:                       {t_cold_load:.2f} ms", flush=True)

        # c) First prediction time (includes tracing)
        t0 = time.perf_counter()
        _pred_eager = model(test_input, training=False)
        _ = _pred_eager.numpy()
        t_first_pred_eager = (time.perf_counter() - t0) * 1000
        print(f"  [c] 1st Prediction (TF Eager):            {t_first_pred_eager:.2f} ms", flush=True)

        # d) TFLite XNNPACK Accelerated Comparison (from STEP 2 / STEP 1 benchmark)
        t_tflite_cold_load = 0.0
        tflite_first_ms = 0.0
        tflite_warm_avg = 0.0
        if os.path.exists(tflite_path):
            t_tfl0 = time.perf_counter()
            interp = tf.lite.Interpreter(model_path=tflite_path, num_threads=4)
            interp.allocate_tensors()
            t_tflite_cold_load = (time.perf_counter() - t_tfl0) * 1000

            inp_idx = interp.get_input_details()[0]['index']
            out_idx = interp.get_output_details()[0]['index']

            t_tf1 = time.perf_counter()
            interp.set_tensor(inp_idx, test_input)
            interp.invoke()
            _ = interp.get_tensor(out_idx)
            tflite_first_ms = (time.perf_counter() - t_tf1) * 1000

            warm_times = []
            for _ in range(10):
                tw0 = time.perf_counter()
                interp.set_tensor(inp_idx, test_input)
                interp.invoke()
                _ = interp.get_tensor(out_idx)
                warm_times.append((time.perf_counter() - tw0) * 1000)
            tflite_warm_avg = float(np.mean(warm_times))

            print(f"  [*] TFLite Cold Load Time:                {t_tflite_cold_load:.2f} ms", flush=True)
            print(f"  [*] TFLite 1st Invoke Time:               {tflite_first_ms:.2f} ms", flush=True)
            print(f"  [d] 10 Warm Predictions Avg (TFLite CPU):  {tflite_warm_avg:.2f} ms", flush=True)

        report_rows.append({
            "name": name,
            "cold_load_keras": t_cold_load,
            "first_pred_keras": t_first_pred_eager,
            "warm_pred_keras_est": t_first_pred_eager * 0.9,
            "tflite_load": t_tflite_cold_load,
            "tflite_first": tflite_first_ms,
            "tflite_warm_avg": tflite_warm_avg,
        })

    print("\n" + "=" * 85, flush=True)
    print(" SUMMARY BENCHMARK COMPARISON TABLE (Milliseconds)", flush=True)
    print("=" * 85, flush=True)
    header = f"{'Model Architecture':<15} | {'Cold Load (Keras)':<18} | {'1st Pred (Keras)':<18} | {'TFLite Warm Avg':<16} | {'Speedup':<10}"
    print(header, flush=True)
    print("-" * len(header), flush=True)
    for r in report_rows:
        speedup = f"{r['first_pred_keras'] / max(r['tflite_warm_avg'], 1.0):.1f}x" if r['tflite_warm_avg'] > 0 else "N/A"
        print(
            f"{r['name']:<15} | {r['cold_load_keras']:<18.1f} | {r['first_pred_keras']:<18.1f} | {r['tflite_warm_avg']:<16.1f} | {speedup:<10}",
            flush=True,
        )
    print("=" * 85, flush=True)


if __name__ == "__main__":
    run_profiler()
