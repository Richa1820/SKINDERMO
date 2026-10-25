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
import { Activity } from 'lucide-react';
import { EVALUATED_MODELS } from '../../constants/models';

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
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [apiErrorResult, setApiErrorResult] = useState<PredictionApiResult | null>(null);

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

  const handleAnalyze = async () => {
    if (!imageMeta) return;

    setIsAnalyzing(true);
    setApiErrorResult(null);

    // Call real FastAPI endpoint
    const result = await ApiService.predictLesion(imageMeta.file, selectedModel);

    setIsAnalyzing(false);

    if (result.success && result.data) {
      setPrediction(result.data);
    } else {
      setApiErrorResult(result);
    }
  };

  return (
    <section id="workspace" className="py-12 sm:py-16 bg-[#FAF9F6] border-t border-charcoal-200/90 scroll-mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
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
              // Clear current prediction to prompt re-analysis under new model
              if (prediction) setPrediction(null);
            }}
            disabled={isAnalyzing}
          />

          {/* 2. Image Ingestion Zone or Preview */}
          {!imageMeta ? (
            <ImageDropzone onImageSelected={handleImageSelected} disabled={isAnalyzing} />
          ) : (
            <div className="space-y-6">
              <ImagePreview
                imageMeta={imageMeta}
                onChangeImage={() => handleClearImage()}
                onRemoveImage={handleClearImage}
                disabled={isAnalyzing}
              />

              {/* Action Button Strip if ready to analyze */}
              {!isAnalyzing && !prediction && !apiErrorResult && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-charcoal-200/90 shadow-card">
                  <div className="text-xs text-charcoal-600 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>
                      Ready to execute forward pass with{' '}
                      <strong className="text-charcoal-900 font-mono">
                        {EVALUATED_MODELS[selectedModel].filename}
                      </strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAnalyze}
                    id="trigger-analyze-btn"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-forest-900 text-white font-semibold text-sm shadow-card hover:bg-forest-800 active:scale-[0.98] transition-all group border border-forest-700/60"
                  >
                    <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Analyze Image with {EVALUATED_MODELS[selectedModel].name}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3. Inference State */}
          {isAnalyzing && imageMeta && (
            <InferenceState modelId={selectedModel} imageName={imageMeta.name} />
          )}

          {/* 4. Connection Error Screen */}
          {apiErrorResult && !isAnalyzing && (
            <ConnectionErrorCard
              errorMessage={apiErrorResult.error}
              errorDetails={apiErrorResult.errorDetails}
              selectedModel={selectedModel}
              onRetry={handleAnalyze}
            />
          )}

          {/* 5. Results Screen */}
          {prediction && imageMeta && !isAnalyzing && (
            <ResultsDisplay
              prediction={prediction}
              imageMeta={imageMeta}
              onAnalyzeAnother={handleClearImage}
            />
          )}

        </div>

      </div>
    </section>
  );
};
