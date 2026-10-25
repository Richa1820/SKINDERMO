"""
SKINDERMO — Deep Learning Dermoscopic Lesion Classification Backend
FastAPI server serving ResNet-50, DenseNet-121, and Inception-V3 models
Trained on HAM10000 7-class diagnostic benchmark.
"""

import os
import time
from typing import Dict, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image
import io
import tensorflow as tf
from tensorflow.keras.applications.resnet50 import preprocess_input as resnet_preprocess
from tensorflow.keras.applications.densenet import preprocess_input as densenet_preprocess

app = FastAPI(
    title="SKINDERMO Research Inference API",
    description="Academic research backend for dermoscopic skin lesion image classification across 7 HAM10000 classes.",
    version="1.0.0",
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

# 7 Output classes in exact trained dataset order
LABELS = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]

# Model configurations
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILES = {
    "resnet50": "resnet50_best.keras",
    "densenet121": "densenet121_best.keras",
    "inceptionv3": "inceptionv3_best.keras",
}

# Native spatial resolutions
MODEL_INPUT_SIZES = {
    "resnet50": (224, 224),
    "densenet121": (224, 224),
    "inceptionv3": (299, 299),
}

# Cache for loaded Keras models
LOADED_MODELS = {}


def get_model(model_name: str):
    """
    Lazy-loads Keras model from backend/models/ with custom_objects
    for deserializing Lambda layer functions (resnet_preprocess / densenet_preprocess).
    """
    key = model_name.lower().replace("-", "").replace("_", "")
    if "resnet" in key:
        norm_key = "resnet50"
    elif "dense" in key:
        norm_key = "densenet121"
    elif "inception" in key:
        norm_key = "inceptionv3"
    else:
        norm_key = "resnet50"

    filename = MODEL_FILES.get(norm_key, "resnet50_best.keras")
    model_path = os.path.join(MODELS_DIR, filename)

    if norm_key in LOADED_MODELS:
        return norm_key, LOADED_MODELS[norm_key]

    if not os.path.exists(model_path):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                f"Model weights file '{filename}' was not found in '{MODELS_DIR}'. "
                f"Please ensure '{filename}' is placed inside the 'backend/models/' folder."
            ),
        )

    try:
        print(f"[SKINDERMO] Loading Keras model: {model_path}...")
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
            # InceptionV3 has preprocessing embedded in its model
            model = tf.keras.models.load_model(
                model_path,
                compile=False,
                safe_mode=False,
            )

        LOADED_MODELS[norm_key] = model
        print(f"[SKINDERMO] Successfully loaded {filename}")
        return norm_key, model
    except Exception as e:
        print(f"[SKINDERMO ERROR] Failed to load model '{filename}': {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load model '{filename}': {str(e)}",
        )


def preprocess_image(image_bytes: bytes, target_size: tuple) -> np.ndarray:
    """
    Decodes image bytes, ensures RGB mode, resizes to target resolution (224x224 or 299x299),
    converts to float32, and returns normalized numpy tensor (1, H, W, 3).
    Does NOT apply manual division or preprocessing twice because the models
    contain their respective preprocessing layers / Lambda functions.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image = image.convert("RGB")
        image = image.resize(target_size, Image.Resampling.BILINEAR)
        img_array = np.array(image, dtype=np.float32)
        # Expand batch dimension: (1, H, W, 3)
        return np.expand_dims(img_array, axis=0)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid or corrupted dermoscopic image: {str(e)}",
        )


@app.get("/")
@app.get("/api/health")
def health_check():
    """
    Health check endpoint for frontend connection status probe.
    """
    available_files = []
    if os.path.exists(MODELS_DIR):
        available_files = [f for f in os.listdir(MODELS_DIR) if f.endswith(".keras")]

    return {
        "status": "healthy",
        "service": "SKINDERMO Research Inference API",
        "models_dir": MODELS_DIR,
        "available_keras_files": available_files,
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
    """
    Main inference endpoint:
    Accepts multipart/form-data upload of an image and model selector.
    Executes forward pass using genuine Keras model and returns 7-class probability vector.
    """
    upload = file or image
    if not upload:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided. Please send 'file' or 'image' multipart field.",
        )

    # Read image contents
    image_bytes = await upload.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )

    server_start_time = time.perf_counter()

    # Load requested model with specific custom_objects if needed
    norm_key, keras_model = get_model(model)
    target_size = MODEL_INPUT_SIZES.get(norm_key, (224, 224))

    # Preprocess image tensor (RGB, target size, float32, no double-preprocessing)
    tensor = preprocess_image(image_bytes, target_size)

    # Execute model prediction with precise inference timing
    inference_start = time.perf_counter()
    try:
        # Direct call avoids tf.data.Dataset pipeline and step-loop overhead for single image
        raw_preds = keras_model(tensor, training=False)
        if hasattr(raw_preds, "numpy"):
            probabilities_vec = np.squeeze(raw_preds.numpy()).tolist()
        else:
            probabilities_vec = np.squeeze(np.array(raw_preds)).tolist()
    except Exception as e:
        print(f"[SKINDERMO] Fallback to predict() due to: {e}")
        raw_preds = keras_model.predict(tensor, verbose=0)
        probabilities_vec = np.squeeze(raw_preds).tolist()
    model_inference_ms = round((time.perf_counter() - inference_start) * 1000, 2)

    # Map raw vector to label dictionary
    class_probs: Dict[str, float] = {}
    for idx, label in enumerate(LABELS):
        score = float(probabilities_vec[idx]) if idx < len(probabilities_vec) else 0.0
        class_probs[label] = round(score, 6)

    # Determine winning predicted class
    top_idx = int(np.argmax(probabilities_vec))
    predicted_class = LABELS[top_idx]
    confidence = float(class_probs[predicted_class])

    server_process_ms = round((time.perf_counter() - server_start_time) * 1000, 2)

    return {
        "model": norm_key,
        "predicted_class": predicted_class,
        "confidence": confidence,
        "class_probabilities": class_probs,
        "inference_time_ms": model_inference_ms,
        "model_inference_ms": model_inference_ms,
        "server_process_ms": server_process_ms,
        "input_shape": list(tensor.shape),
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
