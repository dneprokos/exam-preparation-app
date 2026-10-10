export interface QuestionOption {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  chapter: number;
  section: string;
  type: 'single' | 'multiple';
  points: number;
  text: string;
  options: QuestionOption[];
  correct: string[];
  selectCount?: number;
  image?: string | null;
  explanation: string;
  reference: string;
}

export interface ChapterMeta {
  id: number;
  title: string;
  examQuestions: number;
  points: number;       // nominal (expected) points for the chapter's exam questions
  mixedPoints?: boolean; // chapter pool mixes 1- and 2-point (K3) questions
}

export interface ExamConfig {
  totalQuestions: number;
  totalPoints: number;
  durationMinutes: number;
  passPercent: number;
}

export interface IndexData {
  chapters: ChapterMeta[];
  exam: ExamConfig;
}

export interface AttemptAnswer {
  questionId: string;
  selected: string[];
}

export interface ChapterScore {
  chapterId: number;
  earned: number;
  available: number;
}

export interface Attempt {
  id: string;
  mode: 'full' | 'section';
  chapterId?: number;
  date: string;
  durationSeconds: number;
  earned: number;
  available: number;
  percent: number;
  passed: boolean;
  chapterBreakdown: ChapterScore[];
}

export interface InProgressAttempt {
  mode: 'full' | 'section';
  chapterId?: number;
  questionIds: string[];
  answers: AttemptAnswer[];
  flagged: string[];
  remainingSeconds: number | null;
  startedAt: string;
}

export interface AppSettings {
  passPercent: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  theme: 'light' | 'dark';
}
