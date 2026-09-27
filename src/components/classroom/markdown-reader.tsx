'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileText, ExternalLink, Globe } from 'lucide-react';
import type { ResourceRow } from '@/lib/harvester/curator';

interface MarkdownReaderProps {
  articles: ResourceRow[];
}

export function MarkdownReader({ articles }: MarkdownReaderProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!articles || articles.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-8 text-center">
        <FileText className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
        <p className="text-xs text-zinc-500">No documentation pages curated for this lesson.</p>
      </div>
    );
  }

  const currentArticle = articles[selectedIndex];

  return (
    <div className="space-y-4">
      {/* Article Switcher Tabs */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200/80 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          {articles.map((art, idx) => (
            <button
              key={art.id}
              onClick={() => setSelectedIndex(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedIndex === idx
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Doc {idx + 1}: {art.channel_or_author || 'Reference'}</span>
            </button>
          ))}
        </div>

        <a
          href={currentArticle.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
        >
          <span>Source</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Markdown Document Content */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm max-h-[600px] overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Curated by Jina Reader • {currentArticle.channel_or_author}</span>
        </div>

        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          {currentArticle.title}
        </h2>

        <div className="text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed space-y-4 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mt-4 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mt-3 [&>h3]:text-sm [&>h3]:font-bold [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-1 [&>code]:bg-zinc-100 [&>code]:dark:bg-zinc-800 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:font-mono [&>code]:text-xs [&>pre]:bg-zinc-900 [&>pre]:text-zinc-100 [&>pre]:p-4 [&>pre]:rounded-xl [&>pre]:overflow-x-auto [&>blockquote]:border-l-4 [&>blockquote]:border-indigo-500 [&>blockquote]:pl-4 [&>blockquote]:italic">
          <ReactMarkdown>
            {currentArticle.summary_markdown || '*No content available.*'}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
