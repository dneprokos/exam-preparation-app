import type { Attempt, Question, AttemptAnswer, IndexData } from '../types';
import { scoreQuestion, getOptionText } from '../utils/exam';
import { QuestionText } from './QuestionText';

interface Props {
  result: Attempt;
  questions: Question[];
  answers: AttemptAnswer[];
  indexData: IndexData;
  passPercent: number;
  onGoHome: () => void;
}

export function ResultsScreen({ result, questions, answers, indexData, passPercent, onGoHome }: Props) {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selected]));
  const pct = Math.round(result.percent);
  const mins = Math.floor(result.durationSeconds / 60);
  const secs = result.durationSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Overall result */}
      <div className={`rounded-xl p-6 text-center ${result.passed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
        <div className="text-5xl font-bold mb-2">{pct}%</div>
        <div className={`text-xl font-semibold mb-1 ${result.passed ? 'text-green-600' : 'text-red-500'}`}>
          {result.passed ? 'PASS' : 'FAIL'}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {result.earned.toFixed(1)} / {result.available.toFixed(1)} points &middot; {mins}m {secs}s
        </div>
      </div>

      {/* Chapter breakdown */}
      {result.chapterBreakdown.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Chapter Breakdown</h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
            {result.chapterBreakdown.map(b => {
              const ch = indexData.chapters.find(c => c.id === b.chapterId);
              const bPct = b.available > 0 ? Math.round((b.earned / b.available) * 100) : 0;
              return (
                <div key={b.chapterId} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-gray-400 w-6">Ch{b.chapterId}</span>
                  <div className="flex-1">
                    <div className="text-sm">{ch?.title ?? `Chapter ${b.chapterId}`}</div>
                    <div className="mt-1 w-full bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${bPct >= passPercent ? 'bg-green-500' : 'bg-red-400'}`}
                        style={{ width: `${bPct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{bPct}%</span>
                  <span className="text-xs text-gray-400">{b.earned.toFixed(1)}/{b.available.toFixed(1)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Per-question review */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Question Review</h3>
        <div className="space-y-3">
          {questions.map((q, i) => {
            const selected = answerMap.get(q.id) ?? [];
            const earned = scoreQuestion(q, selected);
            const correct = earned === q.points;
            return (
              <div key={q.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 space-y-2 ${correct ? 'border-green-200 dark:border-green-800' : 'border-red-200 dark:border-red-800'}`}>
                <div className="flex items-start gap-2">
                  <span className={`text-sm font-bold ${correct ? 'text-green-600' : 'text-red-500'}`}>
                    {correct ? '✓' : '✗'} Q{i + 1}
                  </span>
                  <div className="flex-1"><QuestionText text={q.text} className="text-sm" /></div>
                  <span className="text-xs text-gray-400">{earned.toFixed(1)}/{q.points.toFixed(1)}pts</span>
                </div>
                <div className="text-xs space-y-1 pl-6">
                  <div>
                    <span className="text-gray-500">Your answer: </span>
                    <span className={correct ? 'text-green-600' : 'text-red-500'}>
                      {selected.length > 0
                        ? selected.map(s => `${s.toUpperCase()}. ${getOptionText(q, s)}`).join(', ')
                        : '(no answer)'}
                    </span>
                  </div>
                  {!correct && (
                    <div>
                      <span className="text-gray-500">Correct: </span>
                      <span className="text-green-600">
                        {q.correct.map(s => `${s.toUpperCase()}. ${getOptionText(q, s)}`).join(', ')}
                      </span>
                    </div>
                  )}
                  {q.explanation && <div className="text-gray-500 italic">{q.explanation}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={onGoHome}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
