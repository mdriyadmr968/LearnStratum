import { GoogleGenAI } from '@google/genai';
import { generateContentWithFallback } from './models';
import { z } from 'zod';

const FlashcardSchema = z.object({
  front: z.string().min(5),
  back: z.string().min(10),
});

const FlashcardsResponseSchema = z.object({
  flashcards: z.array(FlashcardSchema).min(3).max(5),
});

export type GeneratedFlashcard = z.infer<typeof FlashcardSchema>;

const FALLBACK_FLASHCARDS: GeneratedFlashcard[] = [
  {
    front: 'What is spaced repetition?',
    back: 'A learning technique that schedules reviews at increasing intervals over time, exploiting the "spacing effect" to improve long-term retention with less total study time.',
  },
  {
    front: 'What does "active recall" mean?',
    back: 'The practice of actively retrieving information from memory (e.g., self-testing) rather than passively re-reading, shown to significantly strengthen memory traces.',
  },
  {
    front: 'What is the SM-2 algorithm?',
    back: 'SuperMemo 2 — an algorithm that updates a flashcard\'s next review date based on recall quality (0–5). Lower grades shorten intervals; higher grades extend them.',
  },
];

export async function generateFlashcards(
  lessonTitle: string,
  objectives: string[]
): Promise<GeneratedFlashcard[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return FALLBACK_FLASHCARDS;
  }

  const objectivesList = objectives.map((o, i) => `${i + 1}. ${o}`).join('\n');

  const prompt = `You are an expert educator creating Anki-style flashcards for a programming/tech lesson.

Lesson: "${lessonTitle}"
Objectives:
${objectivesList}

Generate exactly 5 high-yield flashcards. Return ONLY valid JSON:
{
  "flashcards": [
    {
      "front": "Concise question or prompt (max 120 chars)",
      "back": "Clear, complete answer with context (2-4 sentences)"
    }
  ]
}

Rules:
- Each card tests a single, concrete concept from the objectives
- Front should be a genuine question, not a statement
- Back should be self-contained (no "see above" references)
- Cards must be directly related to "${lessonTitle}"
- Return ONLY the JSON object, no markdown fences`;

  try {
    const genai = new GoogleGenAI({ apiKey });
    const response = await generateContentWithFallback(genai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.35,
      },
    });

    const text = response.text ?? '';
    const json = JSON.parse(text);
    const parsed = FlashcardsResponseSchema.safeParse(json);

    if (parsed.success) return parsed.data.flashcards;
    console.error('[flashcard-generator] Schema validation failed:', parsed.error.message);
    return FALLBACK_FLASHCARDS;
  } catch (err) {
    console.error('[flashcard-generator] Gemini call failed:', err);
    return FALLBACK_FLASHCARDS;
  }
}
