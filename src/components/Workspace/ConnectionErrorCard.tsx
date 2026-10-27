import React, { useState } from 'react';
import { RefreshCw, Copy, Check, Server, ShieldCheck } from 'lucide-react';
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

  const commandText = `cd backend\nuvicorn main:app --reload --port 8000`;

  const copyCommand = () => {
    navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl bg-white border border-charcoal-200 p-6 sm:p-7 shadow-card space-y-5">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 text-amber-800">
          <Server className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded">
              Backend Service Offline
            </span>
            <span className="text-xs font-mono text-charcoal-400">
              Target Model: {model.filename}
            </span>
          </div>

          <h3 className="text-xl font-bold text-charcoal-900">
            {errorMessage || 'Cannot connect to Python FastAPI inference backend'}
          </h3>

          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            The frontend successfully validated your dermoscopic image, but the deep learning server at{' '}
            <code className="px-1.5 py-0.5 rounded bg-canvas-200 text-charcoal-800 font-mono text-xs">
              {errorDetails?.url || 'http://localhost:8000'}/api/predict
            </code>{' '}
            is currently unreachable.
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
