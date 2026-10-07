import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithUser } from '../test/renderWithUser';
import { ResultsScreen } from './ResultsScreen';
import { makeQuestion, makeAttempt, makeIndexData } from '../test/factories';
import type { AttemptAnswer } from '../types';

const indexData = makeIndexData({
  chapters: [{ id: 1, title: 'Test Chapter One', examQuestions: 2, points: 2 }],
});

const q1 = makeQuestion({ id: 'q1', chapter: 1, points: 1, correct: ['a'], explanation: 'Explanation for A' });
const q2 = makeQuestion({ id: 'q2', chapter: 1, points: 1, correct: ['b'], explanation: 'Explanation for B' });

describe('ResultsScreen', () => {
  it('shows rounded percent', () => {
    const result = makeAttempt({ percent: 66.7, passed: true });
    render(<ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('67%')).toBeTruthy();
  });

  it('shows PASS when passed', () => {
    const result = makeAttempt({ percent: 70, passed: true });
    render(<ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('PASS')).toBeTruthy();
  });

  it('shows FAIL when not passed', () => {
    const result = makeAttempt({ percent: 60, passed: false });
    render(<ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('FAIL')).toBeTruthy();
  });

  it('shows points and duration', () => {
    const result = makeAttempt({ earned: 2, available: 3, durationSeconds: 65, percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText(/2\.0 \/ 3\.0 points/)).toBeTruthy();
    expect(screen.getByText(/1m 5s/)).toBeTruthy();
  });

  it('renders chapter breakdown with chapter title and percent', () => {
    const result = makeAttempt({
      percent: 100,
      passed: true,
      chapterBreakdown: [{ chapterId: 1, earned: 2, available: 2 }],
    });
    render(<ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('Test Chapter One')).toBeTruthy();
    expect(screen.getAllByText('100%').length).toBeGreaterThanOrEqual(1);
  });

  it('marks correct answer with checkmark', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['a'] }];
    const result = makeAttempt({ percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText(/✓/)).toBeTruthy();
  });

  it('marks wrong answer with cross and reveals correct answer', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['b'] }];
    const result = makeAttempt({ percent: 0, passed: false });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText(/✗/)).toBeTruthy();
    expect(screen.getByText(/Correct:/)).toBeTruthy();
  });

  it('shows full option text, not just the letter, for the selected answer', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['a'] }];
    const result = makeAttempt({ percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('A. Option A')).toBeTruthy();
  });

  it('shows full option text for the revealed correct answer', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['b'] }];
    const result = makeAttempt({ percent: 0, passed: false });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('A. Option A')).toBeTruthy();
    expect(screen.getByText('B. Option B')).toBeTruthy();
  });

  it('does not reveal correct answer when the answer is right', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['a'] }];
    const result = makeAttempt({ percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.queryByText(/Correct:/)).toBeNull();
  });

  it('shows explanation text', () => {
    const answers: AttemptAnswer[] = [{ questionId: 'q1', selected: ['a'] }];
    const result = makeAttempt({ percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[q1]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('Explanation for A')).toBeTruthy();
  });

  it('shows (no answer) when question was skipped', () => {
    const result = makeAttempt({ percent: 0, passed: false });
    render(<ResultsScreen result={result} questions={[q1]} answers={[]} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText('(no answer)')).toBeTruthy();
  });

  it('Back to Home button calls onGoHome', async () => {
    const onGoHome = vi.fn();
    const result = makeAttempt({ percent: 100, passed: true });
    const { user } = renderWithUser(
      <ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={65} onGoHome={onGoHome} />
    );
    await user.click(screen.getByRole('button', { name: 'Back to Home' }));
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('renders all questions in review section', () => {
    const answers: AttemptAnswer[] = [
      { questionId: 'q1', selected: ['a'] },
      { questionId: 'q2', selected: ['b'] },
    ];
    const result = makeAttempt({ percent: 100, passed: true });
    render(<ResultsScreen result={result} questions={[q1, q2]} answers={answers} indexData={indexData} passPercent={65} onGoHome={vi.fn()} />);
    expect(screen.getByText(/Q1/)).toBeTruthy();
    expect(screen.getByText(/Q2/)).toBeTruthy();
  });

  it('chapter breakdown bar colour follows passPercent, not a fixed 65', () => {
    const result = makeAttempt({
      percent: 70,
      passed: true,
      chapterBreakdown: [{ chapterId: 1, earned: 7, available: 10 }],
    });
    const barClass = (passPercent: number) => {
      const { container, unmount } = render(
        <ResultsScreen result={result} questions={[]} answers={[]} indexData={indexData} passPercent={passPercent} onGoHome={vi.fn()} />
      );
      const bar = container.querySelector('[style*="width: 70%"]') as HTMLElement;
      const cls = bar.className;
      unmount();
      return cls;
    };
    expect(barClass(65)).toContain('bg-green-500');
    expect(barClass(80)).toContain('bg-red-400');
  });
});
