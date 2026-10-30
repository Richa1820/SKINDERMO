import React, { useEffect, useState } from 'react';
import { ModelId } from '../../types';
import { EVALUATED_MODELS } from '../../constants/models';
import { Cpu, Loader2, Sparkles } from 'lucide-react';

interface InferenceStateProps {
  modelId: ModelId;
  imageName: string;
}

export const InferenceState: React.FC<InferenceStateProps> = ({ modelId, imageName }) => {
  const isBest = modelId === 'best';
  const model = isBest ? EVALUATED_MODELS.resnet50 : (EVALUATED_MODELS[modelId] || EVALUATED_MODELS.resnet50);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Decodes 3-channel RGB image & standardizes spatial resolution...',
    `Executing forward pass through ${model.name} (${model.parameters} parameters)...`,
    'Computing 7-class softmax posterior probability distribution...',
  ];

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedMs(elapsed);

      if (elapsed > 600 && currentStep === 0) setCurrentStep(1);
      if (elapsed > 1500 && currentStep === 1) setCurrentStep(2);
    }, 50);

    return () => clearInterval(interval);
  }, [currentStep]);

  return (
    <div className="rounded-2xl bg-white border border-charcoal-200 p-8 sm:p-12 shadow-card text-center space-y-6">
      {/* Central Medical Processing Unit */}
      <div className="relative mx-auto w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shadow-subtle">
        <Cpu className="w-8 h-8 text-teal-600 animate-pulse" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-teal-500 animate-ping" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
          <h3 className="text-lg sm:text-xl font-bold text-charcoal-900">
            {isBest ? 'Analyzing with Best Model (ResNet-50)...' : `Running Deep Neural Inference (${model.name})`}
          </h3>
        </div>
        <p className="text-xs font-mono text-charcoal-600 flex items-center justify-center gap-1.5">
          {isBest && <Sparkles className="w-3.5 h-3.5 text-teal-600 inline" />}
          <span>Target Architecture: <strong className="text-charcoal-900">{model.name}</strong> ({model.filename})</span>
        </p>
        <p className="text-[11px] font-mono text-charcoal-400 truncate max-w-sm mx-auto">
          Input file: {imageName}
        </p>
      </div>

      {/* Progress Stages */}
      <div className="max-w-md mx-auto bg-canvas-50 rounded-xl p-4 border border-charcoal-200 text-left space-y-2.5 shadow-sm">
        {steps.map((stepText, idx) => {
          const isDone = currentStep > idx;
          const isCurrent = currentStep === idx;
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0 transition-colors ${
                  isDone
                    ? 'bg-teal-600 text-white'
                    : isCurrent
                    ? 'bg-charcoal-900 text-white animate-pulse'
                    : 'bg-canvas-200 text-charcoal-400'
                }`}
              >
                {isDone ? '✓' : idx + 1}
              </span>
              <span
                className={`transition-colors ${
                  isCurrent
                    ? 'font-semibold text-charcoal-900'
                    : isDone
                    ? 'text-charcoal-500 line-through'
                    : 'text-charcoal-400'
                }`}
              >
                {stepText}
              </span>
            </div>
          );
        })}
      </div>

      {/* Live elapsed timer */}
      <div className="text-[11px] font-mono text-charcoal-400">
        Elapsed execution time: <span className="font-semibold text-charcoal-700">{(elapsedMs / 1000).toFixed(2)}s</span>
      </div>
    </div>
  );
};