
"""
SKINDERMO — Deep Learning Dermoscopic Lesion Classification Backend
FastAPI inference API with four model options and InceptionV3 comparison.
"""

import os
import time
import io
from typing import Dict, Optional

import numpy as np
import tensorflow as tf
from PIL import Image

from fastapi import (
    FastAPI, UploadFile, File, Form, HTTPException, status
)
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.applications.resnet50 import (
    preprocess_input as resnet_preprocess
)
from tensorflow.keras.applications.densenet import (
    preprocess_input as densenet_preprocess
)


app = FastAPI(
    title="SKINDERMO Research Inference API",
    description="Seven-class HAM10000 image classification and model comparison.",
    version="1.1.0",
)

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

LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

MODEL_FILES = {
    "resnet50": "resnet50_best.keras",
    "densenet121": "densenet121_best.keras",
    "inceptionv3": "inceptionv3_best.keras",
    "inceptionv3_balanced": "inceptionv3_balanced_best.keras",
}

MODEL_INPUT_SIZES = {
    "resnet50": (224, 224),
    "densenet121": (224, 224),
    "inceptionv3": (299, 299),
    "inceptionv3_balanced": (299, 299),
}

LOADED_MODELS = {}


def normalize_model_name(model_name: str) -> str:
    key = model_name.lower().replace("-", "").replace("_", "")

    aliases = {
        "resnet": "resnet50",
        "resnet50": "resnet50",
        "dense": "densenet121",
        "densenet": "densenet121",
        "densenet121": "densenet121",
        "inception": "inceptionv3",
        "inceptionv3": "inceptionv3",
        "inceptionv3balanced": "inceptionv3_balanced",
        "balancedinceptionv3": "inceptionv3_balanced",
    }

    if key not in aliases:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported model '{model_name}'. Choose: {list(MODEL_FILES)}",
        )

    return aliases[key]


def get_model(model_name: str):
    """Load each model once and cache it."""
    norm_key = normalize_model_name(model_name)

    if norm_key in LOADED_MODELS:
        return norm_key, LOADED_MODELS[norm_key]

    filename = MODEL_FILES[norm_key]
    model_path = os.path.join(MODELS_DIR, filename)

    if not os.path.isfile(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model file not found: {model_path}",
        )

    try:
        print(f"[SKINDERMO] Loading {filename}...")

        if norm_key == "resnet50":
            keras_model = tf.keras.models.load_model(
                model_path,
                custom_objects={"preprocess_input": resnet_preprocess},
                compile=False,
                safe_mode=False,
            )
        elif norm_key == "densenet121":
            keras_model = tf.keras.models.load_model(
                model_path,
                custom_objects={"preprocess_input": densenet_preprocess},
                compile=False,
                safe_mode=False,
            )
        else:
            keras_model = tf.keras.models.load_model(
                model_path,
                compile=False,
                safe_mode=False,
            )

        if keras_model.output_shape[-1] != len(LABELS):
            raise ValueError(
                f"Expected 7 output classes; got {keras_model.output_shape}"
            )

        LOADED_MODELS[norm_key] = keras_model
        print(f"[SKINDERMO] Loaded {filename}")

        return norm_key, keras_model

    except HTTPException:
        raise
    except Exception as exc:
        print(f"[SKINDERMO ERROR] Could not load {filename}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not load model '{filename}': {str(exc)}",
        )


def preprocess_image(image_bytes: bytes, target_size: tuple) -> np.ndarray:
    """Decode an image and create a single-image tensor."""
    try:
        with Image.open(io.BytesIO(image_bytes)) as image:
            image = image.convert("RGB")
            image = image.resize(
                target_size, Image.Resampling.BILINEAR
            )
            array = np.asarray(image, dtype=np.float32)

        return np.expand_dims(array, axis=0)

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted image: {str(exc)}",
        )


def run_prediction(model_name: str, image_bytes: bytes) -> dict:
    """Run inference and return the seven class scores."""
    norm_key, keras_model = get_model(model_name)
    target_size = MODEL_INPUT_SIZES[norm_key]
    tensor = preprocess_image(image_bytes, target_size)

    start = time.perf_counter()

    try:
        raw = keras_model(tensor, training=False)
        scores = np.asarray(raw).reshape(-1)

        if len(scores) != len(LABELS):
            raise ValueError(f"Expected 7 scores, got {len(scores)}")

        if not np.all(np.isfinite(scores)):
            raise ValueError("Model returned non-finite scores")

        # This API assumes the models' final outputs are probabilities.
        # Verify the final activation in each saved model.
        if np.any(scores < 0) or np.any(scores > 1):
            raise ValueError(
                "Model outputs are not probabilities in [0, 1]. "
                "Verify the model's final activation."
            )

        if not np.isclose(np.sum(scores), 1.0, atol=0.02):
            raise ValueError(
                "Model scores do not sum approximately to 1. "
                "Verify the final activation before interpreting them "
                "as probabilities."
            )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction failed for {norm_key}: {str(exc)}",
        )

    elapsed_ms = round((time.perf_counter() - start) * 1000, 2)
    top_idx = int(np.argmax(scores))

    return {
        "model": norm_key,
        "predicted_class": LABELS[top_idx],
        "confidence": round(float(scores[top_idx]), 6),
        "class_probabilities": {
            label: round(float(score), 6)
            for label, score in zip(LABELS, scores)
        },
        "inference_time_ms": elapsed_ms,
        "input_shape": list(tensor.shape),
    }


@app.get("/")
@app.get("/api/health")
def health_check():
    available_files = (
        [
            name for name in os.listdir(MODELS_DIR)
            if name.endswith(".keras")
        ]
        if os.path.isdir(MODELS_DIR)
        else []
    )

    return {
        "status": "healthy",
        "service": "SKINDERMO Research Inference API",
        "available_model_files": available_files,
        "supported_models": list(MODEL_FILES.keys()),
        "loaded_models": list(LOADED_MODELS.keys()),
        "labels": LABELS,
    }


@app.post("/api/predict")
async def predict_lesion(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
    model: str = Form("resnet50"),
):
    """Predict using one selected model."""
    upload = file or image

    if upload is None:
        raise HTTPException(
            status_code=400,
            detail="Upload an image using 'file' or 'image'.",
        )

    image_bytes = await upload.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    result = run_prediction(model, image_bytes)
    result["timestamp"] = time.strftime(
        "%Y-%m-%dT%H:%M:%SZ", time.gmtime()
    )

    return result


@app.post("/api/compare")
async def compare_inception_models(
    file: Optional[UploadFile] = File(None),
    image: Optional[UploadFile] = File(None),
):
    """Compare original and balanced InceptionV3 predictions."""
    upload = file or image

    if upload is None:
        raise HTTPException(
            status_code=400,
            detail="Upload an image using 'file' or 'image'.",
        )

    image_bytes = await upload.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Uploaded image is empty.",
        )

    start = time.perf_counter()

    original = run_prediction("inceptionv3", image_bytes)
    balanced = run_prediction("inceptionv3_balanced", image_bytes)

    return {
        "predictions_agree": (
            original["predicted_class"] == balanced["predicted_class"]
        ),
        "results": {
            "inceptionv3": original,
            "inceptionv3_balanced": balanced,
        },
        "comparison_time_ms": round(
            (time.perf_counter() - start) * 1000, 2
        ),
        "note": (
            "Experimental research output only; not a medical diagnosis."
        ),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
