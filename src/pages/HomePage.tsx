import { useState } from 'react';
import type { IndexData, Question } from '../types';
import type { Certification } from '../certifications/registry';
import type { CertStorage } from '../utils/storage';
import { getWeakChapters } from '../utils/exam';

interface Props {
  cert: Certification;
  storage: CertStorage;
  indexData: IndexData;
  passPercent: number;
  questionsByChapter: Map<number, Question[]>;
  onStartFullExam: () => void;
  onStartSection: (chapterId: number, count: number, timedMinutes: number | null) => void;
}

export function HomePage({ cert, storage, indexData, passPercent, questionsByChapter, onStartFullExam, onStartSection }: Props) {
  const [mode, setMode] = useState<'full' | 'section' | null>(null);
  const weakChapters = getWeakChapters(storage.getAttempts(), indexData.chapters, passPercent);
  const firstChapterId = indexData.chapters[0]?.id ?? 1;
  const [selectedChapter, setSelectedChapter] = useState<number>(firstChapterId);
  const maxQuestions = questionsByChapter.get(selectedChapter)?.length ?? 1;
  const [questionCount, setQuestionCount] = useState(() => Math.min(5, questionsByChapter.get(firstChapterId)?.length ?? 5));
  const [timed, setTimed] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(10);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">{cert.title}</h1>
        <p className="text-gray-500 dark:text-gray-400">
          {indexData.exam.totalQuestions} questions · {indexData.exam.totalPoints} points · {indexData.exam.durationMinutes} min · {indexData.exam.passPercent}% to pass
        </p>
      </div>

      {mode === null && (
        <div className="grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => setMode('full')}
            className="p-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-left transition"
          >
            <div className="text-xl font-bold mb-1">Full Exam</div>
            <div className="text-blue-100 text-sm">{indexData.exam.totalQuestions} questions · {indexData.exam.durationMinutes} min · timed</div>
          </button>
          <button
            onClick={() => setMode('section')}
            className="p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-left transition"
          >
            <div className="text-xl font-bold mb-1">Section Practice</div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Choose a chapter · custom count · optional timer</div>
          </button>
        </div>
      )}

      {mode === 'full' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Full Exam</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {indexData.exam.totalQuestions} questions drawn from all {indexData.chapters.length} chapters · {indexData.exam.durationMinutes} min countdown · auto-submits when time expires
          </p>
          <div className="space-y-1 text-sm">
            {indexData.chapters.map(ch => (
              <div key={ch.id} className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{ch.id}. {ch.title}</span>
                <span className="text-gray-400">{ch.examQuestions}q / {ch.points}pts</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onStartFullExam}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Start Exam
            </button>
            <button onClick={() => setMode(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Back
            </button>
          </div>
        </div>
      )}

      {mode === 'section' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Section Practice</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Chapter</label>
            <select
              value={selectedChapter}
              onChange={e => {
                const id = Number(e.target.value);
                setSelectedChapter(id);
                const newMax = questionsByChapter.get(id)?.length ?? 1;
                setQuestionCount(prev => Math.min(prev, newMax));
              }}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm"
            >
              {indexData.chapters.map(ch => (
                <option key={ch.id} value={ch.id}>Ch{ch.id}: {ch.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Number of questions (max {maxQuestions})
            </label>
            <input
              type="number"
              min={1}
              max={maxQuestions}
              value={questionCount}
              onChange={e => setQuestionCount(Math.min(maxQuestions, Math.max(1, Number(e.target.value))))}
              className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" id="timed" checked={timed} onChange={e => setTimed(e.target.checked)} />
            <label htmlFor="timed" className="text-sm">Enable timer</label>
            {timed && (
              <input
                type="number"
                min={1}
                max={120}
                value={timerMinutes}
                onChange={e => setTimerMinutes(Math.max(1, Number(e.target.value)))}
                className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-sm"
              />
            )}
            {timed && <span className="text-sm text-gray-500">min</span>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onStartSection(selectedChapter, questionCount, timed ? timerMinutes : null)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Start Practice
            </button>
            <button onClick={() => setMode(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              Back
            </button>
          </div>
        </div>
      )}

      {/* Weak chapters callout */}
      {mode === null && weakChapters.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-medium text-sm">
            ⚠ Weak areas detected
          </div>
          <div className="space-y-1">
            {weakChapters.map(w => (
              <div key={w.chapterId} className="flex items-center gap-3 text-sm">
                <span className="text-amber-600 dark:text-amber-400 w-6 flex-shrink-0">Ch{w.chapterId}</span>
                <div className="flex-1 bg-amber-100 dark:bg-amber-900/40 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-amber-400" style={{ width: `${Math.round(w.avgPercent)}%` }} />
                </div>
                <span className="text-amber-600 dark:text-amber-400 w-8 text-right">{Math.round(w.avgPercent)}%</span>
                <button
                  onClick={() => { setMode('section'); setSelectedChapter(w.chapterId); }}
                  className="text-xs px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded transition"
                >
                  Practice
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapter overview */}
      {mode === null && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Exam Blueprint</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {indexData.chapters.map(ch => (
              <div key={ch.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span><span className="font-medium text-gray-400 mr-2">Ch{ch.id}</span>{ch.title}</span>
                <span className="text-gray-400 whitespace-nowrap ml-4">{ch.examQuestions}q · {ch.points}pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
