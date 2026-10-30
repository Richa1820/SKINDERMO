import React, { useState } from 'react';
import { UploadedImageMeta } from '../../types';
import { Trash2, RefreshCw, Eye, Image as ImageIcon, CheckCircle } from 'lucide-react';

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
    <div className="rounded-2xl bg-white border border-charcoal-200 p-4 sm:p-5 shadow-card space-y-4">
      {/* Top Metadata & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 flex-shrink-0">
            <ImageIcon className="w-4 h-4 text-teal-700" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-charcoal-900 truncate max-w-xs sm:max-w-md flex items-center gap-1.5">
              <span>{imageMeta.name}</span>
              <CheckCircle className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
            </div>
            <div className="text-[11px] font-mono text-charcoal-500">
              {imageMeta.width} × {imageMeta.height} px • {imageMeta.sizeFormatted} • {imageMeta.type || 'image/jpeg'}
            </div>
          </div>
        </div>

        {/* Change / Remove Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowReticle(!showReticle)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showReticle
                ? 'bg-teal-50 text-teal-900 border-teal-300'
                : 'bg-canvas-100 text-charcoal-600 border-charcoal-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dermoscopy Reticle</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onChangeImage}
            className="px-3 py-1.5 rounded-lg border border-charcoal-200 text-xs font-medium text-charcoal-700 hover:bg-canvas-100 transition-colors flex items-center gap-1.5 shadow-subtle"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Change Image</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onRemoveImage}
            className="px-3 py-1.5 rounded-lg border border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1.5"
            title="Remove image"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>

      {/* Image Preview Canvas Frame */}
      <div className="relative rounded-xl bg-charcoal-950 overflow-hidden flex items-center justify-center max-h-[360px] sm:max-h-[420px] border border-charcoal-800">
        <img
          src={imageMeta.previewUrl}
          alt={imageMeta.name}
          className="w-full max-h-[360px] sm:max-h-[420px] object-contain select-none"
        />

        {/* Optional Dermoscopy Aperture Grid Overlay */}
        {showReticle && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            {/* Concentric reticles */}
            <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-dashed border-teal-300/40" />
            <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full border border-teal-400/30" />
            {/* Crosshairs */}
            <div className="absolute inset-x-8 top-1/2 h-[1px] bg-teal-300/20" />
            <div className="absolute inset-y-8 left-1/2 w-[1px] bg-teal-300/20" />
            {/* Corner telemetry label */}
            <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded bg-charcoal-900/90 text-[10px] font-mono text-teal-300 border border-charcoal-700 shadow-sm">
              DERMOSCOPY_VIEWPORT // RGB_3CH_STANDARDIZED
            </div>
          </div>
        )}
      </div>
    </div>
  );
};