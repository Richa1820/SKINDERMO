import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle, Sparkles, FileImage, ShieldCheck } from 'lucide-react';
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

    // Reject empty files
    if (file.size === 0) {
      setErrorMessage('Uploaded file is empty (0 bytes). Please select a valid dermoscopy image.');
      return;
    }

    // Reject video formats explicitly
    if (file.type.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm|flv|wmv)$/i.test(file.name)) {
      setErrorMessage(
        'Video files are not supported. SKINDERMO requires a static 2D dermoscopic photograph (JPG, JPEG, or PNG).'
      );
      return;
    }

    // Validate image format - JPG, JPEG, PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const validExtensions = /\.(jpe?g|png|webp)$/i;
    if (!validTypes.includes(file.type.toLowerCase()) && !validExtensions.test(file.name)) {
      setErrorMessage(
        'Unsupported image format. Please upload a photographic dermoscopy image in JPG, JPEG, or PNG format.'
      );
      return;
    }

    // Size limit: 25MB
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 25MB maximum limit. Please upload an image under 25MB.');
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
      setErrorMessage(
        'Failed to decode image data. The file appears to be corrupted or not a valid image format.'
      );
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

  // Generate standardized synthetic academic sample dermoscopy lesions for 1-click evaluation
  const handleLoadAcademicSample = (sampleType: 'mel' | 'nv' | 'bkl') => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 450;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background skin tone
    ctx.fillStyle = '#edd5c0';
    ctx.fillRect(0, 0, 600, 450);

    // Realistic cutaneous pigmentation texture
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(215, 185, 160, 0.25)' : 'rgba(245, 220, 200, 0.25)';
      ctx.fillRect(Math.random() * 600, Math.random() * 450, 2, 2);
    }

    if (sampleType === 'mel') {
      // Melanoma: Asymmetric, irregular border, multi-tone dark brown/black
      ctx.beginPath();
      ctx.ellipse(300, 225, 120, 85, Math.PI / 6, 0, 2 * Math.PI);
      const melGrad = ctx.createRadialGradient(285, 215, 10, 300, 225, 130);
      melGrad.addColorStop(0, '#1c120c');
      melGrad.addColorStop(0.35, '#3b2216');
      melGrad.addColorStop(0.7, '#6b3c22');
      melGrad.addColorStop(1, '#9e6741');
      ctx.fillStyle = melGrad;
      ctx.fill();

      // Blue-white veil & atypical pigment dots
      ctx.beginPath();
      ctx.arc(280, 210, 24, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(160, 180, 205, 0.45)';
      ctx.fill();
    } else if (sampleType === 'nv') {
      // Melanocytic Nevus: Regular, symmetric oval, uniform light-brown pigment network
      ctx.beginPath();
      ctx.ellipse(300, 225, 95, 80, 0, 0, 2 * Math.PI);
      const nevGrad = ctx.createRadialGradient(300, 225, 5, 300, 225, 95);
      nevGrad.addColorStop(0, '#4d3324');
      nevGrad.addColorStop(0.6, '#754f37');
      nevGrad.addColorStop(1, '#a67755');
      ctx.fillStyle = nevGrad;
      ctx.fill();
    } else {
      // Benign keratosis (bkl): Cerebriform / stuck-on appearance
      ctx.beginPath();
      ctx.ellipse(300, 225, 105, 95, Math.PI / 4, 0, 2 * Math.PI);
      const bklGrad = ctx.createRadialGradient(300, 225, 10, 300, 225, 110);
      bklGrad.addColorStop(0, '#5a4130');
      bklGrad.addColorStop(0.55, '#7a5a44');
      bklGrad.addColorStop(1, '#ad8769');
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
          `sample_dermoscopy_${sampleType}.jpg`,
          { type: 'image/jpeg' }
        );
        processFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Boundary */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
          isDragOver
            ? 'border-teal-500 bg-teal-50/50 scale-[1.005]'
            : 'border-charcoal-300 hover:border-teal-500 bg-white hover:bg-canvas-50/60 shadow-sm'
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
        <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 mb-4 shadow-subtle">
          <UploadCloud className="w-7 h-7 text-teal-600" />
        </div>

        <div className="space-y-2 max-w-md">
          <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
            Drag & drop dermoscopic lesion image here
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            Upload high-resolution contact or polarized dermoscopic photographs for automated CNN differential classification.
          </p>
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] font-mono text-charcoal-500">
            <span className="px-2.5 py-1 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-800 font-semibold">JPG</span>
            <span className="px-2.5 py-1 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-800 font-semibold">JPEG</span>
            <span className="px-2.5 py-1 rounded bg-canvas-100 border border-charcoal-200 text-charcoal-800 font-semibold">PNG</span>
            <span>• Max 25 MB</span>
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
          className="mt-5 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white hover:bg-charcoal-800 active:scale-[0.99] text-xs font-semibold shadow-subtle transition-all border border-charcoal-800 inline-flex items-center gap-2"
        >
          <FileImage className="w-3.5 h-3.5 text-teal-400" />
          <span>Select Image from Computer</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2.5 shadow-subtle">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Quick Academic Test Samples Bar */}
      <div className="p-3.5 rounded-xl bg-white border border-charcoal-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-charcoal-600 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="font-semibold text-charcoal-800">Quick Test Samples:</span>
          <span className="text-charcoal-400 hidden md:inline">Instant demo evaluation without local files</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleLoadAcademicSample('mel')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-teal-50 text-charcoal-800 hover:text-teal-900 border border-charcoal-200 hover:border-teal-300 font-mono text-[11px] font-medium transition-colors"
          >
            Sample: Melanoma (MEL)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleLoadAcademicSample('nv')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-teal-50 text-charcoal-800 hover:text-teal-900 border border-charcoal-200 hover:border-teal-300 font-mono text-[11px] font-medium transition-colors"
          >
            Sample: Nevus (NV)
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => handleLoadAcademicSample('bkl')}
            className="px-2.5 py-1 rounded-lg bg-canvas-100 hover:bg-teal-50 text-charcoal-800 hover:text-teal-900 border border-charcoal-200 hover:border-teal-300 font-mono text-[11px] font-medium transition-colors"
          >
            Sample: Keratosis (BKL)
          </button>
        </div>
      </div>
    </div>
  );
};