import { GoogleGenAI } from '@google/genai';

/**
 * Priority order for Gemini models.
 * Automatically tries next available model if the current model is deprecated (404)
 * or experiencing temporary high demand (503).
 */
export const GEMINI_CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
];

export interface GenerateWithFallbackParams {
  contents: any;
  config?: any;
}

/**
 * Executes generateContent trying candidate models in order until one succeeds.
 */
export async function generateContentWithFallback(
  ai: GoogleGenAI,
  params: GenerateWithFallbackParams
) {
  let lastError: any = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      console.warn(`[Gemini Fallback] Model '${model}' failed (status: ${status}), attempting next available model...`);
      // If error is 404 (model not found / deprecated) or 503 (high demand) or 400 (unsupported), continue to next
      continue;
    }
  }

  throw lastError;
}

/**
 * Executes generateContentStream trying candidate models in order until one establishes a stream.
 */
export async function generateContentStreamWithFallback(
  ai: GoogleGenAI,
  params: GenerateWithFallbackParams
) {
  let lastError: any = null;

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: params.contents,
        config: params.config,
      });
      return stream;
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      console.warn(`[Gemini Fallback] Streaming with '${model}' failed (status: ${status}), attempting next available model...`);
      continue;
    }
  }

  throw lastError;
}
