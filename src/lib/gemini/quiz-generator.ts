import { GoogleGenAI } from '@google/genai';
import { generateContentWithFallback } from './models';
import { z } from 'zod';

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correct_option_index: z.number().int().min(0).max(3),
  explanation: z.string(),
});

const QuizSchema = z.object({
  title: z.string(),
  questions: z.array(QuizQuestionSchema).min(3).max(5),
});

export type GeneratedQuestion = z.infer<typeof QuizQuestionSchema>;
export type GeneratedQuiz = z.infer<typeof QuizSchema>;

const FALLBACK_QUIZ: GeneratedQuiz = {
  title: 'Lesson Knowledge Check',
  questions: [
    {
      question: 'What is the primary purpose of this lesson?',
      options: [
        'To introduce core concepts',
        'To review unrelated material',
        'To cover advanced topics only',
        'None of the above',
      ],
      correct_option_index: 0,
      explanation:
        'The lesson focuses on introducing and building understanding of the core concepts listed in the objectives.',
    },
    {
      question: 'Which approach best reinforces new knowledge?',
      options: [
        'Passive reading only',
        'Active recall and spaced repetition',
        'Skimming headings',
        'Memorising without context',
      ],
      correct_option_index: 1,
      explanation:
        'Research consistently shows that active recall combined with spaced repetition maximises long-term retention.',
    },
    {
      question: 'What should you do after completing a lesson?',
      options: [
        'Move immediately to the next topic',
        'Review objectives and test yourself',
        'Ignore the material until the exam',
        'Only watch videos, skip reading',
      ],
      correct_option_index: 1,
      explanation:
        'Self-testing after a lesson consolidates memory and identifies gaps in understanding.',
    },
  ],
};

export async function generateQuiz(
  lessonTitle: string,
  objectives: string[]
): Promise<GeneratedQuiz> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return { ...FALLBACK_QUIZ, title: `${lessonTitle} – Knowledge Check` };
  }

  const objectivesList = objectives.map((o, i) => `${i + 1}. ${o}`).join('\n');

  const prompt = `You are an expert educator creating a quiz for a programming/tech lesson.

Lesson: "${lessonTitle}"
Objectives:
${objectivesList}

Generate a quiz with exactly 4 multiple-choice questions (4 options each). Return ONLY valid JSON matching this schema:
{
  "title": "string (lesson title + Knowledge Check)",
  "questions": [
    {
      "question": "Clear, specific question testing one objective",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "explanation": "Why this answer is correct and others are wrong"
    }
  ]
}

Rules:
- Questions must be specific to the lesson objectives above
- Options must be plausible but only one correct
- Explanations must be educational (2-3 sentences)
- correct_option_index is 0-based
- Return ONLY the JSON object, no markdown fences`;

  try {
    const genai = new GoogleGenAI({ apiKey });
    const response = await generateContentWithFallback(genai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const text = response.text ?? '';
    const json = JSON.parse(text);
    const parsed = QuizSchema.safeParse(json);

    if (parsed.success) return parsed.data;
    console.error('[quiz-generator] Schema validation failed:', parsed.error.message);
    return { ...FALLBACK_QUIZ, title: `${lessonTitle} – Knowledge Check` };
  } catch (err) {
    console.error('[quiz-generator] Gemini call failed:', err);
    return { ...FALLBACK_QUIZ, title: `${lessonTitle} – Knowledge Check` };
  }
}
