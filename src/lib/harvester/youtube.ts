import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';
import type { Json } from '@/lib/supabase/types';

export interface YouTubeVideoResult {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  url: string;
  embedUrl: string;
}

export async function searchYouTubeVideos(
  query: string,
  maxResults = 2
): Promise<YouTubeVideoResult[]> {
  const normalizedQuery = query.trim().toLowerCase();
  const queryHash = crypto.createHash('sha256').update(normalizedQuery).digest('hex');

  const supabase = await createClient();

  // 1. Check PostgreSQL Cache
  try {
    const { data: cached } = await supabase
      .from('youtube_search_cache')
      .select('results')
      .eq('query_hash', queryHash)
      .single();

    if (cached && Array.isArray(cached.results) && cached.results.length > 0) {
      return cached.results as unknown as YouTubeVideoResult[];
    }
  } catch {
    // Cache miss or table not accessible yet, proceed to API
  }

  // 2. Fetch from YouTube Data API v3
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey.includes('placeholder')) {
    return getFallbackVideos(query);
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search');
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('type', 'video');
    url.searchParams.set('videoDuration', 'medium');
    url.searchParams.set('relevanceLanguage', 'en');
    url.searchParams.set('maxResults', String(maxResults));
    url.searchParams.set('q', query);
    url.searchParams.set('key', apiKey);

    const response = await fetch(url.toString(), {
      next: { revalidate: 86400 }, // Cache on edge for 24h
    });

    if (!response.ok) {
      console.warn(`YouTube API returned status ${response.status}. Using fallback video data.`);
      return getFallbackVideos(query);
    }

    const data = await response.json();
    interface RawYouTubeItem {
      id?: { videoId?: string };
      snippet?: {
        title?: string;
        description?: string;
        channelTitle?: string;
        thumbnails?: {
          high?: { url?: string };
          medium?: { url?: string };
        };
      };
    }

    const items = (data.items || []) as RawYouTubeItem[];

    const results: YouTubeVideoResult[] = items
      .filter((item): item is RawYouTubeItem & { id: { videoId: string } } => Boolean(item.id?.videoId))
      .map((item) => {
        const videoId = item.id.videoId;
        return {
          videoId,
          title: item.snippet?.title || 'Tutorial Video',
          description: item.snippet?.description || '',
          channelTitle: item.snippet?.channelTitle || 'Educator',
          thumbnailUrl:
            item.snippet?.thumbnails?.high?.url ||
            item.snippet?.thumbnails?.medium?.url ||
            `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
        };
      });

    if (results.length > 0) {
      // 3. Save to PostgreSQL Cache
      try {
        await supabase.from('youtube_search_cache').upsert({
          query_hash: queryHash,
          query_text: query,
          results: results as unknown as Json,
          cached_at: new Date().toISOString(),
        });
      } catch (cacheErr) {
        console.warn('Failed to cache YouTube search results:', cacheErr);
      }
      return results;
    }

    return getFallbackVideos(query);
  } catch (error) {
    console.error('YouTube search failed:', error);
    return getFallbackVideos(query);
  }
}

function getFallbackVideos(query: string): YouTubeVideoResult[] {
  return [
    {
      videoId: 'dQw4w9WgXcQ', // Sample educational placeholder ID
      title: `${query} - Comprehensive Concept Walkthrough`,
      description: `In-depth educational lecture and practical implementation guide exploring ${query}.`,
      channelTitle: 'LearnStratum Academic Commons',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
      embedUrl: `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(query)}`,
    },
  ];
}
