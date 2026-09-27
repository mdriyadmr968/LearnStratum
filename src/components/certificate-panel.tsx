'use client';

import { useState } from 'react';
import { Award, ExternalLink, Loader2, Copy, CheckCheck, Link2 } from 'lucide-react';
import { issueCertificate, type CertificateResult } from '@/app/courses/certificate-actions';
import { triggerGoldCelebration } from '@/lib/celebration';

interface CertificatePanelProps {
  courseId: string;
  courseTitle: string;
  progressPercent: number;
  /** Pre-fetched certificate if one was already issued */
  initialCertificate?: CertificateResult['certificate'] | null;
}

export function CertificatePanel({
  courseId,
  courseTitle,
  progressPercent,
  initialCertificate = null,
}: CertificatePanelProps) {
  const [loading, setLoading] = useState(false);
  const [cert, setCert] = useState(initialCertificate);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isComplete = progressPercent === 100;
  const verifyUrl = cert
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${cert.verification_hash}`
    : '';

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    const result = await issueCertificate(courseId);
    setLoading(false);
    if (result.success && result.certificate) {
      setCert(result.certificate);
      if (!result.alreadyIssued) {
        triggerGoldCelebration();
      }
    } else {
      setError(result.error ?? 'Failed to issue certificate');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const linkedInUrl = cert
    ? `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(courseTitle)}&organizationName=LearnStratum&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(cert.verification_hash.slice(0, 16))}`
    : '';

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20 border border-amber-200/70 dark:border-amber-800/40 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md">
          <Award className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
            Certificate of Completion
          </p>
          <p className="text-[11px] text-amber-700 dark:text-amber-400">
            {cert ? 'Issued & Verified' : isComplete ? 'Ready to claim!' : `${progressPercent}% complete`}
          </p>
        </div>
      </div>

      {/* Certificate card (issued state) */}
      {cert ? (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-800/40 space-y-2 text-center">
            <Award className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
              {cert.course_title}
            </p>
            <p className="text-[11px] text-zinc-500">
              Awarded to <span className="font-semibold text-zinc-700 dark:text-zinc-300">{cert.student_name}</span>
            </p>
            <p className="text-[10px] text-zinc-400">
              {new Date(cert.issued_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-[9px] font-mono text-zinc-400 break-all">
              {cert.verification_hash.slice(0, 32)}…
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/50 text-amber-800 dark:text-amber-200 text-xs font-semibold transition"
            >
              {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Verification Link'}
            </button>

            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0077B5] hover:bg-[#006097] text-white text-xs font-semibold transition"
            >
              <Link2 className="w-3.5 h-3.5" />
              Add to LinkedIn
            </a>

            <a
              href={`/verify/${cert.verification_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 text-xs font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View Public Certificate
            </a>
          </div>
        </div>
      ) : (
        /* Not yet claimed */
        <div className="space-y-3">
          {!isComplete && (
            <div className="w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}

          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            {isComplete
              ? 'Congratulations! 🎉 You\'ve completed all lessons. Claim your verifiable certificate now.'
              : `Complete all ${100 - progressPercent}% remaining lessons to unlock your certificate.`}
          </p>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-xl">
              ⚠️ {error}
            </p>
          )}

          <button
            onClick={handleClaim}
            disabled={!isComplete || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold shadow transition"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
            {loading ? 'Issuing…' : 'Claim Certificate'}
          </button>
        </div>
      )}
    </div>
  );
}
