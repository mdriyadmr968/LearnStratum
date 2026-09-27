import { z } from 'zod';

export const LessonSchema = z.object({
  title: z.string().describe('Descriptive, specific title of this individual lesson'),
  objectives: z.array(z.string()).describe('3-5 concrete learning outcomes and key concepts covered in this lesson'),
  search_queries: z.array(z.string()).describe('1-2 targeted search queries for YouTube and official documentation'),
});

export const ModuleSchema = z.object({
  title: z.string().describe('Theme or unit title (e.g., Fundamentals, Deep Dive, Practical Projects)'),
  estimated_minutes: z.number().int().describe('Estimated total study minutes for this module (e.g. 60, 90, 120)'),
  lessons: z.array(LessonSchema).min(1).describe('Ordered lessons belonging to this module'),
});

export const CurriculumSchema = z.object({
  title: z.string().describe('Engaging, professional course title'),
  description: z.string().describe('A comprehensive overview describing what the learner will master'),
  topic: z.string().describe('The primary subject matter'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  weekly_hours_allocated: z.number().int().min(1).max(40),
  modules: z.array(ModuleSchema).min(2).describe('Ordered modules that take the learner from fundamentals to mastery'),
});

export type GeneratedCurriculum = z.infer<typeof CurriculumSchema>;
export type GeneratedModule = z.infer<typeof ModuleSchema>;
export type GeneratedLesson = z.infer<typeof LessonSchema>;
