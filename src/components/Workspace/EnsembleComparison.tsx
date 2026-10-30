import React, { useState } from 'react';
import { PredictionResponse, LesionClassKey } from '../../types';
import { LESION_CLASSES, ORDERED_CLASS_KEYS } from '../../constants/models';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Table as TableIcon,
  BarChart3,
  Cpu,
} from 'lucide-react';

interface EnsembleComparisonProps {
  prediction: PredictionResponse;
}

export const EnsembleComparison: React.FC<EnsembleComparisonProps> = ({ prediction }) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  // Task 5: Only use models returned by backend
  const individual = prediction?.individual_predictions ?? {};
  const modelKeys = Object.keys(individual);

  if (modelKeys.length === 0) {
    return null;
  }

  const models = modelKeys.map((key) => {
    const info = individual[key];
    const res = key === 'inceptionv3' ? '299 × 299 px' : '224 × 224 px';
    return { key, info, res };
  });

  const isDiscordant = Boolean(prediction.models_disagree) && models.length > 1;
  const isSingleModel = models.length === 1;
  const consensus = isSingleModel ? 'single' : prediction.consensus_agreement || 'unanimous';

  return (
    <div className="rounded-xl bg-white border border-charcoal-200 p-6 shadow-card space-y-6">
      {/* Header with Title and Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-charcoal-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-sage-100 text-sage-800">
              {isSingleModel ? <Cpu className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
            </span>
            <h4 className="text-base font-bold text-charcoal-900">
              {isSingleModel
                ? 'Active Model Architecture Breakdown'
                : `${models.length}-Model Architecture Breakdown & Consensus`}
            </h4>
          </div>
          <p className="text-xs text-charcoal-500">
            {isSingleModel
              ? `Inference executed using active class-balanced architecture (${models[0]?.info?.name || 'Inception-V3'}).`
              : `Simultaneous inference across active architectures (${models.map(m => m.info?.name).join(', ')}) on identical input image.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-charcoal-200 bg-canvas-50 p-0.5 text-xs font-mono">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-charcoal-900 shadow-subtle font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <BarChart3 className="w-3 h-3" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-charcoal-900 shadow-subtle font-semibold'
                  : 'text-charcoal-600 hover:text-charcoal-900'
              }`}
            >
              <TableIcon className="w-3 h-3" />
              <span>Full 7-Class Table</span>
            </button>
          </div>

          {/* Status Pill */}
          {isSingleModel ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sage-50 text-sage-800 border border-sage-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
              Active Model ({models[0]?.info?.name || 'Inception-V3'})
            </span>
          ) : consensus === 'unanimous' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-sage-50 text-sage-800 border border-sage-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-sage-700" />
              Unanimous ({models.length}/{models.length} Agree)
            </span>
          ) : consensus === 'majority' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-50 text-amber-900 border border-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              Majority Agreement
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-rose-50 text-rose-800 border border-rose-300">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Model Disagreement
            </span>
          )}
        </div>
      </div>

      {/* Disagreement / Agreement Advisory Banner (Multi-model only) */}
      {!isSingleModel && (
        isDiscordant ? (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-950 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">
                Architectural Disagreement Detected:
              </span>
              <p className="leading-relaxed text-amber-900">
                The active architectures produced divergent predictions:
                {models.map((m) => (
                  <span key={m.key} className="mx-1 font-mono font-semibold">
                    {m.info?.name || m.key} → {m.info?.predicted_class || 'UNK'} ({(Number(m.info?.confidence ?? 0) * 100).toFixed(1)}%)
                  </span>
                ))}
                . The final prediction is determined by soft-voting probability averaging.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-canvas-50 border border-charcoal-200 text-xs text-charcoal-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sage-700 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              All active architectures independently predicted <strong>{prediction.predicted_class}</strong> as the top class.
            </p>
          </div>
        )
      )}

      {/* View Mode 1: Individual Model Cards (Only for models returned by backend) */}
      {viewMode === 'cards' && (
        <div
          className={`grid gap-4 ${
            models.length === 1
              ? 'grid-cols-1 max-w-xl mx-auto'
              : models.length === 2
              ? 'grid-cols-1 md:grid-cols-2'
              : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {models.map(({ key, info, res }) => {
            const predClsKey = (info?.raw_predicted_class || info?.predicted_class) as LesionClassKey;
            const predCls = LESION_CLASSES[predClsKey];
            const isTopMatch = info?.predicted_class === prediction.predicted_class || info?.raw_predicted_class === prediction.raw_predicted_class;

            return (
              <div
                key={key}
                className={`rounded-lg border p-4 flex flex-col justify-between transition-all ${
                  isTopMatch
                    ? 'bg-canvas-50 border-sage-300 shadow-subtle'
                    : 'bg-white border-charcoal-200'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header: Model Name & Latency */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h5 className="font-bold text-sm text-charcoal-900">{info.name}</h5>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sage-100 text-sage-800 font-medium">Active</span>
                      </div>
                      <span className="text-[10px] font-mono text-charcoal-500">{res}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-charcoal-500 bg-white px-2 py-0.5 rounded border border-charcoal-200">
                      <Clock className="w-3 h-3 text-charcoal-400" />
                      <span>{info?.inference_time_ms ?? '—'} ms</span>
                    </div>
                  </div>

                  {/* Predicted Class Callout */}
                  <div className="p-2.5 rounded-lg bg-white border border-charcoal-200">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-400 block mb-1">
                      Model Top Candidate
                    </span>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-charcoal-900 text-white">
                          {predCls?.code || info.predicted_class}
                        </span>
                        <span className="text-xs font-semibold text-charcoal-800 truncate">
                          {predCls?.fullName || info.predicted_class}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-sm text-charcoal-900 flex-shrink-0">
                        {(Number(info?.confidence ?? 0) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Mini Class Probabilities Breakdown */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-charcoal-400 block">
                      Class Distribution (Top 3)
                    </span>
                    {ORDERED_CLASS_KEYS.map((ckey) => ({
                      key: ckey,
                      score: info?.class_probabilities?.[ckey] ?? 0,
                    }))
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map(({ key: ckey, score }) => (
                        <div key={ckey} className="space-y-0.5">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-charcoal-600">{ckey}</span>
                            <span className="font-medium text-charcoal-800">
                              {(score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-charcoal-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-sage-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(100, Math.max(1, score * 100))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-charcoal-100 text-[10px] font-mono text-charcoal-400 flex items-center justify-between">
                  <span className="text-sage-700 font-medium">✓ Single-pass InceptionV3 (299x299)</span>
                  <span className="text-charcoal-500 font-mono">Keras float32</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Mode 2: Full 7-Class Side-by-Side Comparison Table (Dynamically includes active models) */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg border border-charcoal-200">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-canvas-100 text-charcoal-600 border-b border-charcoal-200">
              <tr>
                <th className="p-3 font-semibold">HAM10000 Class</th>
                {models.map((m) => (
                  <th key={m.key} className="p-3 font-semibold text-right">
                    {m.info.name}
                  </th>
                ))}
                {!isSingleModel && (
                  <th className="p-3 font-semibold text-right bg-sage-50 text-sage-900 border-l border-sage-200">
                    Ensemble Avg
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 bg-white">
              {ORDERED_CLASS_KEYS.map((ckey) => {
                const cls = LESION_CLASSES[ckey];
                const ensScore = prediction?.class_probabilities?.[ckey] ?? 0;
                const isEnsembleTop = ckey === (prediction.raw_predicted_class || prediction.predicted_class);

                return (
                  <tr
                    key={ckey}
                    className={`hover:bg-canvas-50 transition-colors ${
                      isEnsembleTop ? 'bg-sage-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            isEnsembleTop
                              ? 'bg-charcoal-900 text-white'
                              : 'bg-canvas-100 text-charcoal-700 border border-charcoal-200'
                          }`}
                        >
                          {ckey}
                        </span>
                        <span className="font-sans text-xs text-charcoal-800">
                          {cls?.fullName || ckey}
                        </span>
                      </div>
                    </td>
                    {models.map((m) => {
                      const score = m.info?.class_probabilities?.[ckey] ?? 0;
                      return (
                        <td key={m.key} className="p-3 text-right">
                          {(score * 100).toFixed(2)}%
                        </td>
                      );
                    })}
                    {!isSingleModel && (
                      <td
                        className={`p-3 text-right border-l border-sage-200 ${
                          isEnsembleTop
                            ? 'bg-sage-100/70 text-sage-900 font-bold'
                            : 'bg-sage-50/30 text-charcoal-800'
                        }`}
                      >
                        {(ensScore * 100).toFixed(2)}%
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
