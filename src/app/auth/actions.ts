'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const AuthSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const SignUpSchema = AuthSchema.extend({
  displayName: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const ResetPasswordSchema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type AuthState = {
  error?: string;
  success?: string;
} | null;

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const redirectTo = (formData.get('redirectTo') as string) || '/dashboard';

  const validated = AuthSchema.safeParse({ email, password });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect(redirectTo);
}

export async function signUp(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const displayName = formData.get('displayName') as string;

  const validated = SignUpSchema.safeParse({ email, password, displayName });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const headerList = await headers();
  const origin = headerList.get('origin') || '';

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // If user is auto-confirmed or session is active immediately
  if (data.session) {
    revalidatePath('/', 'layout');
    redirect('/dashboard');
  }

  return {
    success: 'Registration successful! Check your email to confirm your account.',
  };
}

export async function requestPasswordReset(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string;

  const validated = ForgotPasswordSchema.safeParse({ email });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const headerList = await headers();
  const origin = headerList.get('origin') || '';

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: 'Password reset link sent! Check your email inbox to proceed.',
  };
}

export async function updatePassword(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const validated = ResetPasswordSchema.safeParse({ password, confirmPassword });
  if (!validated.success) {
    return { error: validated.error.issues[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

export async function signInWithOAuth(provider: 'github' | 'google') {
  const headerList = await headers();
  const origin = headerList.get('origin') || '';

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.url) {
    redirect(data.url);
  }
}
