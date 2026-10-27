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
              className={`p-3.5 rounded-lg border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-white text-charcoal-900 border-sage-600 shadow-card ring-1 ring-sage-600'
                  : 'bg-white hover:bg-canvas-100 text-charcoal-800 border-charcoal-200'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Selected Check Pill */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-sage-600 text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`p-1.5 rounded-md ${
                      isSelected
                        ? 'bg-sage-100 text-sage-800'
                        : 'bg-canvas-100 text-charcoal-700'
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
                    <span className="font-bold text-sm block leading-tight text-charcoal-900">
                      {model.name}
                    </span>
                    <span className="text-[10px] font-mono text-charcoal-500">
                      {model.inputResolution}
                    </span>
                  </div>
                </div>

                <div className={`text-[11px] font-mono mt-2 pt-2 border-t border-charcoal-100 truncate ${
                  isSelected ? 'text-sage-800 font-medium' : 'text-charcoal-500'
                }`}>
                  {model.filename}
                </div>
              </div>

              <div className="mt-2 text-[10px] text-charcoal-400">
                Params: {model.parameters} • {model.depth}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
