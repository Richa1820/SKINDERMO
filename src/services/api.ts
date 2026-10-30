import { PredictionResponse, ModelId, BackendStatus, LesionClassKey } from '../types';
import { ORDERED_CLASS_KEYS, BEST_VALIDATION_MODEL_ID } from '../constants/models';
import { resizeImageForUpload } from './imageUtils';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '');

export interface PredictionApiResult {
  success: boolean;
  data?: PredictionResponse;
  error?: string;
  errorDetails?: {
    statusCode?: number;
    url: string;
    endpoint: string;
    tips: string[];
    rawMessage?: string;
  };
}

export class ApiService {
  public static getBaseUrl(): string {
    return API_BASE_URL;
  }

  /**
   * Health check to test if the Python FastAPI backend is reachable
   */
  public static async checkHealth(): Promise<BackendStatus> {
    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Attempt to ping health or root
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      }).catch(async () => {
        // Fallback check on root /
        return fetch(`${API_BASE_URL}/`, {
          method: 'GET',
          signal: controller.signal,
        });
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (response.ok) {
        let healthData: any = null;
        try {
          healthData = await response.json();
        } catch {
          // non-json ok response
        }
        return {
          online: true,
          checkedAt: new Date(),
          latencyMs,
          baseUrl: API_BASE_URL,
          active_models: Array.isArray(healthData?.active_models) ? healthData.active_models : undefined,
          inactive_models: Array.isArray(healthData?.inactive_models) ? healthData.inactive_models : undefined,
          models_ready: typeof healthData?.models_ready === 'boolean' ? healthData.models_ready : undefined,
        };
      } else {
        return {
          online: false,
          checkedAt: new Date(),
          latencyMs,
          baseUrl: API_BASE_URL,
        };
      }
    } catch {
      return {
        online: false,
        checkedAt: new Date(),
        baseUrl: API_BASE_URL,
      };
    }
  }

  /**
   * Send image and model to POST /api/predict
   * Strictly relies on the actual FastAPI backend.
   * NEVER fabricates fake predictions if backend is unavailable.
   */
  public static async predictLesion(
    imageFile: File,
    modelId: ModelId
  ): Promise<PredictionApiResult> {
    // 1. Client-side fast downscale (max 1024px longest side, JPEG 0.90)
    let fileToUpload = imageFile;
    try {
      const resizeResult = await resizeImageForUpload(imageFile, 1024, 0.9);
      fileToUpload = resizeResult.file;
    } catch (resizeErr) {
      console.warn('[SKINDERMO] Client-side resize skipped due to error:', resizeErr);
    }

    // 2. Resolve 'best' to empirical top-performing architecture (ResNet-50)
    const effectiveModelId = modelId === 'best' ? BEST_VALIDATION_MODEL_ID : modelId;

    // 3. Select endpoint: dedicated /api/ensemble for tri-model, or /api/predict for single model
    const endpoint = effectiveModelId === 'ensemble'
      ? `${API_BASE_URL}/api/ensemble`
      : `${API_BASE_URL}/api/predict`;

    const formData = new FormData();
    formData.append('file', fileToUpload, fileToUpload.name);
    if (effectiveModelId !== 'ensemble') {
      formData.append('model', effectiveModelId);
    }

    const startTime = performance.now();
    const controller = new AbortController();
    // 60s timeout with AbortController as requested
    const timeoutMs = 60000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorText = '';
        try {
          const errJson = await response.json();
          errorText = errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch {
          errorText = await response.text();
        }

        if (response.status === 400 || response.status === 422) {
          return {
            success: false,
            error: errorText || `Upload validation error (HTTP ${response.status})`,
            errorDetails: {
              statusCode: response.status,
              url: API_BASE_URL,
              endpoint: '/api/predict',
              rawMessage: errorText,
              tips: [
                'Ensure the uploaded file is a valid 2D photographic dermoscopy image.',
                'Video files, corrupted files, empty uploads, and non-image formats are rejected before model inference.',
                'Supported image formats are: JPEG, PNG, WEBP, BMP, and TIFF.',
              ],
            },
          };
        }

        return {
          success: false,
          error: `Inference endpoint returned HTTP ${response.status}: ${response.statusText}`,
          errorDetails: {
            statusCode: response.status,
            url: API_BASE_URL,
            endpoint: '/api/predict',
            rawMessage: errorText,
            tips: [
              'Verify that the FastAPI server is running with the requested model weights (.keras).',
              `Check server terminal logs for error traces on POST ${endpoint}.`,
              'Ensure the uploaded file is a valid 3-channel RGB dermoscopy image.',
            ],
          },
        };
      }

      let json: any;
      try {
        json = await response.json();
      } catch (parseErr) {
        return {
          success: false,
          error: 'Server returned a non-JSON response payload.',
          errorDetails: {
            url: API_BASE_URL,
            endpoint: '/api/predict',
            rawMessage: String(parseErr),
            tips: [
              'The server response could not be parsed as JSON.',
              'Check backend terminal logs for unhandled Python errors or HTML error pages.',
            ],
          },
        };
      }

      // Validate response shape before processing
      if (!json || typeof json !== 'object') {
        return {
          success: false,
          error: 'Invalid response format: backend returned a non-object payload.',
          errorDetails: {
            url: API_BASE_URL,
            endpoint: '/api/predict',
            rawMessage: typeof json,
            tips: [
              'The server did not return a structured JSON object.',
              'Ensure the endpoint returns the standard SKINDERMO schema.',
            ],
          },
        };
      }

      if (!json.predicted_class && !json.class_probabilities && !json.probabilities) {
        return {
          success: false,
          error: 'Invalid response format: missing classification results from model.',
          errorDetails: {
            url: API_BASE_URL,
            endpoint: '/api/predict',
            rawMessage: JSON.stringify(json),
            tips: [
              'The server response did not contain predicted_class or class_probabilities.',
              'Ensure the model inference pipeline completed without error.',
            ],
          },
        };
      }

      // Normalize probabilities across all 7 HAM10000 classes
      const rawProbabilities = json.class_probabilities || json.probabilities || {};
      const normalizedProbabilities: Record<LesionClassKey, number> = {
        akiec: 0,
        bcc: 0,
        bkl: 0,
        df: 0,
        mel: 0,
        nv: 0,
        vasc: 0,
      };

      for (const key of ORDERED_CLASS_KEYS) {
        if (typeof rawProbabilities[key] === 'number') {
          normalizedProbabilities[key] = rawProbabilities[key];
        }
      }

      // Determine predicted class
      let predictedClass: LesionClassKey = json.predicted_class || 'nv';
      if (!ORDERED_CLASS_KEYS.includes(predictedClass)) {
        // Fallback to highest probability if format differs
        let maxScore = -1;
        for (const key of ORDERED_CLASS_KEYS) {
          if (normalizedProbabilities[key] > maxScore) {
            maxScore = normalizedProbabilities[key];
            predictedClass = key;
          }
        }
      }

      const confidence =
        typeof json.confidence === 'number'
          ? json.confidence
          : normalizedProbabilities[predictedClass] || 0;

      const modelInferenceMs =
        typeof json.model_inference_ms === 'number'
          ? json.model_inference_ms
          : typeof json.inference_time_ms === 'number'
          ? json.inference_time_ms
          : undefined;

      const serverProcessMs =
        typeof json.server_process_ms === 'number'
          ? json.server_process_ms
          : undefined;

      const predictionData: PredictionResponse = {
        model: json.model || modelId,
        predicted_class: predictedClass,
        confidence,
        is_uncertain:
          typeof json.is_uncertain === 'boolean'
            ? json.is_uncertain
            : undefined,
        is_supported:
          typeof json.is_supported === 'boolean'
            ? json.is_supported
            : json.is_supported === null
            ? null
            : undefined,
        domain_status:
          typeof json.domain_status === 'string'
            ? json.domain_status
            : undefined,
        ensemble_method: json.ensemble_method,
        consensus_agreement: json.consensus_agreement,
        models_agree: typeof json.models_agree === 'boolean' ? json.models_agree : undefined,
        models_disagree: typeof json.models_disagree === 'boolean' ? json.models_disagree : undefined,
        individual_predictions: json.individual_predictions,
        uncertainty_metrics:
          json.uncertainty_metrics && typeof json.uncertainty_metrics === 'object'
            ? json.uncertainty_metrics
            : undefined,
        warning:
          typeof json.warning === 'string'
            ? json.warning
            : json.warning === null
            ? null
            : undefined,
        class_probabilities: normalizedProbabilities,
        model_inference_ms: modelInferenceMs,
        server_process_ms: serverProcessMs,
        client_round_trip_ms: latencyMs,
        inference_time_ms: modelInferenceMs ?? latencyMs,
        input_shape: json.input_shape,
        timestamp: json.timestamp || new Date().toISOString(),
      };

      return {
        success: true,
        data: predictionData,
      };
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      const isAbort = (err as any)?.name === 'AbortError';
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown network failure';

      if (isAbort) {
        const timeoutSec = Math.round(timeoutMs / 1000);
        return {
          success: false,
          error: `Inference request timed out after ${timeoutSec} seconds.`,
          errorDetails: {
            url: API_BASE_URL,
            endpoint: '/api/predict',
            rawMessage: `AbortError: Request exceeded ${timeoutSec}-second execution threshold`,
            tips: [
              `The neural network forward pass took longer than ${timeoutSec} seconds on your local CPU hardware.`,
              'On mobile or low-power CPUs without CUDA GPU acceleration, deep CNN inference (ResNet-50, Inception-V3) requires sustained computation time.',
              'Ensure background CPU-heavy applications are closed during local inference.',
            ],
          },
        };
      }

      return {
        success: false,
        error: `Could not connect to FastAPI server at ${API_BASE_URL}`,
        errorDetails: {
          url: API_BASE_URL,
          endpoint: '/api/predict',
          rawMessage: errorMessage,
          tips: [
            `The frontend is configured to call ${API_BASE_URL}/api/predict.`,
            'Ensure your Python FastAPI backend is started using: uvicorn main:app --port 8000',
            'Verify that CORS middleware is enabled in FastAPI for http://localhost:5173.',
            'In strict compliance with medical research integrity, SKINDERMO never simulates synthetic predictions.',
          ],
        },
      };
    }
  }
}
