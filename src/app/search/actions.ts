'use server';

import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/gemini/embeddings';

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'lesson' | 'resource';
  snippet?: string | null;
  url: string;
  courseTitle?: string | null;
  similarity: number; // 0 to 1
  isSemantic: boolean;
}

export interface SearchResponse {
  success: boolean;
  results: SearchResultItem[];
  isSemanticSearch: boolean;
  error?: string;
}

export async function searchContent(query: string): Promise<SearchResponse> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { success: true, results: [], isSemanticSearch: false };
  }

  const supabase = await createClient();

  // 1. Attempt to generate embedding for semantic search
  const embedding = await generateEmbedding(cleanQuery);
  let semanticSuccess = false;
  const results: SearchResultItem[] = [];

  if (embedding) {
    try {
      // Query match_lessons RPC
      const { data: lessonMatches, error: lErr } = await (supabase as any).rpc(
        'match_lessons',
        {
          query_embedding: embedding,
          match_threshold: 0.35,
          match_count: 8,
        }
      );

      if (!lErr && Array.isArray(lessonMatches)) {
        semanticSuccess = true;
        for (const item of lessonMatches) {
          results.push({
            id: item.id,
            title: item.title,
            type: 'lesson',
            url: `/courses/${item.course_id}/lesson/${item.id}`,
            courseTitle: item.course_title,
            similarity: Math.round((item.similarity || 0) * 100),
            isSemantic: true,
          });
        }
      }

      // Query match_resources RPC
      const { data: resourceMatches, error: rErr } = await (supabase as any).rpc(
        'match_resources',
        {
          query_embedding: embedding,
          match_threshold: 0.35,
          match_count: 6,
        }
      );

      if (!rErr && Array.isArray(resourceMatches)) {
        semanticSuccess = true;
        for (const item of resourceMatches) {
          results.push({
            id: item.id,
            title: item.title,
            type: 'resource',
            snippet: item.summary_markdown?.slice(0, 160),
            url: item.url,
            similarity: Math.round((item.similarity || 0) * 100),
            isSemantic: true,
          });
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 2. If vector search yielded 0 results (e.g. pgvector not yet populated), fallback to ILIKE text search
  if (results.length === 0) {
    const { data: textLessons } = await supabase
      .from('lessons')
      .select(`
        id,
        title,
        modules (
          course_id,
          courses (id, title)
        )
      `)
      .ilike('title', `%${cleanQuery}%`)
      .limit(8);

    const lessonItems = (textLessons as any[]) ?? [];
    if (lessonItems.length > 0) {
      for (const item of lessonItems) {
        const mod = item.modules as any;
        const course = mod?.courses as any;
        const courseId = course?.id || mod?.course_id;
        results.push({
          id: item.id,
          title: item.title,
          type: 'lesson',
          url: courseId ? `/courses/${courseId}/lesson/${item.id}` : '#',
          courseTitle: course?.title || 'Course Lesson',
          similarity: 95,
          isSemantic: false,
        });
      }
    }

    const { data: textResources } = await supabase
      .from('resources')
      .select('id, title, url, summary_markdown')
      .or(`title.ilike.%${cleanQuery}%,summary_markdown.ilike.%${cleanQuery}%`)
      .limit(6);

    if (textResources && textResources.length > 0) {
      for (const r of textResources) {
        results.push({
          id: r.id,
          title: r.title,
          type: 'resource',
          snippet: r.summary_markdown?.slice(0, 160),
          url: r.url,
          similarity: 90,
          isSemantic: false,
        });
      }
    }
  }

  // Sort descending by similarity score
  results.sort((a, b) => b.similarity - a.similarity);

  return {
    success: true,
    results,
    isSemanticSearch: semanticSuccess,
  };
}
