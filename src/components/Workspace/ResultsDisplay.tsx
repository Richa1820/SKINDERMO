import React, { useState } from 'react';
import { PredictionResponse, UploadedImageMeta } from '../../types';
import { LESION_CLASSES, EVALUATED_MODELS } from '../../constants/models';
import { ClassDistributionChart } from './ClassDistributionChart';
import {
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ResultsDisplayProps {
  prediction: PredictionResponse;
  imageMeta: UploadedImageMeta;
  onAnalyzeAnother: () => void;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  prediction,
  imageMeta,
  onAnalyzeAnother,
}) => {
  const [copied, setCopied] = useState(false);
  const topClass = LESION_CLASSES[prediction.predicted_class];
  const modelInfo = EVALUATED_MODELS[prediction.model] || {
    name: prediction.model,
    filename: `${prediction.model}.keras`,
    architecture: 'Deep CNN',
  };

  const confidencePercentage = (prediction.confidence * 100).toFixed(1);
  const isMalignant = topClass.clinicalCategory === 'Malignant';
  const isPremalignant = topClass.clinicalCategory === 'Premalignant / CIS';

  const copyResultsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(prediction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Predicted Class Card */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-card transition-all ${
          isMalignant
            ? 'bg-gradient-to-br from-white to-rose-50/50 border-rose-200'
            : isPremalignant
            ? 'bg-gradient-to-br from-white to-amber-50/50 border-amber-200'
            : 'bg-gradient-to-br from-white to-forest-50/50 border-forest-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest-800 bg-forest-100/70 px-2.5 py-0.5 rounded">
                Predicted HAM10000 Class
              </span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  isMalignant
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : isPremalignant
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                {topClass.clinicalCategory}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-charcoal-950">
                {topClass.code}
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                {topClass.fullName}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl leading-relaxed">
              {topClass.description}
            </p>
          </div>

          {/* Model Estimated Score Box */}
          <div className="p-5 rounded-2xl bg-white border border-charcoal-200/90 shadow-subtle flex flex-col items-center justify-center min-w-[200px] text-center">
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-400 font-semibold mb-1">
              Model Estimated Score
            </span>
            <div className="text-4xl font-extrabold font-mono text-forest-950 tracking-tight">
              {confidencePercentage}%
            </div>
            <div className="text-[10px] text-charcoal-400 mt-1 font-mono">
              Confidence Range: 0.00 – 1.00
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-6 pt-5 border-t border-charcoal-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-charcoal-400 block text-[10px]">EVALUATED MODEL</span>
            <span className="font-semibold text-charcoal-800">{modelInfo.name}</span>
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">WEIGHT FILE</span>
            <span className="font-semibold text-charcoal-800 truncate block">
              {modelInfo.filename}
            </span>
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">MODEL FORWARD PASS</span>
            <span className="font-semibold text-forest-900">
              {typeof prediction.model_inference_ms === 'number'
                ? `${prediction.model_inference_ms} ms`
                : typeof prediction.inference_time_ms === 'number'
                ? `${prediction.inference_time_ms} ms`
                : 'N/A'}
            </span>
            {typeof prediction.client_round_trip_ms === 'number' && (
              <span className="text-[10px] text-charcoal-400 block mt-0.5">
                HTTP API: {prediction.client_round_trip_ms} ms
              </span>
            )}
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">INPUT RESOLUTION</span>
            <span className="font-semibold text-charcoal-800">
              {imageMeta.width} × {imageMeta.height} px
            </span>
            <span className="text-[10px] text-charcoal-400 block mt-0.5">
              Target: {modelInfo.inputResolution.split('×')[0].trim()}×{modelInfo.inputResolution.split('×')[1].trim()}
            </span>
          </div>
        </div>
      </div>

      {/* 7-Class Distribution Horizontal Bar Chart */}
      <div className="rounded-2xl bg-white border border-charcoal-200/90 p-6 sm:p-7 shadow-card space-y-4">
        <div>
          <h4 className="text-base font-bold text-charcoal-900">
            Comparative Differential Probability Distribution
          </h4>
          <p className="text-xs text-charcoal-500 mt-0.5">
            Full softmax posterior vector evaluated across all seven benchmark classes in HAM10000 order.
          </p>
        </div>

        <ClassDistributionChart
          probabilities={prediction.class_probabilities}
          predictedClass={prediction.predicted_class}
        />
      </div>

      {/* Mandatory Non-Diagnostic Research Notice */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-charcoal-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-amber-900 block">
            Academic Research Output Notice:
          </span>
          <p className="leading-relaxed text-charcoal-700">
            This output is an experimental convolutional image classification score calculated on a single 2D photograph. It does not constitute a clinical dermatological diagnosis, biopsy confirmation, or medical treatment recommendation.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={copyResultsJson}
          className="flex items-center gap-1.5 text-xs text-charcoal-600 hover:text-charcoal-900 py-2 px-3 rounded-lg border border-charcoal-200 hover:bg-canvas-100 transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Raw JSON' : 'Copy Raw Output JSON'}</span>
        </button>

        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest-900 text-white font-semibold text-xs shadow-card hover:bg-forest-800 active:scale-[0.98] transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Analyze Another Lesion Image</span>
        </button>
      </div>

    </div>
  );
};
