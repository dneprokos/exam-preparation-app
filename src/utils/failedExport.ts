import type { Attempt, AttemptAnswer, Question } from '../types';
import { scoreQuestion } from './exam';

export interface ExportCertification {
  id: string;
  title: string;
}

interface AnswerOption {
  id: string;
  text: string;
}

function resolveOptions(q: Question, ids: string[]): AnswerOption[] {
  return ids.map(id => ({ id, text: q.options.find(o => o.id === id)?.text ?? id }));
}

function questionFields(q: Question) {
  return {
    id: q.id,
    chapter: q.chapter,
    section: q.section,
    type: q.type,
    points: q.points,
    text: q.text,
    options: q.options,
    correctAnswers: resolveOptions(q, q.correct),
    explanation: q.explanation,
    reference: q.reference,
    ...(q.image ? { image: q.image } : {}),
  };
}

function attemptSummary(a: Attempt) {
  return {
    id: a.id,
    date: a.date,
    mode: a.mode,
    chapterId: a.chapterId ?? null,
    earned: a.earned,
    available: a.available,
    percent: Math.round(a.percent * 10) / 10,
    passed: a.passed,
    durationSeconds: a.durationSeconds,
  };
}

/** Failed questions of one just-finished attempt (results screen). */
export function buildAttemptFailedExport(
  cert: ExportCertification,
  result: Attempt,
  questions: Question[],
  answers: AttemptAnswer[],
  exportedAt: string = new Date().toISOString()
) {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selected]));
  const failedQuestions = questions
    .map(q => ({ q, selected: answerMap.get(q.id) ?? [] }))
    .filter(({ q, selected }) => scoreQuestion(q, selected) < q.points)
    .map(({ q, selected }) => ({
      ...questionFields(q),
      userAnswer: resolveOptions(q, selected),
      unanswered: selected.length === 0,
    }));

  return {
    format: 'exam-failed-questions',
    version: 1,
    exportedAt,
    certification: cert,
    attempt: attemptSummary(result),
    failedQuestionCount: failedQuestions.length,
    failedQuestions,
  };
}

/** Failed questions aggregated across all stored attempts (history page). */
export function buildHistoryFailedExport(
  cert: ExportCertification,
  attempts: Attempt[],
  questionsById: Map<string, Question>,
  exportedAt: string = new Date().toISOString()
) {
  interface Miss {
    attemptId: string;
    date: string;
    userAnswer: AnswerOption[];
    unanswered: boolean;
  }
  const byQuestion = new Map<string, Miss[]>();
  let attemptsWithoutDetail = 0;
  const unresolved = new Set<string>();

  for (const a of attempts) {
    if (!a.failed) { attemptsWithoutDetail++; continue; }
    for (const f of a.failed) {
      const q = questionsById.get(f.questionId);
      if (!q) { unresolved.add(f.questionId); continue; }
      const list = byQuestion.get(q.id) ?? [];
      list.push({
        attemptId: a.id,
        date: a.date,
        userAnswer: resolveOptions(q, f.selected),
        unanswered: f.selected.length === 0,
      });
      byQuestion.set(q.id, list);
    }
  }

  const questions = [...byQuestion.entries()]
    .map(([id, misses]) => ({
      ...questionFields(questionsById.get(id)!),
      timesFailed: misses.length,
      lastFailedAt: misses.reduce((m, x) => (x.date > m ? x.date : m), ''),
      misses,
    }))
    .sort((a, b) => b.timesFailed - a.timesFailed || a.chapter - b.chapter);

  const chapterCounts = new Map<number, number>();
  for (const q of questions) {
    chapterCounts.set(q.chapter, (chapterCounts.get(q.chapter) ?? 0) + q.timesFailed);
  }
  const failuresByChapter = [...chapterCounts.entries()]
    .map(([chapterId, failures]) => ({ chapterId, failures }))
    .sort((a, b) => b.failures - a.failures);

  return {
    format: 'exam-failed-history',
    version: 1,
    exportedAt,
    certification: cert,
    attemptsConsidered: attempts.length,
    attemptsWithoutDetail,
    unresolvedQuestionIds: [...unresolved],
    uniqueFailedQuestions: questions.length,
    failuresByChapter,
    questions,
  };
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function failedExportFilename(prefix: string, kind: 'attempt' | 'history', date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10);
  return `${prefix}-failed-${kind}-${stamp}.json`;
}
