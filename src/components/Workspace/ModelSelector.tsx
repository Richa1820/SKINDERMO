import React from 'react';
import { ModelId, BackendStatus } from '../../types';
import { EVALUATED_MODELS, VALIDATION_BENCHMARK_RESULTS } from '../../constants/models';
import { Box, GitBranch, Layers, Sparkles, Check, Info } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  disabled?: boolean;
  backendStatus?: BackendStatus;
  onOpenBenchmarkModal?: () => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  disabled = false,
  backendStatus,
  onOpenBenchmarkModal,
}) => {
  const modelOptions: Array<{
    id: ModelId;
    name: string;
    subtitle: string;
    tag: string;
    details: string;
    accuracy?: string;
    icon: React.ReactNode;
    isBest?: boolean;
  }> = [
    {
      id: 'best',
      name: 'Best Model (Auto)',
      subtitle: 'Validation Benchmark Top-1',
      tag: 'Auto-Select',
      details: 'Auto-routes to ResNet-50 (Rank #1)',
      accuracy: '67.58% Val Acc',
      icon: <Sparkles className="w-4 h-4 text-teal-600" />,
      isBest: true,
    },
    {
      id: 'resnet50',
      name: 'ResNet-50',
      subtitle: 'Deep Residual Learning',
      tag: 'Rank #1 Overall',
      details: '224×224 • 25.6M Params',
      accuracy: '67.58% Val Acc',
      icon: <Box className="w-4 h-4 text-charcoal-700" />,
    },
    {
      id: 'densenet121',
      name: 'DenseNet-121',
      subtitle: 'Dense Feature Reuse',
      tag: 'Top Macro-F1',
      details: '224×224 • 8.1M Params',
      accuracy: '67.06% Val Acc',
      icon: <GitBranch className="w-4 h-4 text-charcoal-700" />,
    },
    {
      id: 'inceptionv3',
      name: 'Inception-V3',
      subtitle: 'Multi-Scale Convolutions',
      tag: '299px High-Res',
      details: '299×299 • 23.8M Params',
      accuracy: '64.96% Val Acc',
      icon: <Layers className="w-4 h-4 text-charcoal-700" />,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <label className="text-xs font-mono uppercase tracking-wider text-charcoal-600 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-600"></span>
          <span>Target Architecture Selection:</span>
        </label>
        
        {onOpenBenchmarkModal && (
          <button
            type="button"
            onClick={onOpenBenchmarkModal}
            className="text-[11px] font-mono text-teal-700 hover:text-teal-900 underline underline-offset-2 flex items-center gap-1 self-start sm:self-auto"
          >
            <Info className="w-3 h-3" />
            <span>View Validation Benchmark Data (model_comparison.csv)</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modelOptions.map((opt) => {
          const isSelected = selectedModel === opt.id;
          const isAutoBest = opt.id === 'best';

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? isAutoBest
                    ? 'bg-gradient-to-b from-teal-50/70 to-white text-charcoal-900 border-teal-500 shadow-card ring-2 ring-teal-500/20'
                    : 'bg-white text-charcoal-900 border-teal-600 shadow-card ring-2 ring-teal-600/20'
                  : 'bg-white hover:bg-canvas-50 text-charcoal-800 border-charcoal-200 hover:border-charcoal-300'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}`}
            >
              {/* Selected Pill */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`p-1.5 rounded-lg border ${
                      isSelected
                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                        : 'bg-canvas-100 border-charcoal-200 text-charcoal-700'
                    }`}
                  >
                    {opt.icon}
                  </span>
                  <div>
                    <span className="font-bold text-sm block leading-tight text-charcoal-900">
                      {opt.name}
                    </span>
                    <span className="text-[10px] text-charcoal-500 font-medium">
                      {opt.subtitle}
                    </span>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-charcoal-100 flex items-center justify-between text-[11px] font-mono">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    isAutoBest
                      ? 'bg-teal-100/70 text-teal-900 border border-teal-200'
                      : 'bg-canvas-100 text-charcoal-600 border border-charcoal-200'
                  }`}>
                    {opt.tag}
                  </span>
                  {opt.accuracy && (
                    <span className="text-[11px] font-semibold text-charcoal-800">
                      {opt.accuracy}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-charcoal-400 font-mono">
                {opt.details}
              </div>
            </button>
          );
        })}
      </div>

      {/* Transparent Backend Note */}
      {selectedModel === 'best' && (
        <div className="p-2.5 rounded-lg bg-teal-50/80 border border-teal-200 text-[11px] text-teal-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-700 flex-shrink-0" />
            <span>
              <strong>Best Model Mode:</strong> Automatically submits to <strong>ResNet-50</strong> based on verified HAM10000 validation test results (Accuracy: <strong>67.58%</strong>, Weighted F1: <strong>58.98%</strong>).
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-teal-200 text-teal-800 flex-shrink-0">
            Validated
          </span>
        </div>
      )}
    </div>
  );
};