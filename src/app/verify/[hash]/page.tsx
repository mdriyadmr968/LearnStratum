import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Award, CheckCircle2, ExternalLink, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface VerifyPageProps {
  params: Promise<{ hash: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { hash } = await params;
  return {
    title: `Certificate Verification – LearnStratum`,
    description: `Verify the authenticity of a LearnStratum certificate (hash: ${hash.slice(0, 16)}…)`,
  };
}

export default async function VerifyCertificatePage({ params }: VerifyPageProps) {
  const { hash } = await params;
  const supabase = await createClient();

  const { data: cert, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('verification_hash', hash)
    .single();

  const isValid = !error && !!cert;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-zinc-50 to-amber-50/30 dark:from-zinc-950 dark:to-amber-950/10 px-4 py-16">
      {/* Verification card */}
      <div className="w-full max-w-lg space-y-8">
        {/* Status badge */}
        <div className="flex justify-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
              isValid
                ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}
          >
            {isValid ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <ShieldCheck className="w-4 h-4 opacity-50" />
            )}
            {isValid ? 'Certificate Verified ✓' : 'Certificate Not Found'}
          </div>
        </div>

        {isValid && cert ? (
          /* ── Valid Certificate ── */
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-amber-200/60 dark:border-amber-800/40 shadow-xl overflow-hidden">
            {/* Gold banner */}
            <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-8 py-6 text-center space-y-1">
              <Award className="w-10 h-10 text-white mx-auto drop-shadow" />
              <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mt-2">
                Certificate of Completion
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-8 space-y-6 text-center">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Awarded to</p>
                <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {cert.student_name}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                  For completing
                </p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
                  {cert.course_title}
                </p>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Issued on</p>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  {new Date(cert.issued_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Hash */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-[10px] text-zinc-400 uppercase tracking-wider">
                  Verification Hash (SHA-256)
                </p>
                <p className="font-mono text-[10px] text-zinc-500 break-all leading-relaxed">
                  {cert.verification_hash}
                </p>
              </div>

              {/* Issuer */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Issued by <span className="font-semibold text-zinc-600 dark:text-zinc-300">LearnStratum</span>
              </div>
            </div>
          </div>
        ) : (
          /* ── Invalid / Not Found ── */
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg px-8 py-10 text-center space-y-4">
            <Award className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto" />
            <p className="text-lg font-bold text-zinc-800 dark:text-zinc-100">
              No Certificate Found
            </p>
            <p className="text-sm text-zinc-500 leading-relaxed">
              The verification hash <code className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{hash.slice(0, 24)}…</code> does not match any issued certificate. It may be invalid or the link may be incorrect.
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            LearnStratum — AI-Powered Learning
          </Link>
        </div>
      </div>
    </div>
  );
}
