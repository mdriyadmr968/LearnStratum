'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { SyllabusEditor } from '@/components/syllabus-editor';
import { generateCourseOutline } from '@/app/courses/actions';
import { type GeneratedCurriculum } from '@/lib/gemini/curriculum-schema';
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const SUGGESTED_TOPICS = [
  'Distributed Systems in Go',
  'Next.js 16 App Router Architecture',
  'Deep Learning & PyTorch Fundamentals',
  'System Design for High-Throughput APIs',
  'Financial Modeling with Python',
  'Rust for Systems Programming',
];

export default function NewCoursePage() {
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [customGoals, setCustomGoals] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [curriculum, setCurriculum] = useState<GeneratedCurriculum | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Please provide a subject or topic you wish to master.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenerationStep(1);

    // Simulated progress indicators for UX delight during LLM call
    const stepTimer1 = setTimeout(() => setGenerationStep(2), 1200);
    const stepTimer2 = setTimeout(() => setGenerationStep(3), 2800);

    try {
      const response = await generateCourseOutline({
        topic: topic.trim(),
        difficultyLevel,
        weeklyHours,
        customGoals: customGoals.trim() || undefined,
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!response.success || !response.curriculum) {
        setErrorMessage(response.error || 'Failed to synthesize curriculum.');
        setIsGenerating(false);
        setGenerationStep(0);
        return;
      }

      setCurriculum(response.curriculum);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        {/* If curriculum generated, render editor */}
        {curriculum ? (
          <SyllabusEditor
            initialCurriculum={curriculum}
            onReset={() => setCurriculum(null)}
          />
        ) : (
          /* Wizard Form */
          <div className="space-y-8">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Gemini 2.5 Flash Curriculum Synthesis
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                  What do you want to learn?
                </h1>
                <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
                  Specify your target topic and schedule. Gemini will design a progressive syllabus, break it down into modular lessons, and optimize queries for YouTube and web documentation.
                </p>
              </div>

              {errorMessage && (
                <div className="mt-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {isGenerating ? (
                /* Animated Generation State */
                <div className="py-16 text-center space-y-6 max-w-md mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                      Synthesizing Your Curriculum...
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500">
                      {generationStep === 1 && 'Analyzing pedagogical scope and prerequisites...'}
                      {generationStep === 2 && 'Structuring progressive modules and time budgets...'}
                      {generationStep >= 3 && 'Formulating lesson mastery objectives & search queries...'}
                    </p>
                  </div>

                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-1.5 rounded-full transition-all duration-700"
                      style={{
                        width:
                          generationStep === 1 ? '35%' : generationStep === 2 ? '70%' : '90%',
                      }}
                    />
                  </div>
                </div>
              ) : (
                /* Input Form */
                <form onSubmit={handleGenerate} className="mt-8 space-y-8">
                  {/* Topic Input */}
                  <div>
                    <label
                      htmlFor="topic"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Target Subject or Topic
                    </label>
                    <div className="relative">
                      <input
                        id="topic"
                        type="text"
                        required
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. Distributed Consensus Algorithms, Next.js 16, Linear Algebra"
                        className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 px-5 py-3.5 text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm"
                      />
                    </div>

                    {/* Quick suggestion chips */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-zinc-400">Popular:</span>
                      {SUGGESTED_TOPICS.map((sTopic) => (
                        <button
                          key={sTopic}
                          type="button"
                          onClick={() => setTopic(sTopic)}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 hover:bg-indigo-50 dark:bg-zinc-800 dark:hover:bg-indigo-950/60 text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition"
                        >
                          {sTopic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty Selector */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
                      Experience Level
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: 'beginner',
                          title: 'Beginner',
                          desc: 'Foundational concepts, fundamental vocabulary, step-by-step introduction',
                        },
                        {
                          id: 'intermediate',
                          title: 'Intermediate',
                          desc: 'Hands-on practical development, real-world patterns, building complete projects',
                        },
                        {
                          id: 'advanced',
                          title: 'Advanced',
                          desc: 'Deep architecture, internals, scaling bottlenecks, enterprise best practices',
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            setDifficultyLevel(
                              item.id as 'beginner' | 'intermediate' | 'advanced'
                            )
                          }
                          className={`p-4 rounded-2xl border text-left transition ${
                            difficultyLevel === item.id
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 ring-1 ring-indigo-600'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-800/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                              {item.title}
                            </span>
                            {difficultyLevel === item.id && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 leading-normal">
                            {item.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weekly Hours Commitment */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                        Weekly Time Commitment
                      </label>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {weeklyHours} Hours / Week
                      </span>
                    </div>

                    <input
                      type="range"
                      min={2}
                      max={25}
                      step={1}
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />

                    <div className="flex justify-between text-[11px] text-zinc-400 mt-1">
                      <span>2h (Casual pace)</span>
                      <span>5h (Standard sprint)</span>
                      <span>15h+ (Full-time immersion)</span>
                    </div>
                  </div>

                  {/* Optional Custom Focus */}
                  <div>
                    <label
                      htmlFor="customGoals"
                      className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Specific Goals or Focus (Optional)
                    </label>
                    <textarea
                      id="customGoals"
                      rows={2}
                      value={customGoals}
                      onChange={(e) => setCustomGoals(e.target.value)}
                      placeholder="e.g. Focus heavily on production clustering and benchmarking; skip basic installations."
                      className="w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 bg-white dark:bg-zinc-800/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition shadow-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isGenerating || !topic.trim()}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Synthesize Learning Syllabus
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
