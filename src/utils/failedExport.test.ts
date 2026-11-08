import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  buildAttemptFailedExport, buildHistoryFailedExport, downloadJson, failedExportFilename,
} from './failedExport';
import { computeResult } from './exam';
import { makeQuestion, makeAttempt } from '../test/factories';

const cert = { id: 'istqb-tae', title: 'TAE' };
const q1 = makeQuestion({ id: 'q1', chapter: 1, correct: ['a'] });
const q2 = makeQuestion({ id: 'q2', chapter: 2, correct: ['b'] });
const q3 = makeQuestion({ id: 'q3', chapter: 2, correct: ['c'] });

afterEach(() => vi.restoreAllMocks());

describe('computeResult failed', () => {
  it('records wrong and skipped questions only', () => {
    const r = computeResult([q1, q2, q3], [
      { questionId: 'q1', selected: ['a'] },
      { questionId: 'q2', selected: ['a'] },
    ], 'full', undefined, 0, 65);
    expect(r.failed).toEqual([
      { questionId: 'q2', selected: ['a'] },
      { questionId: 'q3', selected: [] },
    ]);
  });
});

describe('buildAttemptFailedExport', () => {
  const result = makeAttempt({ id: 'att1', percent: 33.33 });
  const answers = [
    { questionId: 'q1', selected: ['a'] },
    { questionId: 'q2', selected: ['a'] },
  ];
  const data = buildAttemptFailedExport(cert, result, [q1, q2, q3], answers, 'T');

  it('includes only failed questions', () => {
    expect(data.failedQuestions.map(f => f.id)).toEqual(['q2', 'q3']);
    expect(data.failedQuestionCount).toBe(2);
  });

  it('resolves user and correct answers to text', () => {
    const f = data.failedQuestions[0];
    expect(f.userAnswer).toEqual([{ id: 'a', text: 'Option A' }]);
    expect(f.correctAnswers).toEqual([{ id: 'b', text: 'Option B' }]);
    expect(f.unanswered).toBe(false);
  });

  it('flags skipped questions as unanswered', () => {
    expect(data.failedQuestions[1].unanswered).toBe(true);
    expect(data.failedQuestions[1].userAnswer).toEqual([]);
  });

  it('adds metadata', () => {
    expect(data.format).toBe('exam-failed-questions');
    expect(data.certification).toEqual(cert);
    expect(data.attempt.id).toBe('att1');
    expect(data.attempt.percent).toBe(33.3);
    expect(data.exportedAt).toBe('T');
  });
});

describe('buildHistoryFailedExport', () => {
  const byId = new Map([q1, q2, q3].map(q => [q.id, q]));
  const attempts = [
    makeAttempt({ id: 'new', date: '2024-02-01T00:00:00Z', failed: [{ questionId: 'q2', selected: [] }, { questionId: 'gone', selected: ['a'] }] }),
    makeAttempt({ id: 'old', date: '2024-01-01T00:00:00Z', failed: [{ questionId: 'q2', selected: ['a'] }, { questionId: 'q1', selected: ['b'] }] }),
    makeAttempt({ id: 'legacy' }),
  ];
  const data = buildHistoryFailedExport(cert, attempts, byId, 'T');

  it('aggregates by question, most failed first', () => {
    expect(data.questions.map(q => q.id)).toEqual(['q2', 'q1']);
    expect(data.questions[0].timesFailed).toBe(2);
    expect(data.questions[0].lastFailedAt).toBe('2024-02-01T00:00:00Z');
    expect(data.questions[0].misses.map(m => m.attemptId)).toEqual(['new', 'old']);
  });

  it('counts legacy attempts and unresolved ids', () => {
    expect(data.attemptsConsidered).toBe(3);
    expect(data.attemptsWithoutDetail).toBe(1);
    expect(data.unresolvedQuestionIds).toEqual(['gone']);
  });

  it('sums failures by chapter', () => {
    expect(data.failuresByChapter).toEqual([
      { chapterId: 2, failures: 2 },
      { chapterId: 1, failures: 1 },
    ]);
  });
});

describe('downloadJson / filename', () => {
  it('filename uses prefix, kind and date', () => {
    expect(failedExportFilename('istqb-tae', 'history', new Date('2024-03-05T10:00:00Z')))
      .toBe('istqb-tae-failed-history-2024-03-05.json');
  });

  it('triggers an anchor download with given filename and revokes the URL later', () => {
    vi.useFakeTimers();
    URL.createObjectURL = vi.fn(() => 'blob:x');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    downloadJson('f.json', { a: 1 });
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.advanceTimersByTime(10_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:x');
    vi.useRealTimers();
  });
});
