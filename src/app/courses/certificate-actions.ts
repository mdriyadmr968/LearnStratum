'use server';

import { createClient } from '@/lib/supabase/server';
import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';

export interface CertificateResult {
  success: boolean;
  certificate?: {
    id: string;
    verification_hash: string;
    issued_at: string;
    course_title: string;
    student_name: string;
  };
  error?: string;
  alreadyIssued?: boolean;
}

/**
 * Issue a certificate for a course if the student has:
 *  - completed ALL lessons
 * The certificate is idempotent — calling it twice returns the existing one.
 */
export async function issueCertificate(courseId: string): Promise<CertificateResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated.' };
  }

  // ── 1. Fetch course ──────────────────────────────────────────────────────
  const { data: course, error: courseErr } = await supabase
    .from('courses')
    .select('id, title, user_id')
    .eq('id', courseId)
    .eq('user_id', user.id)
    .single();

  if (courseErr || !course) {
    return { success: false, error: 'Course not found.' };
  }

  // ── 2. Check if certificate already issued ───────────────────────────────
  const { data: existing } = await supabase
    .from('certificates')
    .select('id, verification_hash, issued_at, course_title, student_name')
    .eq('user_id', user.id)
    .eq('course_id', courseId)
    .single();

  if (existing) {
    return {
      success: true,
      alreadyIssued: true,
      certificate: existing,
    };
  }

  // ── 3. Check 100% lesson completion ─────────────────────────────────────
  const { data: rawModules } = await supabase
    .from('modules')
    .select('id, lessons(id, is_completed)')
    .eq('course_id', courseId);

  const typedModules = (rawModules as unknown as { id: string; lessons: { id: string; is_completed: boolean }[] }[]) ?? [];

  const allLessons = typedModules.flatMap((m) => m.lessons ?? []);

  if (allLessons.length === 0) {
    return { success: false, error: 'No lessons found for this course.' };
  }

  const allComplete = allLessons.every((l) => l.is_completed);
  if (!allComplete) {
    const done = allLessons.filter((l) => l.is_completed).length;
    return {
      success: false,
      error: `Complete all lessons first. (${done}/${allLessons.length} done)`,
    };
  }

  // ── 4. Get student display name ──────────────────────────────────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email')
    .eq('id', user.id)
    .single();

  const studentName =
    profile?.display_name || profile?.email?.split('@')[0] || 'Student';

  // ── 5. Generate deterministic SHA-256 verification hash ─────────────────
  const hashSource = `${user.id}:${courseId}:${course.title}:${new Date().toISOString()}`;
  const verificationHash = createHash('sha256').update(hashSource).digest('hex');

  // ── 6. Insert certificate ────────────────────────────────────────────────
  const { data: cert, error: insertErr } = await supabase
    .from('certificates')
    .insert({
      user_id: user.id,
      course_id: courseId,
      course_title: course.title,
      student_name: studentName,
      verification_hash: verificationHash,
    })
    .select()
    .single();

  if (insertErr || !cert) {
    return { success: false, error: insertErr?.message ?? 'Failed to issue certificate.' };
  }

  revalidatePath(`/courses/${courseId}`);

  return {
    success: true,
    alreadyIssued: false,
    certificate: {
      id: cert.id,
      verification_hash: cert.verification_hash,
      issued_at: cert.issued_at,
      course_title: cert.course_title,
      student_name: cert.student_name,
    },
  };
}
