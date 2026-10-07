import { useState } from 'react';
import type { IndexData } from '../types';
import type { CertStorage } from '../utils/storage';
import { getWeakChapters } from '../utils/exam';
import { TrendChart } from '../components/TrendChart';

interface Props {
  indexData: IndexData | null;
  passPercent: number;
  storage: CertStorage;
}

export function HistoryPage({ indexData, passPercent, storage }: Props) {
  const { getAttempts, clearAttempts, exportAttempts } = storage;
  const [attempts, setAttempts] = useState(() => getAttempts());

  function handleClear() {
    if (confirm('Clear all history? This cannot be undone.')) {
      clearAttempts();
      setAttempts([]);
    }
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500 dark:text-gray-400">
        <div className="text-4xl mb-3">📋</div>
        <p>No attempts yet. Take a full exam or section practice to see history.</p>
      </div>
    );
  }

  const weakChapters = indexData
    ? getWeakChapters(attempts, indexData.chapters, passPercent)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Attempt History</h1>
        <div className="flex gap-2">
          <button
            onClick={() => exportAttempts()}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            Export
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1.5 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <TrendChart attempts={attempts} passPercent={passPercent} />

      {weakChapters.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Weak Areas</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-amber-200 dark:border-amber-800 divide-y divide-gray-100 dark:divide-gray-700">
            {weakChapters.map(w => (
              <div key={w.chapterId} className="px-4 py-3 flex items-center gap-3">
                <span className="text-xs text-gray-400 w-6 flex-shrink-0">Ch{w.chapterId}</span>
                <div className="flex-1">
                  <div className="text-sm">{w.title}</div>
                  <div className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-amber-400"
                      style={{ width: `${Math.round(w.avgPercent)}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400 w-12 text-right flex-shrink-0">
                  {Math.round(w.avgPercent)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {attempts.map(a => {
          const pct = Math.round(a.percent);
          const date = new Date(a.date).toLocaleString();
          const label = a.mode === 'full' ? 'Full Exam' : `Ch${a.chapterId} Practice`;
          return (
            <div key={a.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${a.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                {pct}%
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${a.passed ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                    {a.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{date}</div>
                <div className="text-xs text-gray-400">{a.earned.toFixed(1)}/{a.available.toFixed(1)} pts</div>
              </div>
              {a.chapterBreakdown.length > 1 && (
                <div className="hidden sm:flex gap-1 flex-wrap max-w-xs">
                  {a.chapterBreakdown.map(b => {
                    const p = b.available > 0 ? Math.round((b.earned / b.available) * 100) : 0;
                    return (
                      <span key={b.chapterId} className={`text-xs px-1 rounded ${p >= passPercent ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        Ch{b.chapterId}:{p}%
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
