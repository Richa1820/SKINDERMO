import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Server, ShieldCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ModelId } from '../../types';
import { EVALUATED_MODELS } from '../../constants/models';

interface ConnectionErrorCardProps {
  errorMessage?: string;
  errorDetails?: {
    statusCode?: number;
    url: string;
    endpoint: string;
    tips: string[];
    rawMessage?: string;
  };
  selectedModel: ModelId;
  onRetry: () => void;
  isRetrying?: boolean;
}

export const ConnectionErrorCard: React.FC<ConnectionErrorCardProps> = ({
  errorMessage,
  errorDetails,
  selectedModel,
  onRetry,
  isRetrying = false,
}) => {
  const [copied, setCopied] = useState(false);
  const model = EVALUATED_MODELS[selectedModel];
  const isValidationError = errorDetails?.statusCode === 400 || errorDetails?.statusCode === 422;

  const commandText = `cd backend\nuvicorn main:app --reload --port 8000`;

  const copyCommand = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isValidationError) {
    return (
      <div className="rounded-xl bg-white border border-amber-300 p-6 sm:p-7 shadow-card space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-300 flex items-center justify-center flex-shrink-0 text-amber-800">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                Upload Validation Rejected (HTTP {errorDetails?.statusCode || 400})
              </span>
              <span className="text-xs font-mono text-charcoal-400">
                Pre-Inference Validation
              </span>
            </div>

            <h3 className="text-xl font-bold text-charcoal-900">
              Invalid File or Unsupported Format
            </h3>

            <p className="text-xs sm:text-sm text-charcoal-700 leading-relaxed font-mono bg-canvas-50 p-3 rounded-lg border border-charcoal-200 mt-2">
              {errorDetails?.rawMessage || errorMessage || 'The uploaded file could not be decoded as a valid image.'}
            </p>
          </div>
        </div>

        <div className="bg-canvas-50 rounded-lg p-4 border border-charcoal-200 text-xs space-y-2">
          <div className="font-semibold text-charcoal-800">
            Accepted file specifications:
          </div>
          <ul className="space-y-1.5 text-charcoal-600 pl-4 list-disc">
            <li>
              <strong>Static 2D image formats:</strong> JPEG, PNG, WEBP, BMP, or TIFF.
            </li>
            <li>
              <strong>Non-image rejection:</strong> Video files (MP4, AVI, MKV, MOV), documents (PDF), and non-image binaries are rejected before model inference.
            </li>
            <li>
              <strong>Integrity:</strong> File must contain valid, uncorrupted raster pixel data (minimum 32×32 px, maximum 10,000×10,000 px).
            </li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white font-semibold text-xs shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all border border-charcoal-800"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Select Another Image</span>
          </button>
        </div>
      </div>
    );
  }

  const isTimeout =
    errorMessage?.toLowerCase().includes('timed out') ||
    errorDetails?.rawMessage?.toLowerCase().includes('aborterror');

  return (
    <div className="rounded-xl bg-white border border-charcoal-200 p-6 sm:p-7 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            isTimeout
              ? 'bg-amber-50 border border-amber-300 text-amber-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          {isTimeout ? <AlertTriangle className="w-5 h-5" /> : <Server className="w-5 h-5" />}
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                isTimeout
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              {isTimeout ? 'CPU Computation Timeout' : 'Backend Service Offline'}
            </span>
            <span className="text-xs font-mono text-charcoal-400">
              Target Model: {model.filename}
            </span>
          </div>

          <h3 className="text-xl font-bold text-charcoal-900">
            {errorMessage || (isTimeout ? 'Inference request exceeded timeout threshold' : 'Cannot connect to Python FastAPI inference backend')}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            {isTimeout ? (
              <>
                The neural network forward pass took longer than the client timeout threshold. Because deep neural networks (such as ResNet-50 and Inception-V3) execute on local CPU hardware without dedicated GPU acceleration, forward passes require sustained processing time.
              </>
            ) : (
              <>
                The frontend successfully validated your dermoscopic image, but the deep learning server at{' '}
                <code className="px-1.5 py-0.5 rounded bg-canvas-200 text-charcoal-800 font-mono text-xs">
                  {errorDetails?.url || 'http://localhost:8000'}/api/predict
                </code>{' '}
                is currently unreachable.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Strict Academic Research Notice */}
      <div className="p-3.5 rounded-lg bg-sage-50 border border-sage-200 text-xs text-sage-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-sage-700 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Research Integrity Protocol: </span>
          In strict compliance with academic standards, SKINDERMO never generates synthetic or simulated predictions. Real probability vectors are rendered only when computed by the genuine neural network weights.
        </div>
      </div>

      {/* Quick Launch Instructions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-charcoal-500">
          <span>Start local FastAPI inference server:</span>
          <button
            onClick={copyCommand}
            className="flex items-center gap-1 text-sage-800 hover:text-charcoal-900 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Command'}</span>
          </button>
        </div>

        <div className="bg-charcoal-950 text-charcoal-300 p-3.5 rounded-lg font-mono text-xs overflow-x-auto relative">
          <div className="text-charcoal-500"># Terminal (PowerShell or Bash)</div>
          <div className="text-sage-300 mt-1">{commandText}</div>
        </div>
      </div>

      {/* Checklist of Expected Model Files */}
      <div className="bg-canvas-50 rounded-lg p-3.5 border border-charcoal-200 text-xs space-y-2">
        <div className="font-semibold text-charcoal-800">
          Verify backend setup requirements:
        </div>
        <ul className="space-y-1.5 text-charcoal-600 pl-4 list-disc">
          <li>
            Model files downloaded from Google Drive placed in <code className="font-mono text-charcoal-800 font-semibold">backend/models/</code>:
            <span className="block font-mono text-[11px] text-sage-800 mt-0.5">
              • resnet50_best.keras &nbsp; • densenet121_best.keras &nbsp; • inceptionv3_best.keras
            </span>
          </li>
          <li>
            FastAPI endpoint: <code className="font-mono text-charcoal-800">POST /api/predict</code> with CORS enabled for port 5173.
          </li>
          <li>
            Environment override (optional): Set <code className="font-mono text-charcoal-800">VITE_API_BASE_URL</code> in <code className="font-mono">.env</code>.
          </li>
        </ul>
      </div>

      {/* Retry Action */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-charcoal-900 text-white font-semibold text-xs shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all border border-charcoal-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking Connection...' : 'Retry Inference'}</span>
        </button>
      </div>
    </div>
  );
};
