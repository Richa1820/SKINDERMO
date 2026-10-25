import React from 'react';
import { ModelId, BackendStatus } from '../../types';
import { EVALUATED_MODELS } from '../../constants/models';
import { RefreshCw, ChevronRight } from 'lucide-react';

interface WorkspaceHeaderProps {
  selectedModel: ModelId;
  backendStatus: BackendStatus;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
  onReset: () => void;
  hasImage: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  selectedModel,
  backendStatus,
  onRefreshHealth,
  isCheckingHealth,
  onReset,
  hasImage,
}) => {
  const model = EVALUATED_MODELS[selectedModel];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal-200/80">
      {/* Breadcrumb and Title */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-charcoal-500 font-mono">
          <span>SKINDERMO</span>
          <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
          <span>RESEARCH_PIPELINE</span>
          <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="text-forest-800 font-semibold">LESION_CLASSIFIER</span>
        </div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-2xl font-bold tracking-tight text-charcoal-900">
            Image Analysis Workspace
          </h2>
          <span className="hidden sm:inline-block font-mono text-[11px] px-2 py-0.5 rounded-md bg-forest-50 text-forest-800 border border-forest-200">
            Active Model: {model.name}
          </span>
        </div>
      </div>

      {/* Right Controls: Backend Status and Reset */}
      <div className="flex items-center gap-3">
        {/* Backend Status Pill with live refresh */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition-colors ${
            backendStatus.online
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200/90'
              : 'bg-amber-50 text-amber-900 border-amber-200/90'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus.online ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>
            {backendStatus.online
              ? `FastAPI: Connected (${backendStatus.latencyMs ? `${backendStatus.latencyMs}ms` : 'Ready'})`
              : 'FastAPI: Standby (8000)'}
          </span>
          <button
            onClick={onRefreshHealth}
            disabled={isCheckingHealth}
            title="Check backend status"
            className="p-1 hover:bg-white/80 rounded-md transition-colors text-charcoal-600 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Clear/Reset button */}
        {hasImage && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-charcoal-600 hover:text-charcoal-900 px-3 py-1.5 rounded-lg border border-charcoal-200 hover:bg-canvas-100 transition-colors"
          >
            Clear Image
          </button>
        )}
      </div>
    </div>
  );
};
