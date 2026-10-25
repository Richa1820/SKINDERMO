import React, { useState } from 'react';
import { UploadedImageMeta } from '../../types';
import { Trash2, RefreshCw, Eye, Image as ImageIcon } from 'lucide-react';

interface ImagePreviewProps {
  imageMeta: UploadedImageMeta;
  onChangeImage: () => void;
  onRemoveImage: () => void;
  disabled?: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageMeta,
  onChangeImage,
  onRemoveImage,
  disabled = false,
}) => {
  const [showReticle, setShowReticle] = useState(true);

  return (
    <div className="rounded-2xl bg-white border border-charcoal-200/90 p-4 sm:p-5 shadow-card space-y-4">
      {/* Top Metadata & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-forest-50 border border-forest-200 flex items-center justify-center text-forest-800 flex-shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-charcoal-900 truncate max-w-xs sm:max-w-md">
              {imageMeta.name}
            </div>
            <div className="text-[11px] font-mono text-charcoal-500">
              {imageMeta.width} × {imageMeta.height} px • {imageMeta.sizeFormatted} • {imageMeta.type}
            </div>
          </div>
        </div>

        {/* Change / Remove Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowReticle(!showReticle)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showReticle
                ? 'bg-forest-50 text-forest-900 border-forest-200'
                : 'bg-canvas-100 text-charcoal-600 border-charcoal-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dermoscopy Grid</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onChangeImage}
            className="px-2.5 py-1.5 rounded-lg border border-charcoal-200 text-xs font-medium text-charcoal-700 hover:bg-canvas-100 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemoveImage}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 transition-colors"
            title="Remove image"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Preview Canvas Frame */}
      <div className="relative rounded-xl bg-charcoal-950 overflow-hidden flex items-center justify-center max-h-[360px] sm:max-h-[400px]">
        <img
          src={imageMeta.previewUrl}
          alt={imageMeta.name}
          className="w-full max-h-[360px] sm:max-h-[400px] object-contain select-none"
        />

        {/* Optional Dermoscopy Aperture Grid Overlay */}
        {showReticle && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Concentric reticles */}
            <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border border-dashed border-emerald-400/40" />
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-forest-400/30" />
            {/* Crosshairs */}
            <div className="absolute inset-x-8 top-1/2 h-[1px] bg-emerald-400/20" />
            <div className="absolute inset-y-8 left-1/2 w-[1px] bg-emerald-400/20" />
            {/* Corner telemetry label */}
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-emerald-300">
              RETICLE_ACTIVE // RGB_3CH
            </div>
          </div>
        )}
      </div>

      {/* Verification note */}
      <div className="text-[11px] text-charcoal-500 flex items-center justify-between">
        <span>Image passed format checks and aspect ratio validation.</span>
        <span className="font-mono text-emerald-700 font-medium">Ready for forward pass</span>
      </div>
    </div>
  );
};
