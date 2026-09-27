import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { GoogleGenAI } from '@google/genai';
import { generateContentStreamWithFallback } from '@/lib/gemini/models';
import { checkRateLimit } from '@/lib/ratelimit';

export const runtime = 'nodejs';

const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? '',
});

/**
 * POST /api/tutor
 * Body: { lessonTitle, objectives, markdownContext, question }
 * Returns: text/event-stream of streamed Gemini tokens.
 */
export async function POST(request: Request) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      '',
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Rate limit: 5 requests / minute per user ──────────────────────────────
  const rl = await checkRateLimit(`tutor:${user.id}`, 5, 60_000);
  if (!rl.success) {
    const retryAfter = Math.ceil(rl.resetMs / 1000);
    return new Response(
      JSON.stringify({
        error: `Rate limit exceeded. Try again in ${retryAfter}s.`,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  // ── Parse Body ────────────────────────────────────────────────────────────
  let body: {
    lessonTitle?: string;
    objectives?: string[];
    markdownContext?: string;
    question?: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { lessonTitle = '', objectives = [], markdownContext = '', question = '' } = body;

  if (!question.trim()) {
    return new Response(JSON.stringify({ error: 'question is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // ── Build Prompt ──────────────────────────────────────────────────────────
  const objectivesList =
    objectives.length > 0
      ? objectives.map((o, i) => `${i + 1}. ${o}`).join('\n')
      : 'Not specified.';

  const contextSnippet =
    markdownContext.length > 2000
      ? markdownContext.slice(0, 2000) + '\n...[truncated]'
      : markdownContext;

  const systemPrompt = `You are an expert AI tutor embedded in LearnStratum, an adaptive LMS.
You help students understand the current lesson deeply. Be concise, friendly, and pedagogically sound.
Use markdown formatting (bold, bullet lists, code blocks where relevant).
Never hallucinate. If you are unsure, say so.

## Current Lesson
**Title:** ${lessonTitle}

**Learning Objectives:**
${objectivesList}

## Reference Material (harvested web content)
${contextSnippet || '(No reference material available for this lesson yet.)'}

Answer the student's question below based on the lesson context above.`;

  // ── Stream from Gemini ────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await generateContentStreamWithFallback(genai, {
          contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n**Student question:** ${question}` }] }],
          config: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        });

        for await (const chunk of result) {
          const text = chunk.text ?? '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch (err) {
        console.error('[AI Tutor Stream Error]:', err);
        controller.enqueue(
          encoder.encode(
            "\n\n*I'm experiencing high traffic right now and couldn't complete this response. Please try asking your question again in a moment.*"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
