import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, Sparkles } from 'lucide-react';
import { UploadedImageMeta } from '../../types';

interface ImageDropzoneProps {
  onImageSelected: (meta: UploadedImageMeta) => void;
  disabled?: boolean;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMessage(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setErrorMessage('Unsupported format. Please upload a JPG, JPEG, or PNG dermoscopy image.');
      return;
    }

    // Size limit: 20MB
    if (file.size > 20 * 1024 * 1024) {
      setErrorMessage('File size exceeds 20MB. Please select an image under 20MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const sizeInMB = file.size / (1024 * 1024);
      const sizeFormatted =
        sizeInMB >= 1
          ? `${sizeInMB.toFixed(2)} MB`
          : `${(file.size / 1024).toFixed(1)} KB`;

      onImageSelected({
        file,
        previewUrl,
        name: file.name,
        sizeFormatted,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        type: file.type,
      });
    };
    img.onerror = () => {
      setErrorMessage('Failed to decode image data. Please verify the file integrity.');
    };
    img.src = previewUrl;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Helper to load sample synthetic dermoscopy images for instant testing
  const loadSyntheticSample = (sampleType: 'mel' | 'nv' | 'bkl') => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background skin tone
    const skinGrad = ctx.createRadialGradient(300, 225, 50, 300, 225, 350);
    skinGrad.addColorStop(0, '#eac6b3');
    skinGrad.addColorStop(1, '#c99f89');
    ctx.fillStyle = skinGrad;
    ctx.fillRect(0, 0, 600, 450);

    // Lesion body based on type
    if (sampleType === 'mel') {
      // Asymmetric, multi-colored melanoma simulation
      ctx.beginPath();
      ctx.ellipse(300, 225, 120, 95, Math.PI / 6, 0, 2 * Math.PI);
      const lesGrad = ctx.createRadialGradient(280, 210, 20, 300, 225, 140);
      lesGrad.addColorStop(0, '#1c120c');
      lesGrad.addColorStop(0.5, '#40271c');
      lesGrad.addColorStop(0.8, '#6b3f2c');
      lesGrad.addColorStop(1, '#9e6244');
      ctx.fillStyle = lesGrad;
      ctx.fill();

      // Irregular dots
      ctx.fillStyle = '#0a0503';
      for (let i = 0; i < 35; i++) {
        const x = 240 + Math.random() * 120;
        const y = 170 + Math.random() * 110;
        ctx.beginPath();
        ctx.arc(x, y, 2 + Math.random() * 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    } else if (sampleType === 'nv') {
      // Symmetric, uniform melanocytic nevus
      ctx.beginPath();
      ctx.ellipse(300, 225, 90, 85, 0, 0, 2 * Math.PI);
      const nevGrad = ctx.createRadialGradient(300, 225, 10, 300, 225, 95);
      nevGrad.addColorStop(0, '#4a2c1d');
      nevGrad.addColorStop(0.7, '#633d2a');
      nevGrad.addColorStop(1, '#825239');
      ctx.fillStyle = nevGrad;
      ctx.fill();
    } else {
      // Benign keratosis (bkl)
      ctx.beginPath();
      ctx.ellipse(300, 225, 110, 100, Math.PI / 4, 0, 2 * Math.PI);
      const bklGrad = ctx.createRadialGradient(300, 225, 10, 300, 225, 120);
      bklGrad.addColorStop(0, '#664d3b');
      bklGrad.addColorStop(0.6, '#8a6850');
      bklGrad.addColorStop(1, '#b08a6e');
      ctx.fillStyle = bklGrad;
      ctx.fill();
    }

    // Polarized dermoscopy aperture border
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#121e1a';
    ctx.strokeRect(7, 7, 586, 436);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File(
          [blob],
          `sample_dermoscopy_${sampleType}_600x450.jpg`,
          { type: 'image/jpeg' }
        );
        processFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-3">
      {/* Drag & Drop Boundary */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.005]'
            : 'border-charcoal-300 hover:border-forest-600 bg-canvas-50 hover:bg-white'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
          id="lesion-image-file-input"
        />

        {/* Upload Icon Circle */}
        <div className="w-14 h-14 rounded-2xl bg-white border border-charcoal-200/90 shadow-subtle flex items-center justify-center text-forest-800 mb-4 transition-transform group-hover:scale-105">
          <UploadCloud className="w-7 h-7 text-forest-700" />
        </div>

        <div className="space-y-1.5 max-w-sm">
          <p className="text-sm font-semibold text-charcoal-900">
            <span className="text-forest-900 underline underline-offset-2">Click to browse</span> or drag and drop dermoscopy image
          </p>
          <p className="text-xs text-charcoal-500">
            Standard high-magnification contact or polarized dermoscopic photographs
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-charcoal-400">
            <span className="px-2 py-0.5 rounded bg-canvas-200 text-charcoal-700">JPG</span>
            <span className="px-2 py-0.5 rounded bg-canvas-200 text-charcoal-700">JPEG</span>
            <span className="px-2 py-0.5 rounded bg-canvas-200 text-charcoal-700">PNG</span>
            <span>• Max 20MB</span>
          </div>
        </div>

        {/* Browse Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="mt-5 px-4 py-2 rounded-xl bg-white border border-charcoal-300 hover:bg-canvas-100 text-xs font-semibold text-charcoal-800 shadow-subtle transition-all"
        >
          Select File from Computer
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quick Academic Test Samples Bar */}
      <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-charcoal-600">
        <span className="font-mono text-[11px] text-charcoal-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-forest-600" />
          Need a dermoscopy sample image to test?
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => loadSyntheticSample('mel')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-canvas-200 border border-charcoal-200 text-[11px] font-mono text-charcoal-700 transition-colors"
          >
            Sample: Melanoma (mel)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => loadSyntheticSample('nv')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-canvas-200 border border-charcoal-200 text-[11px] font-mono text-charcoal-700 transition-colors"
          >
            Sample: Nevus (nv)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => loadSyntheticSample('bkl')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-canvas-200 border border-charcoal-200 text-[11px] font-mono text-charcoal-700 transition-colors"
          >
            Sample: Keratosis (bkl)
          </button>
        </div>
      </div>
    </div>
  );
};
