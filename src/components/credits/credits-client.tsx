'use client';

import { useState } from 'react';
import {
  Zap,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Smartphone,
  Star,
  AlertTriangle,
  Database,
  Sparkles,
} from 'lucide-react';
import type { CreditState, CreditPackage, PaymentMethod } from '@/lib/credits';
import type { CacheStats } from '@/lib/ai-cache';
import { motion, AnimatePresence } from 'motion/react';
import { FadeIn, StaggerContainer, StaggerItem, CardHover } from '@/components/animations/motion-components';
import {
  submitPaymentRequest,
  approvePendingTransaction,
} from '@/app/credits/actions';

interface Props {
  state: CreditState;
  packages: CreditPackage[];
  cacheStats?: CacheStats;
}

const METHOD_COLORS: Record<PaymentMethod, string> = {
  bkash: 'bg-pink-600 text-white',
  nagad: 'bg-orange-500 text-white',
  rocket: 'bg-purple-600 text-white',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
};

const CREDIT_COST: Record<string, number> = {
  outline: 3,
  lesson: 2,
  quiz: 1,
  flashcards: 1,
};

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
  approved: { label: 'Approved', class: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' },
  rejected: { label: 'Rejected', class: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' },
  completed: { label: 'Completed', class: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400' },
};

export function CreditsClient({ state, packages, cacheStats }: Props) {
  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('bkash');
  const [phone, setPhone] = useState('');
  const [txRef, setTxRef] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [approving, setApproving] = useState<string | null>(null);
  const [localBalance, setLocalBalance] = useState(state.balance);
  const [localTxns, setLocalTxns] = useState(state.transactions);

  const handleSubmitPayment = async () => {
    if (!selectedPkg || !phone.trim() || !txRef.trim()) {
      setErrorMsg('Please fill in your phone number and transaction ID.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    const result = await submitPaymentRequest(selectedPkg.id, method, phone.trim(), txRef.trim());

    setSubmitting(false);
    if (result.success) {
      const added = result.creditsAdded ?? selectedPkg.credits;
      setLocalBalance((b) => b + added);
      setSuccessMsg(
        `🎉 Payment successful! ${added} credits have been added to your account.`
      );
      setLocalTxns((prev) => [
        {
          id: String(Date.now()),
          amount: added,
          method,
          reference: `${txRef.trim()} | Phone: ${phone.trim()}`,
          status: 'approved',
          description: `${selectedPkg.label} – ${added} credits via ${method} (${selectedPkg.price})`,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSelectedPkg(null);
      setPhone('');
      setTxRef('');
    } else {
      setErrorMsg(result.error ?? 'Failed to submit payment.');
    }
  };

  const handleApprove = async (txnId: string, amount: number) => {
    setApproving(txnId);
    const result = await approvePendingTransaction(txnId);
    setApproving(null);
    if (result.success) {
      setLocalBalance((b) => b + amount);
      setLocalTxns((prev) =>
        prev.map((t) => (t.id === txnId ? { ...t, status: 'approved' } : t))
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Balance Hero ─────────────────────────────────────── */}
      <FadeIn direction="up">
        <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-0.5">
                  Available Balance
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-zinc-900 dark:text-white">
                    {localBalance}
                  </span>
                  <span className="text-sm font-medium text-zinc-500">credits</span>
                </div>
                <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 capitalize">
                  {state.plan} plan
                </span>
              </div>
            </div>

            {/* Cost reference */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(CREDIT_COST).map(([action, cost]) => (
                <div
                  key={action}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-800"
                >
                  <Zap className="w-3 h-3 text-indigo-500 shrink-0" />
                  <span className="text-zinc-500 capitalize">{action}</span>
                  <span className="font-bold text-zinc-900 dark:text-white ml-auto">
                    {cost}cr
                  </span>
                </div>
              ))}
            </div>
          </div>

          {localBalance <= 5 && (
            <div className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              You&apos;re running low on credits. Top up below to keep generating AI content.
            </div>
          )}
        </div>
      </FadeIn>

      {/* ── Cache Efficiency ─────────────────────────────────── */}
      {cacheStats && (
        <FadeIn direction="up" delay={0.1}>
          <div className="rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    AI Response Caching Engine
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Shared curriculum & question cache eliminates duplicate API calls at 0 credit cost
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active (SHA-256)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block">Cached Generations</span>
                <span className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 block">
                  {cacheStats.totalEntries}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block">Community Cache Hits</span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 block">
                  {cacheStats.totalHits}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                <span className="text-xs text-zinc-500 block">Credits Saved</span>
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                  +{cacheStats.estimatedCreditsSaved} cr
                </span>
              </div>
            </div>
          </div>
        </FadeIn>
      )}

      {/* ── Packages ─────────────────────────────────────────── */}
      <div className="space-y-4">
        <FadeIn direction="up" delay={0.15}>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Top Up Credits</h2>
        </FadeIn>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <StaggerItem key={pkg.id}>
              <CardHover className="h-full">
                <button
                  onClick={() => { setSelectedPkg(pkg); setSuccessMsg(''); setErrorMsg(''); }}
                  className={`w-full h-full relative text-left p-5 rounded-2xl border transition-all duration-200 focus:outline-none ${
                    selectedPkg?.id === pkg.id
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50 dark:bg-indigo-950/30'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                      <Star className="w-2.5 h-2.5" /> Popular
                    </span>
                  )}
                  <div className="text-2xl font-black text-zinc-900 dark:text-white mb-1">
                    {pkg.credits}
                    <span className="text-sm font-medium text-zinc-500 ml-1">credits</span>
                  </div>
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {pkg.price}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">{pkg.label}</div>
                </button>
              </CardHover>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Payment form */}
        <AnimatePresence>
          {selectedPkg && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5"
            >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-zinc-900 dark:text-white text-base">
                Pay {selectedPkg.price} for {selectedPkg.credits} credits
              </h3>
              <button
                onClick={() => setSelectedPkg(null)}
                className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
              >
                ✕ Cancel
              </button>
            </div>

            {/* Method tabs */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                Payment Method
              </p>
              <div className="flex gap-2">
                {(['bkash', 'nagad', 'rocket'] as PaymentMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${
                      method === m
                        ? `${METHOD_COLORS[m]} border-transparent`
                        : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                    }`}
                  >
                    {METHOD_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            {/* Demo instructions */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 px-4 py-3 text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5" /> Demo Payment Instructions
              </p>
              <p>
                Send <strong>{selectedPkg.price}</strong> to our {METHOD_LABELS[method]} number:{' '}
                <strong>01700-000000</strong> (demo).
              </p>
              <p>
                Enter your mobile number and the Transaction ID ({METHOD_LABELS[method]} TrxID) below.
              </p>
              <p className="text-blue-500 dark:text-blue-400">
                ⚡ Instant top-up — credits are automatically added to your account upon submitting.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Your Mobile Number
                </label>
                <input
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                  Transaction ID (TrxID)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ABC123XYZ"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 shrink-0" /> {errorMsg}
              </p>
            )}

            <button
              onClick={handleSubmitPayment}
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60 shadow-sm shadow-indigo-500/20"
            >
              {submitting ? 'Submitting…' : `Submit ${METHOD_LABELS[method]} Payment`}
            </button>
          </motion.div>
        )}
        </AnimatePresence>

        {successMsg && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/60 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            {successMsg}
          </div>
        )}
      </div>

      {/* ── Transaction History ───────────────────────────────── */}
      <FadeIn direction="up" delay={0.2}>
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-zinc-400" />
            Transaction History
          </h2>

        {localTxns.length === 0 ? (
          <div className="text-center py-14 text-zinc-400 dark:text-zinc-600">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No transactions yet.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
            {localTxns.map((txn, i) => {
              const statusInfo = STATUS_BADGE[txn.status] ?? STATUS_BADGE.completed;
              const isTopUp = txn.amount > 0;
              return (
                <div
                  key={txn.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    i < localTxns.length - 1 ? 'border-b border-zinc-100 dark:border-zinc-800' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold ${
                      isTopUp
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {isTopUp ? '↑' : '↓'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                      {txn.description ?? (isTopUp ? 'Credit top-up' : 'AI generation')}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {new Date(txn.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {txn.method && txn.method !== 'system' && (
                        <> · <span className="capitalize">{txn.method}</span></>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusInfo.class}`}>
                      {statusInfo.label}
                    </span>

                    {txn.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(txn.id, txn.amount)}
                        disabled={approving === txn.id}
                        className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition disabled:opacity-60"
                      >
                        {approving === txn.id ? '…' : 'Approve (Demo)'}
                      </button>
                    )}

                    <span
                      className={`text-sm font-bold tabular-nums ${
                        isTopUp
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {isTopUp ? '+' : ''}{txn.amount} cr
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </FadeIn>

      {/* ── How credits work ─────────────────────────────────── */}
      <details className="group rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          How do credits work?
          <ChevronDown className="w-4 h-4 text-zinc-400 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <p>Every AI-powered generation in LearnStratum costs credits from your balance:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li><strong>Course outline</strong> — 3 credits</li>
            <li><strong>Lesson content</strong> — 2 credits</li>
            <li><strong>Quiz generation</strong> — 1 credit</li>
            <li><strong>Flashcard deck</strong> — 1 credit</li>
          </ul>
          <p>
            New accounts start with <strong>50 free credits</strong>. Credits never expire.
            Top up anytime using bKash, Nagad, or Rocket.
          </p>
          <p className="text-emerald-600 dark:text-emerald-400 font-medium">
            💡 Cache bonus: If you regenerate content for a popular topic, the system may return
            a cached result at <strong>zero credit cost</strong>.
          </p>
        </div>
      </details>
    </div>
  );
}
