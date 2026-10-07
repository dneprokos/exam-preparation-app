import type { IndexData } from '../types';
import type { ExamState } from '../hooks/useExam';
import { QuestionCard } from '../components/QuestionCard';
import { TimerDisplay } from '../components/TimerDisplay';
import { NavGrid } from '../components/NavGrid';
import { ReviewScreen } from '../components/ReviewScreen';
import { ResultsScreen } from '../components/ResultsScreen';

interface Props {
  examState: ExamState;
  indexData: IndexData;
  passPercent: number;
  onAnswer: (questionId: string, selected: string[]) => void;
  onToggleFlag: (questionId: string) => void;
  onGoToIndex: (i: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onEnterReview: () => void;
  onBackToQuestion: (index?: number) => void;
  onSubmit: () => void;
  onExit: () => void;
  onGoHome: () => void;
}

export function ExamPage({
  examState, indexData, passPercent, onAnswer, onToggleFlag, onGoToIndex,
  onNext, onPrev, onEnterReview, onBackToQuestion, onSubmit, onExit, onGoHome,
}: Props) {
  if (examState.view === 'results' && examState.result) {
    return (
      <ResultsScreen
        result={examState.result}
        questions={examState.questions}
        answers={examState.answers}
        indexData={indexData}
        passPercent={passPercent}
        onGoHome={onGoHome}
      />
    );
  }

  if (examState.view === 'review') {
    return (
      <ReviewScreen
        examState={examState}
        onGoToQuestion={(i) => { onBackToQuestion(i); }}
        onSubmit={onSubmit}
        onBack={() => onBackToQuestion()}
      />
    );
  }

  const question = examState.questions[examState.currentIndex];
  const currentAnswer = examState.answers.find(a => a.questionId === question.id)?.selected ?? [];
  const isFlagged = examState.flagged.includes(question.id);
  const answeredCount = examState.answers.filter(a => a.selected.length > 0).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Question {examState.currentIndex + 1} of {examState.questions.length}
          {examState.mode === 'section' && ` · Ch${examState.chapterId}`}
        </div>
        <div className="flex items-center gap-4">
          {examState.remainingSeconds !== null && (
            <TimerDisplay seconds={examState.remainingSeconds} />
          )}
          <button onClick={onExit} className="text-xs text-gray-400 hover:text-red-500">Exit</button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-blue-500 h-1.5 rounded-full transition-all"
          style={{ width: `${((examState.currentIndex + 1) / examState.questions.length) * 100}%` }}
        />
      </div>

      <QuestionCard
        question={question}
        selected={currentAnswer}
        isFlagged={isFlagged}
        onAnswer={(selected) => onAnswer(question.id, selected)}
        onToggleFlag={() => onToggleFlag(question.id)}
      />

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={examState.currentIndex === 0}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          &larr; Previous
        </button>
        <button
          onClick={onNext}
          disabled={examState.currentIndex === examState.questions.length - 1}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          Next &rarr;
        </button>
      </div>

      {/* Question grid nav */}
      <NavGrid
        questions={examState.questions}
        answers={examState.answers}
        flagged={examState.flagged}
        currentIndex={examState.currentIndex}
        onGoTo={onGoToIndex}
      />

      {/* Review/Submit */}
      <div className="text-center pt-2">
        <span className="text-sm text-gray-500 dark:text-gray-400 mr-4">
          {answeredCount}/{examState.questions.length} answered
        </span>
        <button
          onClick={onEnterReview}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
        >
          Review &amp; Submit
        </button>
      </div>
    </div>
  );
}
