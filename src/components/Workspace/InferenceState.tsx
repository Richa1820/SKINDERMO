import React, { useEffect, useState } from 'react';
import { ModelId } from '../../types';
import { EVALUATED_MODELS } from '../../constants/models';
import { Cpu, Loader2 } from 'lucide-react';

interface InferenceStateProps {
  modelId: ModelId;
  imageName: string;
}

export const InferenceState: React.FC<InferenceStateProps> = ({ modelId, imageName }) => {
  const model = EVALUATED_MODELS[modelId];
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Normalizing 3-channel RGB image tensor to input matrix...',
    `Forward pass through ${model.name} (${model.parameters} parameters)...`,
    'Computing 7-class softmax posterior probability distribution...',
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedMs(elapsed);

      if (elapsed > 700 && currentStep === 0) setCurrentStep(1);
      if (elapsed > 1600 && currentStep === 1) setCurrentStep(2);
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="rounded-2xl bg-white border border-forest-200/90 p-8 sm:p-12 shadow-card text-center space-y-6">
      {/* Central Animated Processor Unit */}
      <div className="relative mx-auto w-20 h-20 rounded-2xl bg-forest-950 flex items-center justify-center text-emerald-400 shadow-glow">
        <Cpu className="w-10 h-10 animate-pulse" />
        <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/40 animate-ping opacity-25" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          <h3 className="text-xl font-bold text-charcoal-900">
            Running Deep Inference
          </h3>
        </div>
        <p className="text-xs font-mono text-charcoal-500">
          Target Pipeline: <span className="font-semibold text-forest-900">{model.name}</span> ({model.filename})
        </p>
        <p className="text-[11px] font-mono text-charcoal-400 truncate max-w-sm mx-auto">
          Input file: {imageName}
        </p>
      </div>

      {/* Progress Stages */}
      <div className="max-w-md mx-auto bg-canvas-50 rounded-xl p-4 border border-charcoal-200/80 text-left space-y-2.5">
        {steps.map((stepText, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white'
                    : isCurrent
                    ? 'bg-forest-900 text-emerald-300 ring-2 ring-emerald-400/50'
                    : 'bg-canvas-200 text-charcoal-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </span>
              <span
                className={`transition-colors ${
                  isCurrent
                    ? 'font-medium text-charcoal-900'
                    : isDone
                    ? 'text-charcoal-600 line-through'
                    : 'text-charcoal-400'
                }`}
              >
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Elapsed Timer Counter */}
      <div className="text-[11px] font-mono text-charcoal-400">
        Elapsed Request Time: {elapsedMs} ms ({(elapsedMs / 1000).toFixed(2)}s) • Calling POST /api/predict
      </div>
    </div>
  );
};
