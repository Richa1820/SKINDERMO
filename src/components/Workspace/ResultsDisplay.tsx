import React, { useState } from 'react';
import { PredictionResponse, UploadedImageMeta, LesionClassKey } from '../../types';
import { LESION_CLASSES, EVALUATED_MODELS } from '../../constants/models';
import { ClassDistributionChart } from './ClassDistributionChart';
import { EnsembleComparison } from './EnsembleComparison';
import {
  ShieldAlert,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Info,
  CheckCircle,
  Sparkles,
  Layers,
  ArrowRight,
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
  const isLowConfidence =
    prediction?.predicted_class === 'uncertain' ||
    Boolean(prediction?.is_low_confidence) ||
    Number(prediction?.confidence ?? 0) < 0.5;
  const isUncertain = Boolean(prediction?.is_uncertain) || isLowConfidence;

  const rawKey =
    prediction?.raw_predicted_class ||
    (prediction?.predicted_class !== 'uncertain' ? prediction?.predicted_class : undefined);
  const rawClass = rawKey && rawKey in LESION_CLASSES ? LESION_CLASSES[rawKey as LesionClassKey] : null;

  const validTopClass =
    !isLowConfidence &&
    prediction?.predicted_class &&
    prediction.predicted_class !== 'uncertain' &&
    prediction.predicted_class in LESION_CLASSES
      ? LESION_CLASSES[prediction.predicted_class as LesionClassKey]
      : rawClass;

  const topClass = validTopClass || {
    key: (prediction?.predicted_class as any) || 'uncertain',
    code: isLowConfidence ? 'UNC' : prediction?.predicted_class?.toUpperCase() || 'UNK',
    fullName: isLowConfidence ? 'Uncertain / Indeterminate Lesion' : prediction?.predicted_class || 'Evaluated Lesion',
    clinicalCategory: isLowConfidence ? 'Indeterminate' : 'Unclassified',
    severityTag: isLowConfidence ? 'Notice / Out-of-Distribution' : 'Notice',
    ham10000Frequency: 'N/A',
    description: isLowConfidence
      ? 'The model confidence for this image is below the 50% diagnostic safety threshold. The image may contain ambiguous morphological features or fall outside the HAM10000 training distribution.'
      : 'Closed-set neural network classification output.',
    histopathology: '',
    visualHallmarks: [],
  };

  const modelKey = prediction?.model || 'inceptionv3';
  const modelInfo = EVALUATED_MODELS[modelKey] || {
    id: modelKey as any,
    name: modelKey === 'resnet50' ? 'ResNet-50' : modelKey === 'densenet121' ? 'DenseNet-121' : 'Inception-V3',
    badge: 'Neural Backbone',
    filename: `${modelKey}_best.keras`,
    architecture: 'Deep Convolutional Neural Network',
    inputResolution: '224 × 224 × 3',
    parameters: 'Deep CNN',
    depth: 'Deep Layers',
    description: 'Trained on HAM10000 benchmark dataset.',
    keyFeature: 'Hierarchical feature extraction',
    gradientFlow: 'Backpropagation skips',
    academicCitation: 'SKINDERMO Research Architecture',
  };

  const confidencePercentage = (Number(prediction?.confidence ?? 0) * 100).toFixed(1);
  const isMalignant = topClass.clinicalCategory === 'Malignant';
  const isPremalignant = topClass.clinicalCategory === 'Premalignant / CIS';

  const copyResultsJson = () => {
    navigator.clipboard.writeText(JSON.stringify(prediction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Quick Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-charcoal-200 shadow-card">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
            <CheckCircle className="w-4 h-4 text-teal-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-charcoal-900 block">Inference Complete</span>
            <span className="text-[11px] font-mono text-charcoal-500">
              Evaluated Model: <strong className="text-charcoal-800">{modelInfo.name}</strong> • Latency:{' '}
              {prediction.inference_time_ms ? `${prediction.inference_time_ms} ms` : 'Fast'}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-charcoal-900 text-white hover:bg-charcoal-800 text-xs font-semibold shadow-subtle transition-all border border-charcoal-800"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Upload Another Image</span>
        </button>
      </div>

      {/* Low-confidence / Uncertain Banner */}
      {isLowConfidence && (
        <div id="uncertain-lesion-banner" className="rounded-2xl p-5 sm:p-6 bg-amber-50 border-2 border-amber-400 shadow-md flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base sm:text-lg font-bold text-amber-950">
                Uncertain / Indeterminate Classification
              </h4>
              <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded bg-amber-200/80 text-amber-950 border border-amber-300">
                Confidence: {confidencePercentage}% (&lt; 50% Threshold)
              </span>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              The highest model probability for this image is <strong>{confidencePercentage}%</strong>, which is below the defined 50.0% confidence threshold. The uploaded photograph may not depict a recognizable skin lesion, or presents ambiguous dermoscopic features.
            </p>
            {prediction?.top_3_predictions && prediction.top_3_predictions.length > 0 && (
              <div className="pt-2 mt-2 border-t border-amber-200">
                <span className="text-xs font-semibold text-amber-950 block mb-1.5 font-mono uppercase tracking-wider">
                  Top-3 Relative Model Assignments:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {prediction.top_3_predictions.map((candidate) => (
                    <div key={candidate.class} className="px-3 py-2 rounded-lg bg-white border border-amber-300 flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-charcoal-900">{candidate.class.toUpperCase()} ({LESION_CLASSES[candidate.class]?.fullName || candidate.class})</span>
                      <span className="font-bold text-amber-900">{(candidate.percentage ?? (candidate.confidence * 100)).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Result Card */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border shadow-card transition-all ${
          isUncertain
            ? 'bg-white border-amber-300'
            : isMalignant
            ? 'bg-white border-rose-200'
            : isPremalignant
            ? 'bg-white border-amber-200'
            : 'bg-white border-teal-200/80 ring-1 ring-teal-500/10'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-900 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-teal-600" />
                <span>Model: {modelInfo.name}</span>
              </span>

              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${
                  isLowConfidence
                    ? 'bg-amber-100 text-amber-950 border-amber-300 font-mono'
                    : isMalignant
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : isPremalignant
                    ? 'bg-amber-50 text-amber-900 border-amber-200'
                    : 'bg-teal-50 text-teal-800 border-teal-200'
                }`}
              >
                Category: {topClass.clinicalCategory}
              </span>

              <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-canvas-100 text-charcoal-600 border border-charcoal-200">
                Risk: {topClass.severityTag}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-charcoal-900">
                  {topClass.code}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                  {topClass.fullName}
                </h3>
              </div>
            </div>

            {/* Short Clinical Explanation */}
            <div className="p-3.5 rounded-xl bg-canvas-50 border border-charcoal-100 text-xs sm:text-sm text-charcoal-700 leading-relaxed space-y-1.5">
              <p>
                <strong className="text-charcoal-900">Clinical Overview:</strong> {topClass.description}
              </p>
              {topClass.visualHallmarks && topClass.visualHallmarks.length > 0 && (
                <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs text-charcoal-600">
                  <span className="font-semibold text-charcoal-800">Visual Hallmarks:</span>
                  {topClass.visualHallmarks.map((h, hIdx) => (
                    <span key={hIdx} className="bg-white px-2 py-0.5 rounded border border-charcoal-200 text-[11px]">
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Model Estimated Score Visual Gauge */}
          <div
            className={`p-5 sm:p-6 rounded-2xl border shadow-subtle flex flex-col items-center justify-center min-w-[210px] text-center ${
              isUncertain
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-gradient-to-b from-teal-50/60 to-white border-teal-200'
            }`}
          >
            <span className="text-[11px] font-mono uppercase tracking-wider text-charcoal-500 font-semibold mb-1">
              Prediction Confidence
            </span>
            <div
              className={`text-4xl sm:text-5xl font-extrabold font-mono tracking-tight ${
                isUncertain ? 'text-amber-800' : 'text-teal-900'
              }`}
            >
              {confidencePercentage}%
            </div>
            
            <div className="w-full h-2 rounded-full bg-charcoal-100 mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isUncertain ? 'bg-amber-500' : isMalignant ? 'bg-rose-600' : 'bg-teal-600'
                }`}
                style={{ width: `${Math.max(Number(confidencePercentage), 2)}%` }}
              />
            </div>

            <div className="text-[10px] text-charcoal-500 mt-2 font-mono">
              7-Class Normalized Softmax
            </div>
          </div>
        </div>

        {/* Telemetry Strip */}
        <div className="mt-6 pt-4 border-t border-charcoal-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-charcoal-400 block text-[10px]">MODEL ARCHITECTURE</span>
            <span className="font-semibold text-charcoal-800">{modelInfo.name}</span>
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">WEIGHT FILE</span>
            <span className="font-semibold text-charcoal-800 truncate block">
              {modelInfo.filename}
            </span>
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">INFERENCE TIME</span>
            <span className="font-semibold text-charcoal-900">
              {typeof prediction.model_inference_ms === 'number'
                ? `${prediction.model_inference_ms} ms`
                : typeof prediction.inference_time_ms === 'number'
                ? `${prediction.inference_time_ms} ms`
                : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-charcoal-400 block text-[10px]">INPUT RESOLUTION</span>
            <span className="font-semibold text-charcoal-800">
              {imageMeta.width} × {imageMeta.height} px
            </span>
          </div>
        </div>
      </div>

      {/* 7-Class Distribution Horizontal Bar Chart */}
      <div className="rounded-2xl bg-white border border-charcoal-200 p-6 sm:p-7 shadow-card space-y-4">
        <div>
          <h4 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
            <span>Differential Probability Breakdown (7 HAM10000 Classes)</span>
          </h4>
          <p className="text-xs text-charcoal-500 mt-1">
            Posterior probability distribution generated by the softmax output layer across all seven diagnostic categories.
          </p>
        </div>

        <ClassDistributionChart
          probabilities={prediction?.class_probabilities ?? {}}
          predictedClass={rawKey || prediction?.predicted_class}
        />
      </div>

      {/* Ensemble breakdown if present */}
      {prediction.individual_predictions && (
        <EnsembleComparison prediction={prediction} />
      )}

      {/* Mandatory Non-Diagnostic Research Notice */}
      <div className="rounded-2xl bg-teal-50/50 border border-teal-200 p-4 sm:p-5 text-xs text-charcoal-800 flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-teal-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-charcoal-900 block text-xs">
            Academic Research Prototype — Non-Diagnostic System Notice:
          </span>
          <p className="leading-relaxed text-charcoal-600 text-[11px] sm:text-xs">
            SKINDERMO is an academic engineering research project for skin lesion image classification using deep learning. It does not replace professional dermatological examination, dermoscopy, or biopsy confirmation. Any suspicious lesion must be evaluated by a certified medical dermatologist.
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        <button
          type="button"
          onClick={copyResultsJson}
          className="flex items-center gap-1.5 text-xs text-charcoal-700 hover:text-charcoal-900 py-2.5 px-3.5 rounded-xl border border-charcoal-200 hover:bg-canvas-100 transition-colors shadow-subtle"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-teal-700" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied Raw Output JSON' : 'Copy Prediction Output JSON'}</span>
        </button>

        <button
          type="button"
          onClick={onAnalyzeAnother}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-charcoal-900 text-white font-semibold text-xs shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all border border-charcoal-800"
        >
          <RotateCcw className="w-3.5 h-3.5 text-teal-400" />
          <span>Analyze Another Lesion Image</span>
        </button>
      </div>
    </div>
  );
};