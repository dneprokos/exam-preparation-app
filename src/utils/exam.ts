import type { Question, ChapterMeta, Attempt, ChapterScore, AttemptAnswer } from '../types';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectQuestions(questions: Question[], count: number): Question[] {
  if (questions.length <= count) return [...questions];
  return shuffle(questions).slice(0, count);
}

export function scoreQuestion(question: Question, selected: string[]): number {
  const correct = [...question.correct].sort().join(',');
  const given = [...selected].sort().join(',');
  return correct === given ? question.points : 0;
}

export function getOptionText(question: Question, optionId: string): string {
  return question.options.find(o => o.id === optionId)?.text ?? optionId;
}

export function computeResult(
  questions: Question[],
  answers: AttemptAnswer[],
  mode: 'full' | 'section',
  chapterId: number | undefined,
  durationSeconds: number,
  passPercent: number
): Attempt {
  const answerMap = new Map(answers.map(a => [a.questionId, a.selected]));

  const chapterMap = new Map<number, ChapterScore>();
  let earned = 0;
  let available = 0;
  const failed: AttemptAnswer[] = [];

  for (const q of questions) {
    const selected = answerMap.get(q.id) ?? [];
    const pts = scoreQuestion(q, selected);
    earned += pts;
    available += q.points;
    if (pts < q.points) failed.push({ questionId: q.id, selected });

    const existing = chapterMap.get(q.chapter) ?? { chapterId: q.chapter, earned: 0, available: 0 };
    chapterMap.set(q.chapter, {
      chapterId: q.chapter,
      earned: existing.earned + pts,
      available: existing.available + q.points,
    });
  }

  const percent = available > 0 ? (earned / available) * 100 : 0;

  return {
    id: crypto.randomUUID(),
    mode,
    chapterId,
    date: new Date().toISOString(),
    durationSeconds,
    earned,
    available,
    percent,
    passed: percent >= passPercent,
    chapterBreakdown: [...chapterMap.values()],
    failed,
  };
}

export function getWeakChapters(
  attempts: Attempt[],
  chapters: ChapterMeta[],
  passPercent: number,
  lastN = 5
): Array<{ chapterId: number; title: string; avgPercent: number }> {
  const result: Array<{ chapterId: number; title: string; avgPercent: number }> = [];

  for (const ch of chapters) {
    const relevant = attempts
      .filter(a => a.chapterBreakdown.some(b => b.chapterId === ch.id))
      .slice(0, lastN);
    if (relevant.length === 0) continue;

    const sum = relevant.reduce((acc, a) => {
      const b = a.chapterBreakdown.find(x => x.chapterId === ch.id);
      return acc + (b ? (b.earned / b.available) * 100 : 0);
    }, 0);

    const avg = sum / relevant.length;
    if (avg < passPercent) {
      result.push({ chapterId: ch.id, title: ch.title, avgPercent: avg });
    }
  }

  return result.sort((a, b) => a.avgPercent - b.avgPercent);
}
