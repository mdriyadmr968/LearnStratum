/**
 * AI Response Cache for LearnStratum
 *
 * Caches AI-generated content (lesson, quiz, flashcards, outline) by a
 * SHA-256 hash of the normalized prompt. Cache hits save credits.
 *
 * TTL policy:
 *   lesson    → 7 days
 *   quiz      → 3 days
 *   flashcards→ 3 days
 *   outline   → 3 days
 */

import { createClient } from '@/lib/supabase/server';

export type CacheActionType = 'lesson' | 'quiz' | 'flashcards' | 'outline';

const TTL_DAYS: Record<CacheActionType, number> = {
  lesson: 7,
  quiz: 3,
  flashcards: 3,
  outline: 3,
};

/**
 * Compute a SHA-256 hex digest of the given string.
 * Uses the Web Crypto API available in Next.js edge / Node runtimes.
 */
export async function hashPrompt(prompt: string): Promise<string> {
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, ' ');
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export interface CacheLookupResult<T> {
  hit: boolean;
  data: T | null;
}

/**
 * Look up a cached AI response.
 * Returns { hit: true, data } on cache hit, { hit: false, data: null } on miss or expiry.
 */
export async function getCachedResponse<T>(
  prompt: string,
  actionType: CacheActionType
): Promise<CacheLookupResult<T>> {
  try {
    const supabase = await createClient();
    const hash = await hashPrompt(prompt);

    const { data, error } = await supabase
      .from('ai_cache')
      .select('id, response_json, expires_at')
      .eq('prompt_hash', hash)
      .eq('action_type', actionType)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) return { hit: false, data: null };

    // Best-effort hit count increment (fire-and-forget)
    incrementCacheHit(data.id).catch(() => {});

    return { hit: true, data: data.response_json as T };
  } catch {
    return { hit: false, data: null };
  }
}

/**
 * Store an AI response in the cache.
 * Safe to call even if the same hash already exists (upsert on conflict).
 */
export async function setCachedResponse(
  prompt: string,
  actionType: CacheActionType,
  responseJson: Record<string, unknown>
): Promise<void> {
  try {
    const supabase = await createClient();
    const hash = await hashPrompt(prompt);

    const ttlDays = TTL_DAYS[actionType] ?? 3;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);

    await supabase.from('ai_cache').upsert(
      {
        prompt_hash: hash,
        action_type: actionType,
        response_json: responseJson,
        hit_count: 0,
        expires_at: expiresAt.toISOString(),
      },
      { onConflict: 'prompt_hash' }
    );
  } catch {
    // Cache write failure is non-fatal — AI call already succeeded
  }
}

/**
 * Increment the hit_count for a cache entry via a simple update.
 * Uses a raw SQL-safe pattern since Supabase JS doesn't expose atomic increments
 * without a custom RPC. We just do a re-fetch + update here for simplicity.
 */
export async function incrementCacheHit(cacheId: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ai_cache')
      .select('hit_count')
      .eq('id', cacheId)
      .single();
    if (data) {
      await supabase
        .from('ai_cache')
        .update({ hit_count: (data.hit_count ?? 0) + 1 })
        .eq('id', cacheId);
    }
  } catch {
    // Non-fatal
  }
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  estimatedCreditsSaved: number;
}

export async function getCacheStats(): Promise<CacheStats> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ai_cache')
      .select('hit_count, action_type');

    if (!data || data.length === 0) {
      return { totalEntries: 0, totalHits: 0, estimatedCreditsSaved: 0 };
    }

    let totalHits = 0;
    let savedCredits = 0;

    data.forEach((row) => {
      const hits = (row.hit_count as number) || 0;
      totalHits += hits;
      const weight = row.action_type === 'outline' ? 3 : row.action_type === 'lesson' ? 2 : 1;
      savedCredits += hits * weight;
    });

    return {
      totalEntries: data.length,
      totalHits,
      estimatedCreditsSaved: savedCredits,
    };
  } catch {
    return { totalEntries: 0, totalHits: 0, estimatedCreditsSaved: 0 };
  }
}
