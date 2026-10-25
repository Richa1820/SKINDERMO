export type ModelId = 'resnet50' | 'densenet121' | 'inceptionv3';

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

export interface PredictionResponse {
  model: string;
  predicted_class: LesionClassKey;
  confidence: number;
  class_probabilities: Record<LesionClassKey, number>;
  model_inference_ms?: number;
  server_process_ms?: number;
  client_round_trip_ms?: number;
  inference_time_ms?: number;
  input_shape?: number[];
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
}
