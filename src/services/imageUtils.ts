/**
 * Browser-side image pre-scaling helper
 * Resizes images on HTML5 canvas before uploading to server:
 * - Bounds maximum dimension to 1024px on longest side
 * - Encodes as high-quality JPEG (0.90 quality)
 * - Drastically reduces payload from 5-10MB down to ~100-250KB in < 50ms
 */
export async function resizeImageForUpload(
  file: File,
  maxDim: number = 1024,
  quality: number = 0.9
): Promise<{ file: File; originalSize: number; resizedSize: number; resizeMs: number }> {
  const startTime = performance.now();
  const originalSize = file.size;

  return new Promise((resolve) => {
    // If file is not an image (e.g., error case) or already tiny JPEG, skip
    if (!file.type.startsWith('image/')) {
      resolve({ file, originalSize, resizedSize: file.size, resizeMs: 0 });
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { naturalWidth: w, naturalHeight: h } = img;

      // If already within bounds and small, keep original
      if (w <= maxDim && h <= maxDim && file.size < 400 * 1024) {
        resolve({
          file,
          originalSize,
          resizedSize: file.size,
          resizeMs: Math.round(performance.now() - startTime),
        });
        return;
      }

      // Compute scale keeping aspect ratio
      if (w > h) {
        if (w > maxDim) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        }
      } else {
        if (h > maxDim) {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ file, originalSize, resizedSize: file.size, resizeMs: 0 });
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({ file, originalSize, resizedSize: file.size, resizeMs: 0 });
            return;
          }
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const resizedFile = new File([blob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          const resizeMs = Math.round(performance.now() - startTime);
          console.log(
            `[SKINDERMO FRONTEND] Pre-scaled image: ${(originalSize / (1024 * 1024)).toFixed(2)} MB -> ${(resizedFile.size / 1024).toFixed(1)} KB in ${resizeMs}ms`
          );
          resolve({
            file: resizedFile,
            originalSize,
            resizedSize: resizedFile.size,
            resizeMs,
          });
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ file, originalSize, resizedSize: file.size, resizeMs: 0 });
    };

    img.src = url;
  });
}
