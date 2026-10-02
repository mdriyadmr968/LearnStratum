import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAppUrl(headerList?: { get(name: string): string | null }): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  if (headerList) {
    const host = headerList.get('x-forwarded-host') || headerList.get('host');
    const proto = headerList.get('x-forwarded-proto') || 'https';
    if (host) {
      return `${proto}://${host}`.replace(/\/$/, '');
    }
    const origin = headerList.get('origin');
    if (origin) {
      return origin.replace(/\/$/, '');
    }
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, '');
  }

  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    const url = process.env.NEXT_PUBLIC_VERCEL_URL;
    return (url.startsWith('http') ? url : `https://${url}`).replace(/\/$/, '');
  }

  return 'http://localhost:3000';
}
