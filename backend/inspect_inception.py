import os
import tensorflow as tf

model_path = os.path.join(os.path.dirname(__file__), "models", "inceptionv3_best.keras")
size_bytes = os.path.getsize(model_path)
size_mb = size_bytes / (1024 * 1024)

print("=" * 60)
print(f"File Path: {model_path}")
print(f"File Size: {size_bytes} bytes ({size_mb:.2f} MB)")
print("=" * 60)

if size_mb < 1.0:
    print("FATAL: File is smaller than 1 MB! It is a Git LFS pointer, not the real model.")
else:
    print("Loading model via tf.keras.models.load_model(..., compile=False, safe_mode=False)...")
    model = tf.keras.models.load_model(model_path, compile=False, safe_mode=False)
    print("Model loaded successfully!")
    print(f"Input Shape:  {model.input_shape}")
    print(f"Output Shape: {model.output_shape}")
    print(f"Total Layers: {len(model.layers)}")
    print("-" * 60)
    print("First 10 Layers:")
    for idx, layer in enumerate(model.layers[:10]):
        config = layer.get_config()
        extra = ""
        if isinstance(layer, tf.keras.layers.Lambda):
            extra = f" [Lambda function: {layer.function}]"
        print(f"  [{idx}] {layer.name} ({layer.__class__.__name__}){extra}")
    print("=" * 60)
