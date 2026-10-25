import React from 'react';
import { ModelId } from '../../types';
import { EVALUATED_MODELS, ORDERED_MODEL_KEYS } from '../../constants/models';
import { Box, GitBranch, Layers, Check } from 'lucide-react';

interface ModelSelectorProps {
  selectedModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  disabled?: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onSelectModel,
  disabled = false,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono uppercase tracking-wider text-charcoal-500 font-semibold flex items-center gap-1.5">
          <span>Target Neural Architecture:</span>
        </label>
        <span className="text-[11px] font-mono text-charcoal-400">
          Selected Weights: {EVALUATED_MODELS[selectedModel].filename}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ORDERED_MODEL_KEYS.map((key) => {
          const model = EVALUATED_MODELS[key];
          const isSelected = selectedModel === key;
          const isDenseNet = key === 'densenet121';
          const isInception = key === 'inceptionv3';

          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelectModel(key)}
              className={`p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-forest-950 text-white border-forest-800 shadow-card ring-2 ring-forest-600/40'
                  : 'bg-white hover:bg-canvas-50 text-charcoal-800 border-charcoal-200/90'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected Check Pill */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-emerald-500 text-forest-950 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`p-1.5 rounded-lg ${
                      isSelected
                        ? 'bg-forest-900 text-emerald-400'
                        : 'bg-canvas-100 text-forest-800'
                    }`}
                  >
                    {isDenseNet ? (
                      <GitBranch className="w-4 h-4" />
                    ) : isInception ? (
                      <Layers className="w-4 h-4" />
                    ) : (
                      <Box className="w-4 h-4" />
                    )}
                  </span>
                  <div>
                    <span className="font-bold text-sm block leading-tight">
                      {model.name}
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        isSelected ? 'text-forest-200' : 'text-charcoal-500'
                      }`}
                    >
                      {model.inputResolution}
                    </span>
                  </div>
                </div>

                <div
                  className={`text-[11px] font-mono mt-2 pt-2 border-t truncate ${
                    isSelected ? 'border-forest-800/80 text-emerald-300' : 'border-charcoal-100 text-charcoal-600'
                  }`}
                >
                  {model.filename}
                </div>
              </div>

              <div
                className={`mt-2 text-[10px] ${
                  isSelected ? 'text-forest-300' : 'text-charcoal-400'
                }`}
              >
                Params: {model.parameters} • {model.depth}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
