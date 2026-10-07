import type { Attempt, InProgressAttempt, AppSettings } from '../types';

// Settings are global across certifications and keep the legacy key.
const KEYS = {
  settings: 'tae_settings',
} as const;

const DEFAULT_SETTINGS: AppSettings = {
  passPercent: 65,
  randomizeQuestions: true,
  randomizeOptions: true,
  theme: 'light',
};

export function certStorage(prefix: string) {
  const attemptsKey = `${prefix}_attempts`;
  const inProgressKey = `${prefix}_in_progress`;

  function getAttempts(): Attempt[] {
    try {
      return JSON.parse(localStorage.getItem(attemptsKey) ?? '[]');
    } catch { return []; }
  }

  function saveAttempt(attempt: Attempt): void {
    const all = getAttempts();
    localStorage.setItem(attemptsKey, JSON.stringify([attempt, ...all]));
  }

  function clearAttempts(): void {
    localStorage.removeItem(attemptsKey);
  }

  function exportAttempts(): void {
    const data = JSON.stringify(getAttempts(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${prefix}-history.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getInProgress(): InProgressAttempt | null {
    try {
      const raw = localStorage.getItem(inProgressKey);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function saveInProgress(state: InProgressAttempt): void {
    localStorage.setItem(inProgressKey, JSON.stringify(state));
  }

  function clearInProgress(): void {
    localStorage.removeItem(inProgressKey);
  }

  return {
    getAttempts, saveAttempt, clearAttempts, exportAttempts,
    getInProgress, saveInProgress, clearInProgress,
  };
}

export type CertStorage = ReturnType<typeof certStorage>;

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(KEYS.settings);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch { return DEFAULT_SETTINGS; }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(KEYS.settings, JSON.stringify(settings));
}
