'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import {
  CREDIT_PACKAGES,
  type PaymentMethod,
  type CreditPackage,
  type CreditState,
} from '@/lib/credits';

export type { PaymentMethod, CreditPackage, CreditState };


/**
 * Fetch current user's credit balance + last 20 transactions
 */
export async function getCreditState(): Promise<CreditState | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_credits, plan')
    .eq('id', user.id)
    .single();

  const { data: txns } = await supabase
    .from('credit_transactions')
    .select('id, amount, method, reference, status, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return {
    balance: (profile?.ai_credits as number) ?? 0,
    plan: (profile?.plan as string) ?? 'free',
    transactions: txns ?? [],
  };
}

/**
 * Deduct credits for an AI generation action.
 * Returns true if deduction succeeded, false if insufficient balance.
 */
export async function deductCredits(
  amount: number,
  description: string
): Promise<{ success: boolean; remaining: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, remaining: 0, error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_credits')
    .eq('id', user.id)
    .single();

  const current = (profile?.ai_credits as number) ?? 0;
  if (current < amount) {
    return {
      success: false,
      remaining: current,
      error: `Insufficient credits. You have ${current} credits but this action requires ${amount}.`,
    };
  }

  const newBalance = current - amount;

  await supabase
    .from('profiles')
    .update({ ai_credits: newBalance, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  await supabase.from('credit_transactions').insert({
    user_id: user.id,
    amount: -amount,
    method: 'system',
    status: 'completed',
    description,
  });

  revalidatePath('/credits');
  return { success: true, remaining: newBalance };
}

/**
 * Submit a demo payment request (bKash / Nagad / Rocket).
 * Creates a "pending" transaction — must be approved by admin.
 */
export async function submitPaymentRequest(
  packageId: string,
  method: PaymentMethod,
  phone: string,
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
  if (!pkg) return { success: false, error: 'Invalid package' };

  const { error } = await supabase.from('credit_transactions').insert({
    user_id: user.id,
    amount: pkg.credits,
    method,
    reference: `${transactionId} | Phone: ${phone}`,
    status: 'pending',
    description: `${pkg.label} – ${pkg.credits} credits via ${method} (${pkg.price})`,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath('/credits');
  return { success: true };
}

/**
 * Admin action: approve a pending payment and credit the user's balance.
 * In production this would be behind an admin role check.
 * For demo: any authenticated user can approve (self-service demo flow).
 */
export async function approvePendingTransaction(
  transactionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Not authenticated' };

  // Fetch the pending transaction
  const { data: txn } = await supabase
    .from('credit_transactions')
    .select('id, user_id, amount, status')
    .eq('id', transactionId)
    .eq('user_id', user.id)
    .single();

  if (!txn) return { success: false, error: 'Transaction not found' };
  if (txn.status !== 'pending') return { success: false, error: 'Transaction already processed' };

  // Mark approved
  await supabase
    .from('credit_transactions')
    .update({ status: 'approved' })
    .eq('id', transactionId);

  // Top-up balance
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_credits')
    .eq('id', user.id)
    .single();

  const newBalance = ((profile?.ai_credits as number) ?? 0) + txn.amount;
  await supabase
    .from('profiles')
    .update({ ai_credits: newBalance, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  revalidatePath('/credits');
  return { success: true };
}

/**
 * Helper: get current credit balance for the logged-in user.
 * Lightweight — only reads ai_credits.
 */
export async function getUserCreditBalance(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data } = await supabase
    .from('profiles')
    .select('ai_credits')
    .eq('id', user.id)
    .single();

  return (data?.ai_credits as number) ?? 0;
}
