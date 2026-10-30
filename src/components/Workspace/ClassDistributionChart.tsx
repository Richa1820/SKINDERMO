import React from 'react';
import { LesionClassKey } from '../../types';
import { LESION_CLASSES, ORDERED_CLASS_KEYS } from '../../constants/models';

interface ClassDistributionChartProps {
  probabilities: Record<LesionClassKey, number>;
  predictedClass?: string;
}

export const ClassDistributionChart: React.FC<ClassDistributionChartProps> = ({
  probabilities,
  predictedClass,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs font-mono text-charcoal-500 pb-1.5 border-b border-charcoal-100">
        <span>HAM10000 Diagnostic Class</span>
        <span>Posterior Probability</span>
      </div>

      <div className="space-y-2.5">
        {ORDERED_CLASS_KEYS.map((key) => {
          const cls = LESION_CLASSES[key];
          const rawScore = probabilities?.[key] ?? 0;
          const percentage = (Number(rawScore ?? 0) * 100).toFixed(1);
          const isWinner = key === predictedClass;
          const isMalignant = cls?.clinicalCategory === 'Malignant';
          const isPremalignant = cls?.clinicalCategory === 'Premalignant / CIS';

          return (
            <div
              key={key}
              className={`p-3 rounded-xl border transition-all ${
                isWinner
                  ? 'bg-gradient-to-r from-teal-50/80 to-white border-teal-300 shadow-subtle ring-1 ring-teal-500/20'
                  : 'bg-white border-charcoal-200 hover:border-charcoal-300'
              }`}
            >
              {/* Top Row: Code, Name, Category Badge, and Score */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded-md ${
                      isWinner
                        ? 'bg-charcoal-900 text-white'
                        : 'bg-canvas-100 text-charcoal-700 border border-charcoal-200'
                    }`}
                  >
                    {cls.code}
                  </span>
                  <span
                    className={`text-xs sm:text-sm truncate ${
                      isWinner
                        ? 'font-bold text-charcoal-900'
                        : 'font-medium text-charcoal-800'
                    }`}
                  >
                    {cls.fullName}
                  </span>
                  <span
                    className={`hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full border ${
                      isMalignant
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : isPremalignant
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {cls.clinicalCategory}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 font-mono">
                  <span
                    className={`text-xs ${
                      isWinner
                        ? 'font-bold text-teal-900 text-sm'
                        : 'font-medium text-charcoal-600'
                    }`}
                  >
                    {percentage}%
                  </span>
                  {isWinner && (
                    <span className="text-[10px] font-mono text-teal-800 font-bold bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded">
                      TOP
                    </span>
                  )}
                </div>
              </div>

              {/* Horizontal Probability Bar */}
              <div className="w-full h-2 rounded-full bg-canvas-200 overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    isWinner
                      ? 'bg-teal-600'
                      : isMalignant
                      ? 'bg-rose-400'
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