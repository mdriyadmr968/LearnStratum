'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import {
  Search as SearchIcon,
  Sparkles,
  BookOpen,
  ExternalLink,
  Loader2,
  X,
  Layers,
  FileText,
} from 'lucide-react';
import { searchContent, type SearchResultItem } from './actions';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'lesson' | 'resource'>('all');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSemantic, setIsSemantic] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (text: string) => {
    const term = text.trim();
    if (!term) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    startTransition(async () => {
      setHasSearched(true);
      const res = await searchContent(term);
      if (res.success) {
        setResults(res.results);
        setIsSemantic(res.isSemanticSearch);
      }
    });
  };

  const filteredResults = results.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* Search Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Supabase pgvector + Gemini Embeddings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Semantic Knowledge Search
          </h1>
          <p className="text-sm text-zinc-500 max-w-lg mx-auto">
            Search naturally across lessons, curriculum objectives, and curated web documentation.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 w-5 h-5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="e.g., How does backpropagation adjust weights?"
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 text-sm sm:text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setHasSearched(false);
                }}
                className="absolute right-4 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center justify-between mt-4 px-1">
            <div className="flex items-center gap-2">
              {(['all', 'lesson', 'resource'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                    filter === tab
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {tab === 'all' ? 'All Results' : `${tab}s`}
                </button>
              ))}
            </div>

            {hasSearched && (
              <span className="text-xs text-zinc-400">
                {isPending ? (
                  <span className="inline-flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching…
                  </span>
                ) : (
                  <span>
                    {filteredResults.length} matches {isSemantic ? '(vector matched)' : ''}
                  </span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Results Container */}
        <div className="space-y-4">
          {isPending && results.length === 0 && (
            <div className="py-12 text-center text-zinc-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
              <span className="text-sm">Generating semantic vectors and querying database…</span>
            </div>
          )}

          {!isPending && hasSearched && filteredResults.length === 0 && (
            <div className="p-8 text-center rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 space-y-2">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 text-sm">
                No matching lessons or resources found
              </p>
              <p className="text-xs text-zinc-500">
                Try searching with different concepts, keywords, or topics.
              </p>
            </div>
          )}

          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900/60 transition space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
                    {item.type === 'lesson' ? (
                      <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        {item.type}
                      </span>
                      {item.courseTitle && (
                        <span className="text-xs text-zinc-500 truncate max-w-xs">
                          • {item.courseTitle}
                        </span>
                      )}
                    </div>
                    <Link
                      href={item.url}
                      target={item.type === 'resource' ? '_blank' : undefined}
                      className="font-bold text-sm sm:text-base text-zinc-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition inline-flex items-center gap-1.5"
                    >
                      <span>{item.title}</span>
                      {item.type === 'resource' && <ExternalLink className="w-3.5 h-3.5" />}
                    </Link>
                    {item.snippet && (
                      <p className="mt-1 text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                        {item.snippet}
                      </p>
                    )}
                  </div>
                </div>

                {/* Similarity Badge */}
                <span className="shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/60">
                  {item.similarity}% match
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
