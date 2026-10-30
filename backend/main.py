"""
SKINDERMO — Deep Learning Dermoscopic Lesion Classification Backend
FastAPI server serving Inception-V3 (and active models configured in config.json)
Trained on HAM10000 7-class diagnostic benchmark.
Highly optimized for CPU latency via tf.function graphs, PIL BILINEAR resizing,
and exif_transpose orientation handling.
"""

import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
import io
import time
import json
from typing import Dict, Optional, List
from contextlib import asynccontextmanager
from concurrent.futures import ThreadPoolExecutor, as_completed
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image, ImageOps
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")
CONFIG_PATH = os.path.join(BASE_DIR, "config.json")

# 1. Load active models & threshold configuration
def load_app_config():
    default_cfg = {
        "active_models": ["inceptionv3"],
        "confidence_threshold": 0.5,
    }
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as _cf:
                data = json.load(_cf)
                active = data.get("active_models", ["inceptionv3"])
                conf = float(data.get("confidence_threshold", 0.5))
                print(f"[SKINDERMO CONFIG] Loaded config from {CONFIG_PATH}: active_models={active}, confidence_threshold={conf}")
                return {"active_models": active, "confidence_threshold": conf}
        except Exception as _ce:
            print(f"[SKINDERMO CONFIG WARNING] Failed reading {CONFIG_PATH}: {_ce}. Using defaults.")
    return default_cfg

APP_CONFIG = load_app_config()
ACTIVE_MODELS: List[str] = APP_CONFIG["active_models"]
CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", str(APP_CONFIG["confidence_threshold"])))
ALL_SUPPORTED_MODELS = ["resnet50", "densenet121", "inceptionv3"]
INACTIVE_MODELS = [m for m in ALL_SUPPORTED_MODELS if m not in ACTIVE_MODELS]

# 2. Output classes dynamically loaded from trained labels.json (fallback if != 7 entries)
LABELS_PATH = os.path.join(MODELS_DIR, "labels.json")
HARDCODED_LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]
LABELS = HARDCODED_LABELS
if os.path.exists(LABELS_PATH):
    try:
        with open(LABELS_PATH, "r", encoding="utf-8") as _lf:
            loaded_labels = json.load(_lf)
        if isinstance(loaded_labels, list) and len(loaded_labels) == 7:
            LABELS = loaded_labels
            print(f"[SKINDERMO] Loaded 7 classes from {LABELS_PATH}: {LABELS}")
        else:
            print(f"[SKINDERMO WARNING] labels.json does not contain exactly 7 entries ({loaded_labels}). Falling back to default: {HARDCODED_LABELS}")
    except Exception as _le:
        print(f"[SKINDERMO WARNING] Failed reading labels.json: {_le}. Falling back to default: {HARDCODED_LABELS}")
else:
    print(f"[SKINDERMO WARNING] labels.json not found in {MODELS_DIR}. Falling back to default: {HARDCODED_LABELS}")

MODEL_FILES = {
    "resnet50": "resnet50_best.keras",
    "densenet121": "densenet121_best.keras",
    "inceptionv3": "inceptionv3_best.keras",
}

MODEL_INPUT_SIZES = {
    "resnet50": (224, 224),
    "densenet121": (224, 224),
    "inceptionv3": (299, 299),
}

MODEL_DISPLAY_NAMES = {
    "resnet50": "ResNet-50",
    "densenet121": "DenseNet-121",
    "inceptionv3": "Inception-V3",
}

# Cache for loaded Keras models & compiled tf.functions (ONLY active models loaded!)
LOADED_MODELS = {}
COMPILED_INFERENCE_FUNCS = {}
MODELS_READY = False

# Dedicated ThreadPoolExecutor for active model inference
ENSEMBLE_POOL = ThreadPoolExecutor(max_workers=max(len(ACTIVE_MODELS), 1), thread_name_prefix="SkindermoInference")


def get_model(model_name: str):
    """
    Lazy-loads Keras model from backend/models/ ONLY if model is in ACTIVE_MODELS.
    Inactive models are strictly blocked from loading to prevent running collapsed models.
    """
    key = model_name.lower().replace("-", "").replace("_", "")
    if "resnet" in key:
        norm_key = "resnet50"
    elif "dense" in key:
        norm_key = "densenet121"
    elif "inception" in key:
        norm_key = "inceptionv3"
    else:
        norm_key = ACTIVE_MODELS[0] if ACTIVE_MODELS else "inceptionv3"

    if norm_key not in ACTIVE_MODELS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Model '{norm_key}' is not active. Currently active models: {ACTIVE_MODELS}. Inactive models: {INACTIVE_MODELS}",
        )

    if norm_key in LOADED_MODELS:
        return norm_key, LOADED_MODELS[norm_key]

    filename = MODEL_FILES.get(norm_key, f"{norm_key}_best.keras")
    model_path = os.path.join(MODELS_DIR, filename)

    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model weights file '{filename}' was not found in '{MODELS_DIR}'.",
        )

    try:
        print(f"[SKINDERMO] Loading Keras model '{norm_key}' from {model_path}...", flush=True)
        if norm_key == "resnet50":
            model = tf.keras.models.load_model(
                model_path,
                custom_objects={"preprocess_input": resnet_preprocess},
                compile=False,
                safe_mode=False,
            )
        elif norm_key == "densenet121":
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

        LOADED_MODELS[norm_key] = model
        print(f"[SKINDERMO] Successfully loaded {filename}", flush=True)
        return norm_key, model
    except Exception as e:
        print(f"[SKINDERMO ERROR] Failed to load model '{filename}': {str(e)}", flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load model '{filename}': {str(e)}",
        )


def get_compiled_infer_fn(norm_key: str, keras_model):
    """
    Returns a cached tf.function-compiled forward pass with a fixed input signature.
    Prevents repeated graph re-tracing and minimizes CPU Python dispatch overhead.
    """
    if norm_key in COMPILED_INFERENCE_FUNCS:
        return COMPILED_INFERENCE_FUNCS[norm_key]

    target_size = MODEL_INPUT_SIZES.get(norm_key, (299, 299) if norm_key == "inceptionv3" else (224, 224))
    spec = tf.TensorSpec(shape=(1, target_size[0], target_size[1], 3), dtype=tf.float32)

    @tf.function(input_signature=[spec])
    def _forward(tensor):
        return keras_model(tensor, training=False)

    COMPILED_INFERENCE_FUNCS[norm_key] = _forward
    return _forward


def warmup_all_models():
    """
    Loads only active models listed in config.json and executes
    a warm-up forward pass on dummy tensors so first user request has minimal latency.
    Inactive models are NOT loaded into memory.
    """
    global MODELS_READY
    warmup_start = time.perf_counter()
    print(f"[SKINDERMO] Server startup: Pre-loading active models {ACTIVE_MODELS}...", flush=True)

    for key in ACTIVE_MODELS:
        t0 = time.perf_counter()
        target_size = MODEL_INPUT_SIZES.get(key, (299, 299))
        dummy_tensor = np.zeros((1, target_size[0], target_size[1], 3), dtype=np.float32)

        try:
            norm_key, model = get_model(key)
            infer_fn = get_compiled_infer_fn(norm_key, model)
            _ = infer_fn(tf.constant(dummy_tensor, dtype=tf.float32))
            elapsed = (time.perf_counter() - t0) * 1000
            print(f"[SKINDERMO] {norm_key} (Keras tf.function) warmed up in {elapsed:.1f}ms", flush=True)
        except Exception as e:
            print(f"[SKINDERMO ERROR] Warmup failed for {key}: {e}", flush=True)

    MODELS_READY = all(k in LOADED_MODELS for k in ACTIVE_MODELS)
    print(
        f"[SKINDERMO] Active models ready: {MODELS_READY} ({len(LOADED_MODELS)}/{len(ACTIVE_MODELS)} loaded, "
        f"total startup: {(time.perf_counter() - warmup_start)*1000:.1f}ms)",
        flush=True,
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load and warm up active models once
    warmup_all_models()
    yield
    # Shutdown: Release model resources
    print("[SKINDERMO] Server shutting down, clearing models...", flush=True)
    LOADED_MODELS.clear()
    COMPILED_INFERENCE_FUNCS.clear()
    ENSEMBLE_POOL.shutdown(wait=False)


app = FastAPI(
    title="SKINDERMO Research Inference API",
    description="Academic research backend for dermoscopic skin lesion image classification across 7 HAM10000 classes.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for frontend Vite dev server (port 5173 and localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def validate_and_decode_image(image_bytes: bytes, filename: Optional[str] = None) -> Image.Image:
    """
    Rigorously validates uploaded file bytes before any model inference:
    1. Checks for non-empty payload and size bounds (max 25MB).
    2. Inspects magic bytes to detect and reject video files.
    3. Inspects magic bytes to reject non-image files.
    4. Probes file integrity using PIL Image.verify().
    5. Checks format against allowed raster types: JPEG, PNG, WEBP, BMP, TIFF.
    6. Respects EXIF orientation tags via ImageOps.exif_transpose.
    7. Evaluates dermoscopic domain chromaticity and texture.
    """
    if not image_bytes or len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes). Please upload a valid image file.",
        )

    if len(image_bytes) > 25 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 25 MB maximum upload limit.",
        )

    # 1. Video magic-byte detection
    is_mp4 = (len(image_bytes) >= 8 and image_bytes[4:8] == b"ftyp") or (b"moov" in image_bytes[:1024])
    is_avi = len(image_bytes) >= 12 and image_bytes[:4] == b"RIFF" and image_bytes[8:12] == b"AVI "
    is_mkv = len(image_bytes) >= 4 and image_bytes[:4] == b"\x1a\x45\xdf\xa3"
    is_mpeg = len(image_bytes) >= 4 and image_bytes[:3] == b"\x00\x00\x01"

    if is_mp4 or is_avi or is_mkv or is_mpeg:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Video files are not supported. SKINDERMO requires a static 2D dermoscopic photograph (JPEG, PNG, WEBP, BMP, or TIFF).",
        )

    # 2. Non-image file signatures
    if image_bytes.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF documents are not supported. Please upload a raster dermoscopic image.",
        )
    if image_bytes.startswith(b"PK\x03\x04"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ZIP archives and compressed containers are not supported. Please upload an image directly.",
        )
    if image_bytes.startswith(b"MZ") or image_bytes.startswith(b"\x7fELF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Binary executable files are strictly rejected.",
        )

    # 3. Structural verification with PIL Image.verify()
    try:
        with Image.open(io.BytesIO(image_bytes)) as probe:
            detected_format = (probe.format or "").upper()
            probe.verify()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Corrupted or undecodable image file: {str(e)}.",
        )

    ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP", "BMP", "TIFF"}
    if detected_format not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{detected_format}'. Supported formats are: JPEG, PNG, WEBP, BMP, and TIFF.",
        )

    # 4. Pixel decoding, dimension validation, and early downscaling
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # Correct orientation if EXIF metadata exists
        img = ImageOps.exif_transpose(img)

        if detected_format == "JPEG":
            try:
                img.draft("RGB", (1024, 1024))
            except Exception:
                pass

        w, h = img.size
        if w < 32 or h < 32:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image resolution ({w}x{h} px) is too small for dermoscopic feature extraction. Minimum required resolution is 32x32 pixels.",
            )
        if w > 10000 or h > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Image resolution ({w}x{h} px) exceeds the 10,000x10,000 pixel safe processing limit.",
            )

        if max(w, h) > 1024:
            img.thumbnail((1024, 1024), Image.Resampling.BILINEAR)

        rgb_img = img.convert("RGB")
        rgb_img.load()

        # 5. Image-domain safeguard
        is_valid_domain, domain_reason = check_dermoscopic_domain(rgb_img)
        if not is_valid_domain:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This image could not be verified as a supported dermoscopic skin-lesion image. Please upload a suitable image. ({domain_reason})",
            )

        return rgb_img
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to decode image raster data into RGB pixels: {str(e)}",
        )


def check_dermoscopic_domain(pil_img: Image.Image) -> tuple[bool, str]:
    """
    Evaluates whether an uploaded image possesses basic cutaneous/dermoscopic
    chromaticity and texture distributions, or is clearly an unrelated non-skin scene.
    """
    sample = pil_img.resize((128, 128), Image.Resampling.BILINEAR)
    arr = np.array(sample, dtype=np.float32)

    # 1. Uniformity / Blank / Synthetic Fill Check
    channel_stds = np.std(arr, axis=(0, 1))
    if np.all(channel_stds < 6.0):
        return False, "Image has near-zero spatial variation (blank, solid fill, or uniform pattern)."

    # Convert to HSV (H: 0-255, S: 0-255, V: 0-255)
    hsv = np.array(sample.convert("HSV"), dtype=np.float32)
    s = hsv[:, :, 1]
    v = hsv[:, :, 2]

    total_pixels = 128 * 128

    # 2. Desaturation / Document / Notebook / Paper Check
    desaturated_pixels = np.sum((s < 28) | (v < 25))
    desaturated_fraction = desaturated_pixels / total_pixels

    white_paper_pixels = np.sum((v > 160) & (s < 35))
    white_paper_fraction = white_paper_pixels / total_pixels

    median_saturation = float(np.median(s))

    if white_paper_fraction > 0.65 and median_saturation < 38.0:
        return False, "Image appears to be paper, a document, or notebook page rather than skin tissue."

    if desaturated_fraction > 0.82:
        return False, "Image is predominantly grayscale or monochromatic text/document structure."

    # 3. Cutaneous Chromaticity Ratio
    mean_r = float(np.mean(arr[:, :, 0]))
    mean_g = float(np.mean(arr[:, :, 1]))
    mean_b = float(np.mean(arr[:, :, 2]))

    if mean_g > (mean_r * 1.55) and mean_g > 65.0:
        return False, "Image color spectrum is dominated by green tones inconsistent with human cutaneous tissue."

    if mean_b > (mean_r * 1.55) and mean_b > 65.0:
        return False, "Image color spectrum is dominated by blue tones inconsistent with human cutaneous tissue."

    return True, "Valid dermoscopic visual characteristics detected."


def preprocess_pil_image(image: Image.Image, target_size: tuple[int, int]) -> np.ndarray:
    """
    TASK 3 - Matches the retrained InceptionV3 model specification:
    1. Applies ImageOps.exif_transpose before resizing to ensure correct orientation.
    2. Resizes image to native target size (299x299 for InceptionV3) with PIL BILINEAR resampling.
    3. Converts to raw 0-255 float32 numpy array with batch dimension (1, H, W, 3).
       (The model has an embedded Rescaling layer that normalizes internally).
    """
    transposed = ImageOps.exif_transpose(image)
    rgb_img = transposed.convert("RGB")
    resized = rgb_img.resize(target_size, Image.Resampling.BILINEAR)
    img_array = np.array(resized, dtype=np.float32)
    return np.expand_dims(img_array, axis=0)


def compute_uncertainty_metrics(probabilities_vec: list) -> dict:
    """
    Computes rigorous uncertainty and distribution metrics on the 7-class softmax vector:
    1. Shannon Entropy: H(p) = -sum(p_i * log2(p_i)).
       Normalized Shannon Entropy: H_norm(p) = H(p) / log2(7) in [0, 1].
    2. Prediction Margin: Delta = p_(1) - p_(2) (gap between top-1 and top-2 classes).
    3. Uncertainty Synthesis: An image is flagged as uncertain if entropy is elevated (> 0.70)
       or top-2 margin is narrow (< 0.15).
    """
    probs = np.array(probabilities_vec, dtype=np.float64)
    eps = 1e-12
    safe_probs = np.clip(probs, eps, 1.0)
    safe_probs = safe_probs / np.sum(safe_probs)

    # Shannon Entropy
    entropy = float(-np.sum(safe_probs * np.log2(safe_probs)))
    max_entropy = float(np.log2(len(LABELS)))  # log2(7) ~ 2.80735
    normalized_entropy = float(round(entropy / max_entropy, 4))
    entropy = float(round(entropy, 4))

    # Sorted probabilities
    sorted_indices = np.argsort(probs)[::-1]
    top_idx = int(sorted_indices[0])
    second_idx = int(sorted_indices[1]) if len(sorted_indices) > 1 else top_idx

    top_conf = float(probs[top_idx])
    second_conf = float(probs[second_idx])
    margin = float(round(top_conf - second_conf, 4))

    uncertainty_reasons = []
    if normalized_entropy > 0.70:
        uncertainty_reasons.append(
            f"High prediction entropy ({normalized_entropy:.2f} / 1.00) indicates significant probability dispersion across multiple classes."
        )
    if margin < 0.15:
        uncertainty_reasons.append(
            f"Narrow margin ({margin * 100:.1f}%) between top class '{LABELS[top_idx]}' and runner-up '{LABELS[second_idx]}' ({second_conf * 100:.1f}%)."
        )

    is_uncertain = bool((normalized_entropy > 0.70) or (margin < 0.15))

    return {
        "entropy": entropy,
        "normalized_entropy": normalized_entropy,
        "margin": margin,
        "top_class": LABELS[top_idx],
        "second_class": LABELS[second_idx],
        "second_confidence": second_conf,
        "is_uncertain": is_uncertain,
        "reasons": uncertainty_reasons,
    }


@app.get("/")
@app.get("/api/health")
def health_check():
    """
    TASK 4 - Health check endpoint returning active_models and inactive_models.
    """
    available_files = []
    if os.path.exists(MODELS_DIR):
        available_files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".keras")]

    return {
        "status": "healthy",
        "service": "SKINDERMO Research Inference API",
        "models_ready": MODELS_READY,
        "models_dir": MODELS_DIR,
        "active_models": ACTIVE_MODELS,
        "inactive_models": INACTIVE_MODELS,
        "available_keras_files": available_files,
        "supported_models": ALL_SUPPORTED_MODELS,
        "loaded_models": list(LOADED_MODELS.keys()),
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "labels": LABELS,
    }


def run_single_inference(norm_key: str, pil_image: Image.Image) -> dict:
    """
    Executes forward pass for a single active model on the pre-validated PIL RGB image.
    Uses cached tf.function graph.
    Returns prediction metrics, probabilities, and top-3 candidates.
    """
    target_size = MODEL_INPUT_SIZES.get(norm_key, (299, 299) if norm_key == "inceptionv3" else (224, 224))
    tensor = preprocess_pil_image(pil_image, target_size)

    inference_start = time.perf_counter()
    norm_key, keras_model = get_model(norm_key)
    infer_fn = get_compiled_infer_fn(norm_key, keras_model)
    raw_preds = infer_fn(tf.constant(tensor, dtype=tf.float32))
    probabilities_vec = np.squeeze(raw_preds.numpy() if hasattr(raw_preds, "numpy") else np.array(raw_preds)).tolist()
    inference_time_ms = round((time.perf_counter() - inference_start) * 1000, 2)

    class_probs: Dict[str, float] = {}
    for idx, label in enumerate(LABELS):
        score = float(probabilities_vec[idx]) if idx < len(probabilities_vec) else 0.0
        class_probs[label] = round(score, 6)

    sorted_indices = np.argsort(probabilities_vec)[::-1]
    top_idx = int(sorted_indices[0])
    raw_predicted_class = LABELS[top_idx]
    raw_confidence = float(class_probs[raw_predicted_class])

    # Top-3 predictions
    top_3 = [
        {
            "class": LABELS[i],
            "confidence": round(float(probabilities_vec[i]), 6),
            "percentage": round(float(probabilities_vec[i]) * 100, 2),
            "rank": rank + 1,
        }
        for rank, i in enumerate(sorted_indices[:3])
    ]

    # TASK 6: Low-confidence logic
    is_low_conf = raw_confidence < CONFIDENCE_THRESHOLD
    predicted_class = "uncertain" if is_low_conf else raw_predicted_class

    return {
        "model": norm_key,
        "name": MODEL_DISPLAY_NAMES.get(norm_key, norm_key),
        "probabilities_vec": probabilities_vec,
        "class_probabilities": class_probs,
        "raw_predicted_class": raw_predicted_class,
        "predicted_class": predicted_class,
        "confidence": raw_confidence,
        "top_3_predictions": top_3,
        "is_low_confidence": is_low_conf,
        "inference_time_ms": inference_time_ms,
        "input_shape": list(tensor.shape),
        "engine": "keras_tf_function",
    }


def run_ensemble_inference(pil_image: Image.Image, validation_ms: float = 0.0) -> dict:
    """
    TASK 4 - Runs ONLY the models listed in active_models.
    Averages only those models. If only one model is active, the ensemble equals that model.
    Consensus text does not mention inactive models.
    """
    server_start_time = time.perf_counter()
    models_to_run = [m for m in ACTIVE_MODELS]
    if not models_to_run:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="No models are currently configured as active in config.json.",
        )

    individual_results = {}
    if len(models_to_run) == 1:
        m = models_to_run[0]
        individual_results[m] = run_single_inference(m, pil_image)
    else:
        futures = {
            ENSEMBLE_POOL.submit(run_single_inference, m, pil_image): m
            for m in models_to_run
        }
        for f in as_completed(futures):
            m = futures[f]
            individual_results[m] = f.result()

    # Soft-voting arithmetic average probability vector across active models
    all_prob_vecs = [individual_results[m]["probabilities_vec"] for m in models_to_run]
    ensemble_prob_vec = np.mean(all_prob_vecs, axis=0).tolist()

    ensemble_class_probs: Dict[str, float] = {}
    for idx, label in enumerate(LABELS):
        ensemble_class_probs[label] = round(float(ensemble_prob_vec[idx]), 6)

    sorted_indices = np.argsort(ensemble_prob_vec)[::-1]
    ensemble_top_idx = int(sorted_indices[0])
    raw_ensemble_class = LABELS[ensemble_top_idx]
    ensemble_confidence = float(ensemble_class_probs[raw_ensemble_class])

    top_3 = [
        {
            "class": LABELS[i],
            "confidence": round(float(ensemble_prob_vec[i]), 6),
            "percentage": round(float(ensemble_prob_vec[i]) * 100, 2),
            "rank": rank + 1,
        }
        for rank, i in enumerate(sorted_indices[:3])
    ]

    # TASK 6: Low-confidence logic
    is_low_conf = ensemble_confidence < CONFIDENCE_THRESHOLD
    ensemble_predicted_class = "uncertain" if is_low_conf else raw_ensemble_class

    # Consensus analysis (only across active models)
    individual_preds = [individual_results[m]["raw_predicted_class"] for m in models_to_run]
    unique_preds = set(individual_preds)

    if len(models_to_run) == 1:
        consensus_agreement = "unanimous"
        models_agree = True
        models_disagree = False
    elif len(unique_preds) == 1:
        consensus_agreement = "unanimous"
        models_agree = True
        models_disagree = False
    elif len(unique_preds) < len(models_to_run):
        consensus_agreement = "majority"
        models_agree = False
        models_disagree = True
    else:
        consensus_agreement = "discordant"
        models_agree = False
        models_disagree = True

    # Uncertainty metrics
    uncertainty = compute_uncertainty_metrics(ensemble_prob_vec)
    if is_low_conf:
        uncertainty["is_uncertain"] = True
        uncertainty["reasons"].append(
            f"Confidence score ({ensemble_confidence * 100:.1f}%) is below the defined threshold ({CONFIDENCE_THRESHOLD * 100:.1f}%)."
        )

    # Disagreement reason (mentions ONLY active models)
    if models_disagree and len(models_to_run) > 1:
        uncertainty["is_uncertain"] = True
        active_breakdown = ", ".join(
            f"{MODEL_DISPLAY_NAMES.get(m, m)}={individual_results[m]['raw_predicted_class']}"
            for m in models_to_run
        )
        uncertainty["reasons"].append(
            f"Model disagreement detected: active architectures predicted divergent classes: {active_breakdown}."
        )

    server_process_ms = round((time.perf_counter() - server_start_time) * 1000, 2)
    wall_clock_inference_ms = round(max(r["inference_time_ms"] for r in individual_results.values()), 2)
    sum_individual_inference_ms = round(sum(r["inference_time_ms"] for r in individual_results.values()), 2)

    warning_message = (
        "SCOPE LIMITATION & OUT-OF-DISTRIBUTION ADVISORY: "
        f"This evaluation was performed strictly on seven HAM10000 pigmented skin lesion classes "
        f"({', '.join(LABELS)}). A closed-set model CANNOT reliably classify unsupported "
        f"conditions such as ringworm (tinea corporis), eczema, psoriasis, fungal infections, or rashes. "
        f"Because softmax normalizes outputs across the seven classes to sum to 100%, unsupported images "
        f"will still be force-assigned to one of the seven classes. High confidence or agreement "
        f"does NOT prove that an image belongs to the predicted category. "
        f"This experimental research output is NOT a confirmed medical diagnosis."
    )

    return {
        "model": "ensemble" if len(models_to_run) > 1 else models_to_run[0],
        "active_models": models_to_run,
        "ensemble_method": "soft_voting_average" if len(models_to_run) > 1 else "single_active_model",
        "raw_predicted_class": raw_ensemble_class,
        "predicted_class": ensemble_predicted_class,
        "confidence": ensemble_confidence,
        "top_3_predictions": top_3,
        "is_low_confidence": is_low_conf,
        "is_uncertain": uncertainty["is_uncertain"] or is_low_conf,
        "is_supported": None,
        "domain_status": "unverified_closed_set",
        "consensus_agreement": consensus_agreement,
        "models_agree": models_agree,
        "models_disagree": models_disagree,
        "individual_predictions": {
            m: {
                "model_id": m,
                "name": MODEL_DISPLAY_NAMES.get(m, m),
                "raw_predicted_class": individual_results[m]["raw_predicted_class"],
                "predicted_class": individual_results[m]["predicted_class"],
                "confidence": individual_results[m]["confidence"],
                "class_probabilities": individual_results[m]["class_probabilities"],
                "inference_time_ms": individual_results[m]["inference_time_ms"],
            }
            for m in models_to_run
        },
        "uncertainty_metrics": uncertainty,
        "warning": warning_message,
        "class_probabilities": ensemble_class_probs,
        "inference_time_ms": wall_clock_inference_ms,
        "model_inference_ms": wall_clock_inference_ms,
        "sum_cpu_inference_ms": sum_individual_inference_ms,
        "server_process_ms": server_process_ms,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


@app.post("/api/predict")
def predict_lesion(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    model: str = Form("inceptionv3"),
):
    """
    Main inference endpoint:
    Accepts multipart/form-data upload of an image.
    Always routes through active_models to protect demo from inactive collapsed models.
    """
    upload = file or image
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please send 'file' or 'image' multipart field.",
        )

    t_read_start = time.perf_counter()
    image_bytes = upload.file.read()
    read_upload_ms = round((time.perf_counter() - t_read_start) * 1000, 2)

    # Pre-validation & image decoding
    t_val_start = time.perf_counter()
    pil_image = validate_and_decode_image(image_bytes, upload.filename)
    validation_ms = round((time.perf_counter() - t_val_start) * 1000, 2)

    # Check model request
    model_choice = model.lower().strip().replace("-", "").replace("_", "")
    if model_choice in ["ensemble", "all", "trimodel"] or len(ACTIVE_MODELS) == 1:
        return run_ensemble_inference(pil_image, validation_ms=validation_ms)

    # If a specific active model is requested and multiple models are active:
    if model_choice in ACTIVE_MODELS:
        single_res = run_single_inference(model_choice, pil_image)
        uncertainty = compute_uncertainty_metrics(single_res["probabilities_vec"])
        is_low_conf = single_res["is_low_confidence"]
        if is_low_conf:
            uncertainty["is_uncertain"] = True
            uncertainty["reasons"].append(
                f"Confidence score ({single_res['confidence'] * 100:.1f}%) is below the defined threshold ({CONFIDENCE_THRESHOLD * 100:.1f}%)."
            )

        return {
            "model": single_res["model"],
            "raw_predicted_class": single_res["raw_predicted_class"],
            "predicted_class": single_res["predicted_class"],
            "confidence": single_res["confidence"],
            "top_3_predictions": single_res["top_3_predictions"],
            "is_low_confidence": is_low_conf,
            "is_uncertain": uncertainty["is_uncertain"] or is_low_conf,
            "is_supported": None,
            "domain_status": "unverified_closed_set",
            "consensus_agreement": "unanimous",
            "models_agree": True,
            "models_disagree": False,
            "individual_predictions": {
                single_res["model"]: {
                    "model_id": single_res["model"],
                    "name": MODEL_DISPLAY_NAMES.get(single_res["model"], single_res["model"]),
                    "raw_predicted_class": single_res["raw_predicted_class"],
                    "predicted_class": single_res["predicted_class"],
                    "confidence": single_res["confidence"],
                    "class_probabilities": single_res["class_probabilities"],
                    "inference_time_ms": single_res["inference_time_ms"],
                }
            },
            "uncertainty_metrics": uncertainty,
            "warning": (
                "SCOPE LIMITATION & OUT-OF-DISTRIBUTION ADVISORY: "
                f"This model was evaluated strictly on seven HAM10000 pigmented skin lesion classes ({', '.join(LABELS)}). "
                f"This experimental research output is NOT a confirmed medical diagnosis."
            ),
            "class_probabilities": single_res["class_probabilities"],
            "inference_time_ms": single_res["inference_time_ms"],
            "model_inference_ms": single_res["inference_time_ms"],
            "sum_cpu_inference_ms": single_res["inference_time_ms"],
            "server_process_ms": single_res["inference_time_ms"] + validation_ms,
            "input_shape": single_res["input_shape"],
            "confidence_threshold": CONFIDENCE_THRESHOLD,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }

    # If an inactive model was requested, automatically fallback to active models
    print(f"[SKINDERMO] Model '{model}' is inactive. Routing to active models: {ACTIVE_MODELS}", flush=True)
    return run_ensemble_inference(pil_image, validation_ms=validation_ms)


@app.post("/api/ensemble")
def predict_ensemble(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """
    Dedicated ensemble endpoint:
    Runs ONLY the active models specified in config.json.
    """
    upload = file or image
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please send 'file' or 'image' multipart field.",
        )

    image_bytes = upload.file.read()
    t_val_start = time.perf_counter()
    pil_image = validate_and_decode_image(image_bytes, upload.filename)
    validation_ms = round((time.perf_counter() - t_val_start) * 1000, 2)

    return run_ensemble_inference(pil_image, validation_ms=validation_ms)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
