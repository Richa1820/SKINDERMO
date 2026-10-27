import React from 'react';
import { LesionClassKey } from '../../types';
import { LESION_CLASSES, ORDERED_CLASS_KEYS } from '../../constants/models';

interface ClassDistributionChartProps {
  probabilities: Record<LesionClassKey, number>;
  predictedClass: LesionClassKey;
}

export const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({
  probabilities,
  predictedClass,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-charcoal-500 pb-1 border-b border-charcoal-100">
        <span>Diagnostic Class (HAM10000)</span>
        <span>Model Estimated Score</span>
      </div>

      <div className="space-y-2.5">
        {ORDERED_CLASS_KEYS.map((key) => {
          const cls = LESION_CLASSES[key];
          const rawScore = probabilities[key] || 0;
          const percentage = (rawScore * 100).toFixed(1);
          const isWinner = key === predictedClass;
          const isMalignant = cls.clinicalCategory === 'Malignant';
          const isPremalignant = cls.clinicalCategory === 'Premalignant / CIS';

          return (
            <div
              key={key}
              className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                isWinner
                  ? 'bg-sage-50/70 border-sage-300 shadow-subtle'
                  : 'bg-white border-charcoal-200'
              }`}
            >
              {/* Top Row: Code, Name, Severity Badge, and Score */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      isWinner
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-canvas-100 text-charcoal-700 border border-charcoal-200'
                    }`}
                  >
                    {cls.code}
                  </span>
                  <span
                    className={`text-xs truncate ${
                      isWinner
                        ? 'font-bold text-charcoal-900'
                        : 'font-medium text-charcoal-800'
                    }`}
                  >
                    {cls.fullName}
                  </span>
                  <span
                    className={`hidden sm:inline-block text-[9px] px-1.5 py-0.5 rounded border ${
                      isMalignant
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isPremalignant
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-sage-50 text-sage-800 border-sage-200'
                    }`}
                  >
                    {cls.clinicalCategory}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                  <span
                    className={`text-xs ${
                      isWinner
                        ? 'font-bold text-charcoal-900 text-sm'
                        : 'font-medium text-charcoal-600'
                    }`}
                  >
                    {percentage}%
                  </span>
                  {isWinner && (
                    <span className="text-[10px] font-mono text-sage-800 font-bold bg-sage-100 border border-sage-200 px-1.5 py-0.5 rounded">
                      TOP
                    </span>
                  )}
                </div>
              </div>

              {/* Horizontal Bar */}
              <div className="w-full h-1.5 rounded-full bg-canvas-200 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    isWinner
                      ? 'bg-sage-600'
                      : isMalignant
                      ? 'bg-rose-300'
                      : 'bg-charcoal-300'
                  }`}
                  style={{ width: `${Math.max(Number(percentage), 1.2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
