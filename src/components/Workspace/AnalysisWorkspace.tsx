import React, { useState } from 'react';
import { ModelId, UploadedImageMeta, PredictionResponse, BackendStatus } from '../../types';
import { WorkspaceHeader } from './WorkspaceHeader';
import { ModelSelector } from './ModelSelector';
import { ImageDropzone } from './ImageDropzone';
import { ImagePreview } from './ImagePreview';
import { InferenceState } from './InferenceState';
import { ConnectionErrorCard } from './ConnectionErrorCard';
import { ResultsDisplay } from './ResultsDisplay';
import { ApiService, PredictionApiResult } from '../../services/api';
import {
  Activity,
  Sparkles,
  Layers,
  Award,
  X,
  CheckCircle,
  HelpCircle,
  BarChart2,
  AlertCircle,
} from 'lucide-react';
import {
  EVALUATED_MODELS,
  VALIDATION_BENCHMARK_RESULTS,
  BEST_VALIDATION_MODEL_ID,
} from '../../constants/models';
import { ErrorBoundary } from '../ErrorBoundary';

interface AnalysisWorkspaceProps {
  selectedModel: ModelId;
  onSelectModel: (id: ModelId) => void;
  backendStatus: BackendStatus;
  onRefreshHealth: () => void;
  isCheckingHealth: boolean;
}

export const AnalysisWorkspace: React.FC<AnalysisWorkspaceProps> = ({
  selectedModel,
  onSelectModel,
  backendStatus,
  onRefreshHealth,
  isCheckingHealth,
}) => {
  const [imageMeta, setImageMeta] = useState<UploadedImageMeta | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeAnalyzingModel, setActiveAnalyzingModel] = useState<ModelId | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [apiErrorResult, setApiErrorResult] = useState<PredictionApiResult | null>(null);
  const [showBenchmarkModal, setShowBenchmarkModal] = useState(false);

  const handleImageSelected = (meta: UploadedImageMeta) => {
    setImageMeta(meta);
    setPrediction(null);
    setApiErrorResult(null);
  };

  const handleClearImage = () => {
    setImageMeta(null);
    setPrediction(null);
    setApiErrorResult(null);
  };

  // Generic analyze function that accepts the target model to run
  const handleAnalyze = async (modelToUse: ModelId) => {
    if (!imageMeta) return;

    setIsAnalyzing(true);
    setActiveAnalyzingModel(modelToUse);
    setApiErrorResult(null);

    try {
      console.log(`[SKINDERMO] Initiating inference with target model: ${modelToUse}...`);
      
      const result = await ApiService.predictLesion(imageMeta.file, modelToUse);

      if (result.success && result.data) {
        if (!result.data.predicted_class || !result.data.class_probabilities) {
          console.error('[SKINDERMO] Malformed prediction response:', result.data);
          setApiErrorResult({
            success: false,
            error: 'Received malformed prediction data from server.',
            errorDetails: {
              url: ApiService.getBaseUrl(),
              endpoint: '/api/predict',
              rawMessage: JSON.stringify(result.data),
              tips: ['Response object was missing predicted_class or class_probabilities.'],
            },
          });
        } else {
          setPrediction(result.data);
        }
      } else {
        console.error('[SKINDERMO] Inference request failed:', result.error, result.errorDetails);
        setApiErrorResult(result);
      }
    } catch (err) {
      console.error('[SKINDERMO] Unhandled error during inference:', err);
      setApiErrorResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unexpected analysis failure',
        errorDetails: {
          url: ApiService.getBaseUrl(),
          endpoint: '/api/predict',
          rawMessage: String(err),
          tips: ['An unhandled exception occurred in the client analysis pipeline.'],
        },
      });
    } finally {
      setIsAnalyzing(false);
      setActiveAnalyzingModel(null);
    }
  };

  // Action 1: Predict with Selected Model
  const handlePredictWithSelected = () => {
    handleAnalyze(selectedModel);
  };

  // Action 2: Find Best Model & Predict
  // Uses empirical validation top-ranked architecture (ResNet-50)
  const handleFindBestAndPredict = () => {
    onSelectModel('best');
    handleAnalyze('best');
  };

  return (
    <section id="workspace" className="py-12 sm:py-16 bg-canvas-50 border-t border-charcoal-200 scroll-mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-7">
        
        {/* Workspace Header */}
        <WorkspaceHeader
          selectedModel={selectedModel}
          backendStatus={backendStatus}
          onRefreshHealth={onRefreshHealth}
          isCheckingHealth={isCheckingHealth}
          onReset={handleClearImage}
          hasImage={Boolean(imageMeta)}
        />

        {/* Content Container */}
        <div className="space-y-6">
          
          {/* 1. Model Selector */}
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={(id) => {
              onSelectModel(id);
              if (prediction) setPrediction(null);
            }}
            disabled={isAnalyzing}
            backendStatus={backendStatus}
            onOpenBenchmarkModal={() => setShowBenchmarkModal(true)}
          />

          {/* 2. Image Ingestion Zone or Preview */}
          {!imageMeta ? (
            <ImageDropzone onImageSelected={handleImageSelected} disabled={isAnalyzing} />
          ) : (
            <div className="space-y-5">
              <ImagePreview
                imageMeta={imageMeta}
                onChangeImage={() => handleClearImage()}
                onRemoveImage={handleClearImage}
                disabled={isAnalyzing}
              />

              {/* Action Button Strip: 2 Distinct Prediction Actions */}
              {!isAnalyzing && !prediction && !apiErrorResult && (
                <div className="p-5 rounded-2xl bg-white border border-charcoal-200 shadow-card space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-charcoal-100">
                    <div className="flex items-center gap-2 text-xs text-charcoal-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse"></span>
                      <span>
                        Target Architecture:{' '}
                        <strong className="text-charcoal-900 font-mono">
                          {selectedModel === 'best'
                            ? 'Best Model (Auto → ResNet-50)'
                            : EVALUATED_MODELS[selectedModel]?.name || selectedModel}
                        </strong>
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-charcoal-500 flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                      <span>Ready for deep forward pass</span>
                    </div>
                  </div>

                  {/* The Two Prediction Action Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Action 1: Predict with Selected Model */}
                    <button
                      type="button"
                      id="predict-selected-btn"
                      onClick={handlePredictWithSelected}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-charcoal-900 text-white font-semibold text-xs sm:text-sm shadow-subtle hover:bg-charcoal-800 active:scale-[0.99] transition-all border border-charcoal-800 group"
                    >
                      <Activity className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
                      <span>Predict with Selected Model</span>
                    </button>

                    {/* Action 2: Find Best Model & Predict */}
                    <button
                      type="button"
                      id="find-best-predict-btn"
                      onClick={handleFindBestAndPredict}
                      className="inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold text-xs sm:text-sm shadow-card hover:from-teal-700 hover:to-teal-800 active:scale-[0.99] transition-all border border-teal-700 group"
                    >
                      <Award className="w-4 h-4 text-teal-200 group-hover:scale-110 transition-transform" />
                      <span>Find Best Model & Predict</span>
                      <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-white ml-1 font-normal">
                        ResNet-50 (67.58%)
                      </span>
                    </button>
                  </div>

                  <p className="text-[11px] text-charcoal-500 text-center font-mono">
                    "Find Best Model & Predict" evaluates the empirical validation ranking across ResNet50, DenseNet121, and InceptionV3 and runs the top model.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. Inference Loading State */}
          {isAnalyzing && imageMeta && (
            <InferenceState modelId={activeAnalyzingModel || selectedModel} imageName={imageMeta.name} />
          )}

          {/* 4. Connection Error Screen */}
          {apiErrorResult && !isAnalyzing && (
            <ConnectionErrorCard
              errorMessage={apiErrorResult.error}
              errorDetails={apiErrorResult.errorDetails}
              selectedModel={selectedModel}
              onRetry={() => {
                if (
                  apiErrorResult?.errorDetails?.statusCode === 400 ||
                  apiErrorResult?.errorDetails?.statusCode === 422
                ) {
                  handleClearImage();
                } else {
                  handleAnalyze(selectedModel);
                }
              }}
            />
          )}

          {/* 5. Results Screen */}
          {prediction && imageMeta && !isAnalyzing && (
            <ErrorBoundary fallbackTitle="Results Display Render Error" onReset={handleClearImage}>
              <ResultsDisplay
                prediction={prediction}
                imageMeta={imageMeta}
                onAnalyzeAnother={handleClearImage}
              />
            </ErrorBoundary>
          )}

        </div>

      </div>

      {/* Empirical Validation Benchmark Modal */}
      {showBenchmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-charcoal-200 shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-teal-600" />
                <h3 className="text-base sm:text-lg font-bold text-charcoal-900">
                  Empirical Model Comparison (HAM10000 Validation Test Set)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBenchmarkModal(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-canvas-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-charcoal-600 leading-relaxed">
              Official validation performance from <code className="bg-canvas-100 px-1 py-0.5 rounded text-[11px] font-mono">model_comparison.csv</code> evaluated on the held-out test split of the HAM10000 dataset:
            </p>

            <div className="overflow-x-auto border border-charcoal-200 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-canvas-100 text-charcoal-700 border-b border-charcoal-200">
                  <tr>
                    <th className="p-3 font-semibold">Rank & Model</th>
                    <th className="p-3 font-semibold">Accuracy</th>
                    <th className="p-3 font-semibold">Weighted F1</th>
                    <th className="p-3 font-semibold">Macro Precision</th>
                    <th className="p-3 font-semibold">Macro F1</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {VALIDATION_BENCHMARK_RESULTS.map((row) => (
                    <tr
                      key={row.modelId}
                      className={row.rank === 1 ? 'bg-teal-50/50 font-semibold' : 'hover:bg-canvas-50'}
                    >
                      <td className="p-3 flex items-center gap-1.5">
                        {row.rank === 1 && (
                          <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px]">
                            1
                          </span>
                        )}
                        <span>{row.name}</span>
                        {row.rank === 1 && (
                          <span className="text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-sans">
                            Best
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-charcoal-900 font-bold">{(row.accuracy * 100).toFixed(2)}%</td>
                      <td className="p-3 text-charcoal-800">{(row.weightedF1 * 100).toFixed(2)}%</td>
                      <td className="p-3 text-charcoal-600">{(row.macroPrecision * 100).toFixed(2)}%</td>
                      <td className="p-3 text-charcoal-600">{(row.macroF1 * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-xl bg-canvas-50 border border-charcoal-200 text-xs text-charcoal-700 space-y-1">
              <span className="font-bold text-charcoal-900 block">Why ResNet-50 is Ranked #1:</span>
              <p className="text-[11px] leading-relaxed text-charcoal-600">
                ResNet-50 achieved the highest overall classification accuracy (<strong>67.58%</strong>) and highest weighted F1-score (<strong>58.98%</strong>) on the 7-class HAM10000 benchmark, outperforming DenseNet-121 (67.06%) and Inception-V3 (64.96%).
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowBenchmarkModal(false)}
                className="px-5 py-2 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-charcoal-800 transition-colors"
              >
                Close Benchmark Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};