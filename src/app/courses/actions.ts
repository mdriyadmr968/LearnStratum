'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { generateCurriculum, type GenerateCurriculumParams } from '@/lib/gemini/client';
import { CurriculumSchema, type GeneratedCurriculum } from '@/lib/gemini/curriculum-schema';

export async function generateCourseOutline(params: GenerateCurriculumParams): Promise<{
  success: boolean;
  curriculum?: GeneratedCurriculum;
  error?: string;
}> {
  try {
    if (!params.topic || params.topic.trim().length < 2) {
      return { success: false, error: 'Please enter a valid topic to learn.' };
    }

    const curriculum = await generateCurriculum(params);
    return { success: true, curriculum };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error generating course outline:', err);
    return {
      success: false,
      error: err.message || 'Failed to generate course outline with AI.',
    };
  }
}

export async function saveCourseToDatabase(curriculum: GeneratedCurriculum): Promise<{
  success: boolean;
  courseId?: string;
  error?: string;
}> {
  try {
    const validated = CurriculumSchema.safeParse(curriculum);
    if (!validated.success) {
      return { success: false, error: 'Invalid curriculum structure.' };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: 'You must be signed in to save and generate your course.',
      };
    }

    // 1. Create Course Record
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .insert({
        user_id: user.id,
        title: validated.data.title,
        description: validated.data.description,
        topic: validated.data.topic,
        difficulty_level: validated.data.difficulty_level,
        weekly_hours_allocated: validated.data.weekly_hours_allocated,
        status: 'active',
      })
      .select('id')
      .single();

    if (courseError || !course) {
      console.error('Error creating course:', courseError);
      return { success: false, error: courseError?.message || 'Failed to create course.' };
    }

    // 2. Insert Modules and Lessons
    for (let mIdx = 0; mIdx < validated.data.modules.length; mIdx++) {
      const moduleData = validated.data.modules[mIdx];

      const { data: moduleRow, error: moduleError } = await supabase
        .from('modules')
        .insert({
          course_id: course.id,
          title: moduleData.title,
          order_index: mIdx + 1,
          estimated_minutes: moduleData.estimated_minutes,
        })
        .select('id')
        .single();

      if (moduleError || !moduleRow) {
        console.error('Error creating module:', moduleError);
        continue;
      }

      // 3. Insert Lessons for this Module
      const lessonInserts = moduleData.lessons.map((lesson, lIdx) => ({
        module_id: moduleRow.id,
        title: lesson.title,
        order_index: lIdx + 1,
        objectives: lesson.objectives,
        search_queries: lesson.search_queries,
        is_completed: false,
      }));

      const { error: lessonsError } = await supabase
        .from('lessons')
        .insert(lessonInserts);

      if (lessonsError) {
        console.error('Error creating lessons:', lessonsError);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath(`/courses/${course.id}`);

    return { success: true, courseId: course.id };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Error in saveCourseToDatabase:', err);
    return { success: false, error: err.message || 'An unexpected error occurred while saving the course.' };
  }
}
