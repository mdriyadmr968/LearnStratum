import { GoogleGenAI } from '@google/genai';
import { generateContentWithFallback } from './models';
import {
  CurriculumSchema,
  type GeneratedCurriculum,
} from './curriculum-schema';

export interface GenerateCurriculumParams {
  topic: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours: number;
  customGoals?: string;
}

export async function generateCurriculum({
  topic,
  difficultyLevel,
  weeklyHours,
  customGoals,
}: GenerateCurriculumParams): Promise<GeneratedCurriculum> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Graceful fallback if no API key or placeholder key is configured
  if (!apiKey || apiKey.includes('placeholder')) {
    return generateFallbackCurriculum({ topic, difficultyLevel, weeklyHours });
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert instructional designer and university professor specializing in autodidactic learning pathways.
Design a comprehensive, structured mastery curriculum for a student learning "${topic}".

Student Profile:
- Target Subject: "${topic}"
- Experience Level: ${difficultyLevel}
- Dedicated Study Time: ${weeklyHours} hours per week
${customGoals ? `- Specific Goals or Focus Areas: ${customGoals}` : ''}

Curriculum Design Instructions:
1. Divide the course into 3 to 5 logical, progressive modules (e.g. Core Foundations, Intermediate Techniques, Advanced Architecture, Practical Mastery).
2. For each module, create 2 to 4 focused, bite-sized lessons.
3. For each lesson:
   - Provide a clear, actionable title.
   - List 3 to 4 specific learning objectives and concepts to master.
   - Include 1 to 2 targeted YouTube / documentation search queries (e.g. "${topic} full tutorial", "${topic} architecture deep dive").
4. Ensure the total estimated study time matches a balanced 3-4 week learning sprint given the student's weekly commitment (${weeklyHours} hours/week).

Return ONLY valid JSON matching this schema:
{
  "title": string,
  "description": string,
  "topic": string,
  "difficulty_level": "beginner" | "intermediate" | "advanced",
  "weekly_hours_allocated": number,
  "modules": [
    {
      "title": string,
      "estimated_minutes": number,
      "lessons": [
        {
          "title": string,
          "objectives": [string],
          "search_queries": [string]
        }
      ]
    }
  ]
}
`;

  try {
    const response = await generateContentWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const responseText = response.text?.trim() || '{}';
    const parsedJson = JSON.parse(responseText);
    return CurriculumSchema.parse(parsedJson);
  } catch (error) {
    console.error('Gemini API generation failed, falling back to structured template:', error);
    return generateFallbackCurriculum({ topic, difficultyLevel, weeklyHours });
  }
}

function generateFallbackCurriculum({
  topic,
  difficultyLevel,
  weeklyHours,
}: {
  topic: string;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  weeklyHours: number;
}): GeneratedCurriculum {
  const capitalizedTopic = topic.charAt(0).toUpperCase() + topic.slice(1);

  return {
    title: `Mastering ${capitalizedTopic}: Zero to Autonomous`,
    description: `A comprehensive, step-by-step learning journey designed to master ${capitalizedTopic} at an ${difficultyLevel} level with ${weeklyHours} hours of focused practice per week.`,
    topic,
    difficulty_level: difficultyLevel,
    weekly_hours_allocated: weeklyHours,
    modules: [
      {
        title: `Module 1: Foundations & Core Concepts of ${capitalizedTopic}`,
        estimated_minutes: 120,
        lessons: [
          {
            title: `Introduction to ${capitalizedTopic} & Environment Setup`,
            objectives: [
              `Understand the fundamental principles and motivation behind ${capitalizedTopic}`,
              'Configure the necessary tooling and development environment',
              'Execute initial introductory walkthroughs and examples',
            ],
            search_queries: [
              `${capitalizedTopic} beginner overview and getting started`,
              `${capitalizedTopic} complete setup tutorial`,
            ],
          },
          {
            title: `Core Architectural Building Blocks`,
            objectives: [
              'Examine the foundational components and design patterns',
              'Trace request, state, or data flow through standard workflows',
              'Identify common anti-patterns and foundational pitfalls',
            ],
            search_queries: [
              `${capitalizedTopic} core concepts architecture`,
              `${capitalizedTopic} best practices for beginners`,
            ],
          },
        ],
      },
      {
        title: `Module 2: Practical Implementation & Intermediate Workflows`,
        estimated_minutes: 180,
        lessons: [
          {
            title: `Hands-on Project Development with ${capitalizedTopic}`,
            objectives: [
              'Build a functional application or workflow from scratch',
              'Implement real-world patterns, error handling, and validation',
              'Optimize debugging, diagnostics, and testing strategies',
            ],
            search_queries: [
              `${capitalizedTopic} full course project build`,
              `${capitalizedTopic} hands on walkthrough`,
            ],
          },
          {
            title: `Performance Optimization & Idiomatic Patterns`,
            objectives: [
              'Analyze performance bottlenecks and resource management',
              'Implement idiomatic conventions adopted by industry leaders',
              'Write maintainable, modular, and extensible code',
            ],
            search_queries: [
              `${capitalizedTopic} performance optimization deep dive`,
              `${capitalizedTopic} production tips`,
            ],
          },
        ],
      },
      {
        title: `Module 3: Advanced Paradigms & Real-World Mastery`,
        estimated_minutes: 150,
        lessons: [
          {
            title: `Production Deployment & Security Best Practices`,
            objectives: [
              'Deploy and manage scalable configurations in production',
              'Enforce security best practices, secrets management, and auditing',
              'Establish continuous monitoring and automated testing',
            ],
            search_queries: [
              `${capitalizedTopic} production deployment guide`,
              `${capitalizedTopic} security and scalability`,
            ],
          },
          {
            title: `Capstone Challenge & Autonomous Problem Solving`,
            objectives: [
              'Synthesize all acquired knowledge in a real-world capstone project',
              'Evaluate edge cases and conduct architectural peer review',
              'Prepare for professional technical interviews or enterprise deployment',
            ],
            search_queries: [
              `${capitalizedTopic} advanced capstone project tutorial`,
              `${capitalizedTopic} interview questions and case studies`,
            ],
          },
        ],
      },
    ],
  };
}
