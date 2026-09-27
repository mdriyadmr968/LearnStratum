'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Generate a clean URL-friendly slug from title and short random id
 */
function generateSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const rand = Math.random().toString(36).substring(2, 7);
  return `${base || 'course'}-${rand}`;
}

export interface TogglePublicResult {
  success: boolean;
  isPublic?: boolean;
  slug?: string | null;
  error?: string;
}

/**
 * Toggle whether a course is public or private.
 * Only the owner can toggle visibility.
 */
export async function toggleCoursePublic(
  courseId: string,
  makePublic: boolean
): Promise<TogglePublicResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  // Fetch course and verify ownership
  const { data: course, error: fetchErr } = await supabase
    .from('courses')
    .select('id, title, user_id, slug, is_public')
    .eq('id', courseId)
    .single();

  if (fetchErr || !course || course.user_id !== user.id) {
    return { success: false, error: 'Course not found or access denied.' };
  }

  let newSlug = course.slug;
  if (makePublic && !newSlug) {
    newSlug = generateSlug(course.title);
  }

  const { error: updateErr } = await supabase
    .from('courses')
    .update({
      is_public: makePublic,
      slug: newSlug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath('/explore');
  if (newSlug) {
    revalidatePath(`/explore/${newSlug}`);
  }

  return {
    success: true,
    isPublic: makePublic,
    slug: newSlug,
  };
}

export interface ForkResult {
  success: boolean;
  newCourseId?: string;
  error?: string;
}

/**
 * Fork a public course into the logged-in user's library.
 * Creates a complete copy of the course, its modules, and lessons.
 */
export async function forkCourse(sourceCourseId: string): Promise<ForkResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Please sign in to fork this course.' };
  }

  // 1. Fetch source course (must be public or owned by user)
  const { data: sourceCourse, error: courseErr } = await supabase
    .from('courses')
    .select('*')
    .eq('id', sourceCourseId)
    .single();

  if (courseErr || !sourceCourse || (!sourceCourse.is_public && sourceCourse.user_id !== user.id)) {
    return { success: false, error: 'Course is not available for forking.' };
  }

  // 2. Fetch all modules and lessons of source course
  const { data: sourceModules } = await supabase
    .from('modules')
    .select(`
      id,
      title,
      order_index,
      estimated_minutes,
      lessons (
        id,
        title,
        order_index,
        objectives,
        search_queries
      )
    `)
    .eq('course_id', sourceCourseId)
    .order('order_index', { ascending: true });

  // 3. Create cloned course for the user
  const { data: newCourse, error: insertCourseErr } = await supabase
    .from('courses')
    .insert({
      user_id: user.id,
      title: `${sourceCourse.title} (Forked)`,
      description: sourceCourse.description,
      topic: sourceCourse.topic,
      difficulty_level: sourceCourse.difficulty_level,
      weekly_hours_allocated: sourceCourse.weekly_hours_allocated,
      status: 'active',
      is_public: false,
      slug: null,
    })
    .select('id')
    .single();

  if (insertCourseErr || !newCourse) {
    return { success: false, error: insertCourseErr?.message || 'Failed to clone course.' };
  }

  // 4. Clone modules and lessons
  const modulesList = (sourceModules ?? []) as unknown as {
    id: string;
    title: string;
    order_index: number;
    estimated_minutes: number;
    lessons: {
      id: string;
      title: string;
      order_index: number;
      objectives: any;
      search_queries: any;
    }[];
  }[];

  for (const mod of modulesList) {
    const { data: newMod, error: modErr } = await supabase
      .from('modules')
      .insert({
        course_id: newCourse.id,
        title: mod.title,
        order_index: mod.order_index,
        estimated_minutes: mod.estimated_minutes,
      })
      .select('id')
      .single();

    if (modErr || !newMod) continue;

    if (mod.lessons && mod.lessons.length > 0) {
      const lessonsToInsert = mod.lessons.map((lesson) => ({
        module_id: newMod.id,
        title: lesson.title,
        order_index: lesson.order_index,
        objectives: lesson.objectives,
        search_queries: lesson.search_queries,
        is_completed: false,
      }));

      await supabase.from('lessons').insert(lessonsToInsert);
    }
  }

  revalidatePath('/dashboard');
  return {
    success: true,
    newCourseId: newCourse.id,
  };
}
