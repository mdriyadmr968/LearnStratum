'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function toggleLessonCompletion(
  lessonId: string,
  courseId: string,
  isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Unauthorized.' };
    }

    const completedAt = isCompleted ? new Date().toISOString() : null;

    // 1. Update Lesson Status
    const { error: lessonError } = await supabase
      .from('lessons')
      .update({
        is_completed: isCompleted,
        completed_at: completedAt,
      })
      .eq('id', lessonId);

    if (lessonError) {
      return { success: false, error: lessonError.message };
    }

    // 2. If completed, log activity to study_activity_logs for streak calculation
    if (isCompleted) {
      try {
        const today = new Date().toISOString().split('T')[0];
        await supabase.from('study_activity_logs').insert({
          user_id: user.id,
          activity_date: today,
          activity_type: 'lesson_completed',
          metadata: { lesson_id: lessonId, course_id: courseId },
        });
      } catch (logErr) {
        console.warn('Could not record activity log:', logErr);
      }
    }

    revalidatePath('/dashboard');
    revalidatePath(`/courses/${courseId}`);
    revalidatePath(`/courses/${courseId}/lesson/${lessonId}`);

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}

export async function toggleResourceCompletion(
  resourceId: string,
  isCompleted: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('resources')
      .update({ is_completed: isCompleted })
      .eq('id', resourceId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}
