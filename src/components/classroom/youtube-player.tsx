'use client';

import React, { useState } from 'react';
import { Video, ExternalLink, User, Film } from 'lucide-react';
import type { ResourceRow } from '@/lib/harvester/curator';

interface YouTubePlayerProps {
  videos: ResourceRow[];
}

export function YouTubePlayer({ videos }: YouTubePlayerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!videos || videos.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
        <Video className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="text-xs text-zinc-500">No video tutorials found for this lesson.</p>
      </div>
    );
  }

  const currentVideo = videos[selectedIndex];
  const videoId = currentVideo.external_id;

  return (
    <div className="space-y-4">
      {/* Video Switcher Tabs (if more than 1 video) */}
      {videos.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {videos.map((vid, idx) => (
            <button
              key={vid.id}
              onClick={() => setSelectedIndex(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedIndex === idx
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Video {idx + 1}: {vid.channel_or_author || 'Tutorial'}</span>
            </button>
          ))}
        </div>
      )}

      {/* 16:9 Responsive Video Container */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-lg border border-zinc-200 dark:border-zinc-800">
        {videoId ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
            title={currentVideo.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6 text-center">
            <Video className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm font-medium">Video preview unavailable</p>
            <a
              href={currentVideo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline"
            >
              Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>

      {/* Video Details Card */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1 max-w-xl">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
            {currentVideo.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3 text-zinc-400" />
              {currentVideo.channel_or_author || 'YouTube Educator'}
            </span>
          </div>
        </div>

        <a
          href={currentVideo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
        >
          YouTube Link
          <ExternalLink className="w-3 h-3 text-zinc-400" />
        </a>
      </div>
    </div>
  );
}
