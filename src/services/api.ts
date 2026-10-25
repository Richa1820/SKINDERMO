import { PredictionResponse, ModelId, BackendStatus, LesionClassKey } from '../types';
import { ORDERED_CLASS_KEYS } from '../constants/models';

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
        return {
          online: true,
          checkedAt: new Date(),
          latencyMs,
          baseUrl: API_BASE_URL,
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
    const endpoint = `${API_BASE_URL}/api/predict`;
    const formData = new FormData();
    formData.append('file', imageFile, imageFile.name);
    formData.append('model', modelId);

    const startTime = performance.now();

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorText = '';
        try {
          const errJson = await response.json();
          errorText = errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch {
          errorText = await response.text();
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

      const json = await response.json();

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
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown network failure';

      return {
        success: false,
        error: `Could not connect to FastAPI server at ${API_BASE_URL}`,
        errorDetails: {
          url: API_BASE_URL,
          endpoint: '/api/predict',
          rawMessage: errorMessage,
          tips: [
            `The frontend is configured to call ${API_BASE_URL}/api/predict.`,
            'Ensure your Python FastAPI backend is started using: uvicorn main:app --reload --port 8000',
            'Verify that CORS middleware is enabled in FastAPI for http://localhost:5173.',
            'In strict compliance with medical research integrity, SKINDERMO never simulates synthetic predictions.',
          ],
        },
      };
    }
  }
}
