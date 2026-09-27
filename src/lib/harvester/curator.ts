import { createClient } from '@/lib/supabase/server';
import { searchYouTubeVideos } from './youtube';
import { fetchWebDocumentation } from './web';
import type { Database } from '@/lib/supabase/types';

export type ResourceRow = Database['public']['Tables']['resources']['Row'];

export async function harvestLessonResources({
  lessonId,
  lessonTitle,
  courseTopic,
  searchQueries = [],
}: {
  lessonId: string;
  lessonTitle: string;
  courseTopic: string;
  searchQueries?: string[];
}): Promise<ResourceRow[]> {
  const supabase = await createClient();

  // 1. Check if resources are already curated in PostgreSQL for this lesson
  try {
    const { data: existingResources } = await supabase
      .from('resources')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    if (existingResources && existingResources.length > 0) {
      // Filter out broken articles (e.g. YouTube scraped by Jina Reader)
      const validArticles = existingResources.filter(
        (r) =>
          r.type === 'web_article' &&
          !r.url.includes('youtube.com') &&
          !r.url.includes('youtu.be') &&
          !(r.summary_markdown && r.summary_markdown.includes('Target URL returned error 401'))
      );
      const validVideos = existingResources.filter((r) => r.type === 'youtube_video');

      // If we have valid articles and videos, return immediately
      if (validArticles.length > 0 && validVideos.length > 0) {
        return [...validVideos, ...validArticles];
      }
    }
  } catch (err) {
    console.warn('Error reading existing resources:', err);
  }

  // 2. Select primary search query
  const primaryQuery =
    searchQueries.length > 0
      ? searchQueries[0]
      : `${courseTopic} ${lessonTitle}`;

  // 3. Concurrently harvest from YouTube Data API and Web/Jina Reader
  const [videos, articles] = await Promise.all([
    searchYouTubeVideos(primaryQuery, 2),
    fetchWebDocumentation(lessonTitle, courseTopic),
  ]);

  // 4. Construct resource records for insertion
  const inserts: Database['public']['Tables']['resources']['Insert'][] = [];

  // Add YouTube video resources
  for (const video of videos) {
    inserts.push({
      lesson_id: lessonId,
      type: 'youtube_video',
      title: video.title,
      url: video.url,
      external_id: video.videoId,
      channel_or_author: video.channelTitle,
      summary_markdown: video.description,
      is_completed: false,
    });
  }

  // Add Web Article / Doc resources
  for (const article of articles) {
    inserts.push({
      lesson_id: lessonId,
      type: 'web_article',
      title: article.title,
      url: article.url,
      channel_or_author: article.authorOrSource,
      summary_markdown: article.contentMarkdown,
      is_completed: false,
    });
  }

  // 5. Persist to Supabase resources table
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('resources')
      .insert(inserts)
      .select('*');

    if (!insertError && inserted) {
      return inserted;
    }
  } catch (err) {
    console.error('Failed to persist harvested resources:', err);
  }

  // Return generated resources as in-memory fallback
  return inserts.map((res, idx) => ({
    id: `temp-${idx}`,
    lesson_id: lessonId,
    type: res.type,
    title: res.title,
    url: res.url,
    external_id: res.external_id || null,
    channel_or_author: res.channel_or_author || null,
    duration_seconds: null,
    summary_markdown: res.summary_markdown || null,
    is_completed: false,
    created_at: new Date().toISOString(),
  }));
}
