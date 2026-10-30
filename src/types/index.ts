export type ModelId = 'resnet50' | 'densenet121' | 'inceptionv3' | 'best' | 'ensemble';

export type LesionClassKey = 'akiec' | 'bcc' | 'bkl' | 'df' | 'mel' | 'nv' | 'vasc';

export interface ModelInfo {
  id: ModelId;
  name: string;
  badge: string;
  filename: string;
  architecture: string;
  inputResolution: string;
  parameters: string;
  depth: string;
  description: string;
  keyFeature: string;
  gradientFlow: string;
  academicCitation: string;
}

export interface LesionClassInfo {
  key: LesionClassKey;
  code: string;
  fullName: string;
  clinicalCategory: 'Malignant' | 'Premalignant / CIS' | 'Benign';
  severityTag: 'High Risk' | 'Moderate Risk' | 'Low Risk / Benign';
  ham10000Frequency: string; // e.g. "67.0%"
  description: string;
  histopathology: string;
  visualHallmarks: string[];
}

export interface ClassProbability {
  key: LesionClassKey;
  label: string;
  code: string;
  probability: number; // 0 to 1
  percentage: number;  // 0 to 100
  isTop: boolean;
}

export interface UncertaintyMetrics {
  entropy: number;
  normalized_entropy: number;
  margin: number;
  top_class: LesionClassKey;
  second_class: LesionClassKey;
  second_confidence: number;
  is_uncertain: boolean;
  reasons: string[];
}

export interface IndividualModelPrediction {
  model_id: string;
  name: string;
  raw_predicted_class?: LesionClassKey;
  predicted_class: LesionClassKey | 'uncertain';
  confidence: number;
  class_probabilities: Record<LesionClassKey, number>;
  inference_time_ms: number;
}

export interface PredictionResponse {
  model: string;
  raw_predicted_class?: LesionClassKey;
  predicted_class: LesionClassKey | 'uncertain';
  confidence: number;
  top_3_predictions?: Array<{ class: LesionClassKey; confidence: number; percentage: number; rank: number }>;
  is_low_confidence?: boolean;
  is_uncertain?: boolean;
  is_supported?: boolean | null;
  domain_status?: string;
  ensemble_method?: string;
  consensus_agreement?: 'unanimous' | 'majority' | 'discordant';
  models_agree?: boolean;
  models_disagree?: boolean;
  active_models?: string[];
  individual_predictions?: Record<string, IndividualModelPrediction>;
  uncertainty_metrics?: UncertaintyMetrics;
  warning?: string | null;
  class_probabilities: Record<LesionClassKey, number>;
  model_inference_ms?: number;
  server_process_ms?: number;
  client_round_trip_ms?: number;
  inference_time_ms?: number;
  input_shape?: number[];
  confidence_threshold?: number;
  timestamp?: string;
}

export interface UploadedImageMeta {
  file: File;
  previewUrl: string;
  name: string;
  sizeFormatted: string;
  width: number;
  height: number;
  type: string;
}

export type AnalysisStatus = 'idle' | 'ready' | 'analyzing' | 'success' | 'error';

export interface BackendStatus {
  online: boolean;
  checkedAt: Date | null;
  latencyMs?: number;
  baseUrl: string;
  active_models?: string[];
  inactive_models?: string[];
  models_ready?: boolean;
}
