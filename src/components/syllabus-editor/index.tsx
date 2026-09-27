'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  type GeneratedCurriculum,
  type GeneratedModule,
  type GeneratedLesson,
} from '@/lib/gemini/curriculum-schema';
import { saveCourseToDatabase } from '@/app/courses/actions';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  BookOpen,
  Clock,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface SyllabusEditorProps {
  initialCurriculum: GeneratedCurriculum;
  onReset: () => void;
}

export function SyllabusEditor({ initialCurriculum, onReset }: SyllabusEditorProps) {
  const router = useRouter();
  const [curriculum, setCurriculum] = useState<GeneratedCurriculum>(initialCurriculum);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Edit Course Meta
  const handleTitleChange = (val: string) => {
    setCurriculum((prev) => ({ ...prev, title: val }));
  };

  const handleDescriptionChange = (val: string) => {
    setCurriculum((prev) => ({ ...prev, description: val }));
  };

  // Module Operations
  const moveModule = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= curriculum.modules.length) return;

    setCurriculum((prev) => {
      const updated = [...prev.modules];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return { ...prev, modules: updated };
    });
  };

  const deleteModule = (index: number) => {
    if (curriculum.modules.length <= 1) {
      alert('A course must have at least one module.');
      return;
    }
    setCurriculum((prev) => ({
      ...prev,
      modules: prev.modules.filter((_, i) => i !== index),
    }));
  };

  const addModule = () => {
    const newModule: GeneratedModule = {
      title: `New Module ${curriculum.modules.length + 1}`,
      estimated_minutes: 60,
      lessons: [
        {
          title: 'Lesson 1: Introduction to Module',
          objectives: ['Understand key module concepts', 'Explore introductory examples'],
          search_queries: [`${curriculum.topic} tutorial`],
        },
      ],
    };
    setCurriculum((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }));
  };

  const updateModuleTitle = (mIdx: number, title: string) => {
    setCurriculum((prev) => {
      const updated = [...prev.modules];
      updated[mIdx] = { ...updated[mIdx], title };
      return { ...prev, modules: updated };
    });
  };

  // Lesson Operations
  const moveLesson = (mIdx: number, lIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? lIdx - 1 : lIdx + 1;
    if (targetIdx < 0 || targetIdx >= curriculum.modules[mIdx].lessons.length) return;

    setCurriculum((prev) => {
      const updatedModules = [...prev.modules];
      const lessons = [...updatedModules[mIdx].lessons];
      const temp = lessons[lIdx];
      lessons[lIdx] = lessons[targetIdx];
      lessons[targetIdx] = temp;
      updatedModules[mIdx] = { ...updatedModules[mIdx], lessons };
      return { ...prev, modules: updatedModules };
    });
  };

  const deleteLesson = (mIdx: number, lIdx: number) => {
    if (curriculum.modules[mIdx].lessons.length <= 1) {
      alert('Each module must have at least one lesson.');
      return;
    }
    setCurriculum((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[mIdx] = {
        ...updatedModules[mIdx],
        lessons: updatedModules[mIdx].lessons.filter((_, i) => i !== lIdx),
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const addLesson = (mIdx: number) => {
    const newLesson: GeneratedLesson = {
      title: `New Lesson ${curriculum.modules[mIdx].lessons.length + 1}`,
      objectives: ['Master fundamental principles', 'Complete practical exercise'],
      search_queries: [`${curriculum.topic} lesson`],
    };
    setCurriculum((prev) => {
      const updatedModules = [...prev.modules];
      updatedModules[mIdx] = {
        ...updatedModules[mIdx],
        lessons: [...updatedModules[mIdx].lessons, newLesson],
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const updateLessonTitle = (mIdx: number, lIdx: number, title: string) => {
    setCurriculum((prev) => {
      const updatedModules = [...prev.modules];
      const lessons = [...updatedModules[mIdx].lessons];
      lessons[lIdx] = { ...lessons[lIdx], title };
      updatedModules[mIdx] = { ...updatedModules[mIdx], lessons };
      return { ...prev, modules: updatedModules };
    });
  };

  // Confirm and Save
  const handleConfirmAndBuild = async () => {
    setIsSaving(true);
    setErrorMessage(null);

    const result = await saveCourseToDatabase(curriculum);

    if (!result.success || !result.courseId) {
      setErrorMessage(result.error || 'Failed to create course. Please try again.');
      setIsSaving(false);
      return;
    }

    router.push(`/courses/${result.courseId}`);
  };

  const totalLessons = curriculum.modules.reduce(
    (acc, m) => acc + m.lessons.length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Editor Header */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Syllabus Editor
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize">
              {curriculum.difficulty_level}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              {curriculum.weekly_hours_allocated}h / week
            </span>
          </div>

          <div className="text-xs font-medium text-zinc-500">
            {curriculum.modules.length} Modules • {totalLessons} Lessons
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Course Title
          </label>
          <input
            type="text"
            value={curriculum.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-indigo-600 focus:outline-none pb-1 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
            Overview & Scope
          </label>
          <textarea
            value={curriculum.description}
            rows={2}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="w-full text-sm text-zinc-600 dark:text-zinc-400 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:border-indigo-600 focus:outline-none pb-1 transition resize-none"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modules List */}
      <div className="space-y-6">
        {curriculum.modules.map((module, mIdx) => (
          <div
            key={mIdx}
            className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
          >
            {/* Module Bar */}
            <div className="bg-zinc-50 dark:bg-zinc-900/80 px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-[240px]">
                <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {mIdx + 1}
                </span>
                <input
                  type="text"
                  value={module.title}
                  onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                  className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-600 focus:outline-none py-0.5 flex-1 transition"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs text-zinc-500 mr-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {module.estimated_minutes} min
                </span>

                <button
                  type="button"
                  title="Move module up"
                  disabled={mIdx === 0}
                  onClick={() => moveModule(mIdx, 'up')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Move module down"
                  disabled={mIdx === curriculum.modules.length - 1}
                  onClick={() => moveModule(mIdx, 'down')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  title="Delete module"
                  onClick={() => deleteModule(mIdx)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lessons Container */}
            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {module.lessons.map((lesson, lIdx) => (
                  <div
                    key={lIdx}
                    className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 hover:border-indigo-300 dark:hover:border-indigo-900 transition"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1">
                        <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLessonTitle(mIdx, lIdx, e.target.value)}
                          className="text-sm font-medium text-zinc-900 dark:text-zinc-200 bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-indigo-600 focus:outline-none py-0.5 flex-1 transition"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Move lesson up"
                          disabled={lIdx === 0}
                          onClick={() => moveLesson(mIdx, lIdx, 'up')}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Move lesson down"
                          disabled={lIdx === module.lessons.length - 1}
                          onClick={() => moveLesson(mIdx, lIdx, 'down')}
                          className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          title="Delete lesson"
                          onClick={() => deleteLesson(mIdx, lIdx)}
                          className="p-1 rounded text-zinc-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Objectives List */}
                    {lesson.objectives && lesson.objectives.length > 0 && (
                      <div className="mt-3 pl-6 border-l-2 border-indigo-200 dark:border-indigo-900/60 space-y-1">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                          Mastery Objectives:
                        </span>
                        {lesson.objectives.map((obj, oIdx) => (
                          <div key={oIdx} className="flex items-start gap-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                            <span className="text-indigo-500 font-bold">•</span>
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addLesson(mIdx)}
                className="w-full py-2 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Lesson to Module {mIdx + 1}
              </button>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addModule}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 transition flex items-center justify-center gap-2 bg-white/40 dark:bg-zinc-900/40"
        >
          <Plus className="w-4 h-4" />
          Add New Module
        </button>
      </div>

      {/* Confirmation Sticky Footer */}
      <div className="sticky bottom-6 z-20 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-5 shadow-2xl shadow-zinc-500/10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Satisfied with this curriculum structure?
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Confirming will generate your course classroom and unlock grounding content.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onReset}
            disabled={isSaving}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            Start Over
          </button>

          <button
            type="button"
            onClick={handleConfirmAndBuild}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building Course...
              </>
            ) : (
              <>
                Confirm & Build Course
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
