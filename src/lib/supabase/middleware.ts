import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If Supabase keys are not set or are placeholders, pass through gracefully
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect authenticated routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/courses');
  const isAuthRoute = pathname === '/auth/login' || pathname === '/auth/sign-up' || pathname === '/auth/forgot-password';
  // Public routes that never require auth
  const isPublicRoute = pathname.startsWith('/verify') || pathname.startsWith('/explore');

  if (!user && !isPublicRoute && (isProtectedRoute || pathname === '/auth/reset-password')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    if (pathname === '/auth/reset-password') {
      url.searchParams.set('error', 'Please use the password reset link sent to your email.');
    } else {
      url.searchParams.set('redirectTo', pathname);
    }
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
