'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  BotMessageSquare,
  X,
  Send,
  Loader2,
  Zap,
  BookOpen,
  HelpCircle,
  Lightbulb,
  ChevronRight,
} from 'lucide-react';

interface AiTutorDrawerProps {
  lessonTitle: string;
  objectives: string[];
  markdownContext: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  { label: 'Explain differently', icon: BookOpen },
  { label: 'Real-world analogy', icon: Lightbulb },
  { label: 'Quiz me on this section', icon: HelpCircle },
] as const;

export function AiTutorDrawer({
  lessonTitle,
  objectives,
  markdownContext,
}: AiTutorDrawerProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when drawer opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const ask = useCallback(
    async (question: string) => {
      if (!question.trim() || streaming) return;

      setError(null);
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setInput('');
      setStreaming(true);

      // Placeholder for the streaming assistant reply
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      try {
        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTitle,
            objectives,
            markdownContext,
            question,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(data.error ?? `Request failed: ${res.status}`);
        }

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          accumulated += chunk;

          // Update the last assistant message in-place
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: 'assistant',
              content: accumulated,
            };
            return updated;
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Something went wrong';
        setError(msg);
        // Remove the empty assistant placeholder
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setStreaming(false);
      }
    },
    [lessonTitle, objectives, markdownContext, streaming]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      ask(input);
    }
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle AI Tutor"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-xl shadow-indigo-500/30 transition-all duration-200 hover:scale-105 active:scale-95 animate-ai-orb"
      >
        <BotMessageSquare className="w-5 h-5" />
        <span className="hidden sm:inline">AI Tutor</span>
        {messages.length > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center">
            {Math.floor(messages.length / 2)}
          </span>
        )}
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed bottom-0 right-0 z-50 flex flex-col
          w-full sm:w-[420px] h-[85vh] sm:h-[600px] sm:bottom-20 sm:right-6
          rounded-t-3xl sm:rounded-3xl
          bg-white dark:bg-zinc-900
          border border-zinc-200/80 dark:border-zinc-700
          shadow-2xl shadow-indigo-500/10
          transition-all duration-300 ease-out
          ${open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'}
        `}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow">
              <BotMessageSquare className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900 dark:text-white">AI Tutor</p>
              <p className="text-[11px] text-zinc-500 truncate max-w-[200px]">{lessonTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            aria-label="Close AI Tutor"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="space-y-4">
              {/* Greeting */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border border-violet-100 dark:border-violet-900/40 space-y-2">
                <p className="text-sm font-semibold text-violet-800 dark:text-violet-200 flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Hi! I&apos;m your AI Tutor
                </p>
                <p className="text-xs text-violet-700 dark:text-violet-300 leading-relaxed">
                  I&apos;m context-loaded with <strong>{lessonTitle}</strong>. Ask me anything or pick a quick action below.
                </p>
              </div>

              {/* Quick actions */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Quick Actions
                </p>
                {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => ask(label)}
                    disabled={streaming}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200/60 dark:border-zinc-700/60 hover:border-indigo-200 dark:hover:border-indigo-800 text-left text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all group"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-500" />
                      {label}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose prose-sm dark:prose-invert prose-p:my-1 prose-li:my-0.5 prose-pre:text-xs max-w-none">
                    <ReactMarkdown>{msg.content || ' '}</ReactMarkdown>
                    {streaming && i === messages.length - 1 && (
                      <span className="inline-block w-1.5 h-4 bg-indigo-500 rounded-sm animate-pulse ml-0.5 align-middle" />
                    )}
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300">
              ⚠️ {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Quick actions (when chat is active) */}
        {messages.length > 0 && (
          <div className="px-4 pb-2 flex gap-2 overflow-x-auto shrink-0">
            {QUICK_ACTIONS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => ask(label)}
                disabled={streaming}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-zinc-200 dark:border-zinc-700 text-[11px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition disabled:opacity-50"
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 shrink-0"
        >
          <div className="flex items-end gap-2 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this lesson…"
              rows={1}
              disabled={streaming}
              className="flex-1 resize-none bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 px-3 py-2.5 outline-none max-h-32 disabled:opacity-50"
              style={{ field_sizing: 'content' } as React.CSSProperties}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="shrink-0 mb-1.5 mr-1.5 w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition"
              aria-label="Send"
            >
              {streaming ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-zinc-400 mt-1.5">
            Enter to send · Shift+Enter for newline · 5 msgs/min
          </p>
        </form>
      </div>
    </>
  );
}
