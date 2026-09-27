import { GoogleGenAI } from '@google/genai';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? '',
});

/**
 * Generate 768-dimensional text embeddings using Google Gemini text-embedding-004
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'placeholder' || !text.trim()) {
    return null;
  }

  const models = ['gemini-embedding-001', 'text-embedding-004'];
  for (const model of models) {
    try {
      const response = await genai.models.embedContent({
        model,
        contents: text.slice(0, 4000),
      });

      if (response?.embeddings?.[0]?.values) {
        return response.embeddings[0].values;
      }
    } catch {
      continue;
    }
  }
  return null;
}
