import { useState, useEffect, useCallback, useRef } from 'react';
import type { Question, AttemptAnswer, Attempt, IndexData, AppSettings } from '../types';
import { shuffle, selectQuestions, computeResult } from '../utils/exam';
import type { CertStorage } from '../utils/storage';

export type ExamView = 'question' | 'review' | 'results';

export interface ExamState {
  mode: 'full' | 'section';
  chapterId?: number;
  questions: Question[];
  currentIndex: number;
  answers: AttemptAnswer[];
  flagged: string[];
  remainingSeconds: number | null;
  view: ExamView;
  result: Attempt | null;
}

export function useExam(
  indexData: IndexData | null,
  questionsByChapter: Map<number, Question[]>,
  settings: AppSettings,
  storage: CertStorage
) {
  const { getInProgress, saveInProgress, clearInProgress, saveAttempt } = storage;
  const [examState, setExamState] = useState<ExamState | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Stop timer helper
  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start countdown timer
  const startTimer = useCallback((initialSeconds: number) => {
    stopTimer();
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setExamState(prev => {
        if (!prev || prev.remainingSeconds === null) return prev;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const remaining = Math.max(0, initialSeconds - elapsed);
        const updated = { ...prev, remainingSeconds: remaining };
        saveInProgress({
          mode: prev.mode,
          chapterId: prev.chapterId,
          questionIds: prev.questions.map(q => q.id),
          answers: prev.answers,
          flagged: prev.flagged,
          remainingSeconds: remaining,
          startedAt: new Date().toISOString(),
        });
        if (remaining === 0) {
          stopTimer();
          // auto-submit: move to results view
          const elapsed2 = indexData
            ? (prev.mode === 'full' ? indexData.exam.durationMinutes * 60 : 0)
            : 0;
          const result = computeResult(
            prev.questions,
            prev.answers,
            prev.mode,
            prev.chapterId,
            elapsed2,
            settings.passPercent
          );
          saveAttempt(result);
          clearInProgress();
          return { ...updated, view: 'results', result };
        }
        return updated;
      });
    }, 1000);
  }, [stopTimer, indexData, settings.passPercent, saveInProgress, saveAttempt, clearInProgress]);

  // Cleanup timer on unmount
  useEffect(() => () => stopTimer(), [stopTimer]);

  const buildQuestions = useCallback((
    mode: 'full' | 'section',
    chapterId?: number,
    sectionCount?: number
  ): Question[] => {
    if (!indexData) return [];
    if (mode === 'full') {
      const all: Question[] = [];
      for (const ch of indexData.chapters) {
        const pool = questionsByChapter.get(ch.id) ?? [];
        const selected = selectQuestions(pool, ch.examQuestions);
        all.push(...(settings.randomizeOptions ? selected.map(q => ({
          ...q,
          options: shuffle(q.options),
        })) : selected));
      }
      return settings.randomizeQuestions ? shuffle(all) : all;
    } else {
      const pool = questionsByChapter.get(chapterId!) ?? [];
      const count = sectionCount ?? pool.length;
      const selected = selectQuestions(pool, count);
      return settings.randomizeOptions
        ? selected.map(q => ({ ...q, options: shuffle(q.options) }))
        : selected;
    }
  }, [indexData, questionsByChapter, settings]);

  const startFullExam = useCallback(() => {
    if (!indexData) return;
    stopTimer();
    const questions = buildQuestions('full');
    const durationSeconds = indexData.exam.durationMinutes * 60;
    const state: ExamState = {
      mode: 'full',
      questions,
      currentIndex: 0,
      answers: [],
      flagged: [],
      remainingSeconds: durationSeconds,
      view: 'question',
      result: null,
    };
    setExamState(state);
    saveInProgress({
      mode: 'full',
      questionIds: questions.map(q => q.id),
      answers: [],
      flagged: [],
      remainingSeconds: durationSeconds,
      startedAt: new Date().toISOString(),
    });
    startTimeRef.current = Date.now();
    startTimer(durationSeconds);
  }, [indexData, buildQuestions, stopTimer, startTimer, saveInProgress]);

  const startSectionPractice = useCallback((
    chapterId: number,
    count: number,
    timedMinutes: number | null
  ) => {
    stopTimer();
    const questions = buildQuestions('section', chapterId, count);
    const remainingSeconds = timedMinutes !== null ? timedMinutes * 60 : null;
    const state: ExamState = {
      mode: 'section',
      chapterId,
      questions,
      currentIndex: 0,
      answers: [],
      flagged: [],
      remainingSeconds,
      view: 'question',
      result: null,
    };
    setExamState(state);
    saveInProgress({
      mode: 'section',
      chapterId,
      questionIds: questions.map(q => q.id),
      answers: [],
      flagged: [],
      remainingSeconds,
      startedAt: new Date().toISOString(),
    });
    if (remainingSeconds !== null) {
      startTimeRef.current = Date.now();
      startTimer(remainingSeconds);
    }
  }, [buildQuestions, stopTimer, startTimer, saveInProgress]);

  const answerQuestion = useCallback((questionId: string, selected: string[]) => {
    setExamState(prev => {
      if (!prev) return prev;
      const existing = prev.answers.findIndex(a => a.questionId === questionId);
      const answers = existing >= 0
        ? prev.answers.map((a, i) => i === existing ? { ...a, selected } : a)
        : [...prev.answers, { questionId, selected }];
      const updated = { ...prev, answers };
      saveInProgress({
        mode: prev.mode,
        chapterId: prev.chapterId,
        questionIds: prev.questions.map(q => q.id),
        answers,
        flagged: prev.flagged,
        remainingSeconds: prev.remainingSeconds,
        startedAt: new Date().toISOString(),
      });
      return updated;
    });
  }, [saveInProgress]);

  const toggleFlag = useCallback((questionId: string) => {
    setExamState(prev => {
      if (!prev) return prev;
      const flagged = prev.flagged.includes(questionId)
        ? prev.flagged.filter(id => id !== questionId)
        : [...prev.flagged, questionId];
      const updated = { ...prev, flagged };
      saveInProgress({
        mode: prev.mode,
        chapterId: prev.chapterId,
        questionIds: prev.questions.map(q => q.id),
        answers: prev.answers,
        flagged,
        remainingSeconds: prev.remainingSeconds,
        startedAt: new Date().toISOString(),
      });
      return updated;
    });
  }, [saveInProgress]);

  const goToIndex = useCallback((i: number) => {
    setExamState(prev => prev ? { ...prev, currentIndex: i } : prev);
  }, []);

  const goNext = useCallback(() => {
    setExamState(prev => {
      if (!prev) return prev;
      return { ...prev, currentIndex: Math.min(prev.currentIndex + 1, prev.questions.length - 1) };
    });
  }, []);

  const goPrev = useCallback(() => {
    setExamState(prev => {
      if (!prev) return prev;
      return { ...prev, currentIndex: Math.max(prev.currentIndex - 1, 0) };
    });
  }, []);

  const enterReview = useCallback(() => {
    setExamState(prev => prev ? { ...prev, view: 'review' } : prev);
  }, []);

  const backToQuestion = useCallback((index?: number) => {
    setExamState(prev => {
      if (!prev) return prev;
      return { ...prev, view: 'question', currentIndex: index ?? prev.currentIndex };
    });
  }, []);

  const submitExam = useCallback(() => {
    setExamState(prev => {
      if (!prev) return prev;
      stopTimer();
      const totalSeconds = prev.mode === 'full' && indexData
        ? indexData.exam.durationMinutes * 60
        : prev.questions.length * 90;
      const used = prev.remainingSeconds !== null
        ? totalSeconds - prev.remainingSeconds
        : totalSeconds;
      const result = computeResult(
        prev.questions,
        prev.answers,
        prev.mode,
        prev.chapterId,
        Math.max(0, used),
        settings.passPercent
      );
      saveAttempt(result);
      clearInProgress();
      return { ...prev, view: 'results', result };
    });
  }, [stopTimer, indexData, settings.passPercent, saveAttempt, clearInProgress]);

  const exitExam = useCallback(() => {
    stopTimer();
    clearInProgress();
    setExamState(null);
  }, [stopTimer, clearInProgress]);

  // Resume in-progress on mount
  useEffect(() => {
    if (!indexData || questionsByChapter.size === 0 || examState !== null) return;
    const saved = getInProgress();
    if (!saved) return;
    const allQuestions = [...questionsByChapter.values()].flat();
    const questionMap = new Map(allQuestions.map(q => [q.id, q]));
    const questions = saved.questionIds.map(id => questionMap.get(id)).filter(Boolean) as Question[];
    if (questions.length === 0) { clearInProgress(); return; }
    const state: ExamState = {
      mode: saved.mode,
      chapterId: saved.chapterId,
      questions,
      currentIndex: 0,
      answers: saved.answers,
      flagged: saved.flagged,
      remainingSeconds: saved.remainingSeconds,
      view: 'question',
      result: null,
    };
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExamState(state);
    if (saved.remainingSeconds !== null && saved.remainingSeconds > 0) {
      startTimeRef.current = Date.now();
      startTimer(saved.remainingSeconds);
    }
  }, [indexData, questionsByChapter, examState, startTimer, getInProgress, clearInProgress]);

  return {
    examState,
    startFullExam,
    startSectionPractice,
    answerQuestion,
    toggleFlag,
    goToIndex,
    goNext,
    goPrev,
    enterReview,
    backToQuestion,
    submitExam,
    exitExam,
  };
}
