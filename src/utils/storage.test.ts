import { describe, it, expect, beforeEach } from 'vitest';
import { certStorage, getSettings, saveSettings } from './storage';
import { makeAttempt } from '../test/factories';
import type { InProgressAttempt, AppSettings } from '../types';

const {
  getAttempts, saveAttempt, clearAttempts,
  getInProgress, saveInProgress, clearInProgress,
} = certStorage('tae');

beforeEach(() => {
  localStorage.clear();
});

describe('attempts', () => {
  it('getAttempts returns [] when no data', () => {
    expect(getAttempts()).toEqual([]);
  });

  it('saveAttempt prepends newest first', () => {
    const a1 = makeAttempt({ id: 'a1' });
    const a2 = makeAttempt({ id: 'a2' });
    saveAttempt(a1);
    saveAttempt(a2);
    const all = getAttempts();
    expect(all[0].id).toBe('a2');
    expect(all[1].id).toBe('a1');
  });

  it('clearAttempts empties the list', () => {
    saveAttempt(makeAttempt());
    clearAttempts();
    expect(getAttempts()).toEqual([]);
  });

  it('getAttempts returns [] on corrupt JSON', () => {
    localStorage.setItem('tae_attempts', 'not-valid-json');
    expect(getAttempts()).toEqual([]);
  });

  it('round-trip: saved attempt is retrieved intact', () => {
    const a = makeAttempt({ id: 'roundtrip', percent: 78.5, passed: true });
    saveAttempt(a);
    expect(getAttempts()[0]).toEqual(a);
  });
});

describe('inProgress', () => {
  const state: InProgressAttempt = {
    mode: 'full',
    questionIds: ['q1', 'q2'],
    answers: [{ questionId: 'q1', selected: ['a'] }],
    flagged: ['q2'],
    remainingSeconds: 240,
    startedAt: '2024-01-01T00:00:00.000Z',
  };

  it('getInProgress returns null when no data', () => {
    expect(getInProgress()).toBeNull();
  });

  it('round-trip save/get', () => {
    saveInProgress(state);
    expect(getInProgress()).toEqual(state);
  });

  it('clearInProgress removes data', () => {
    saveInProgress(state);
    clearInProgress();
    expect(getInProgress()).toBeNull();
  });

  it('getInProgress returns null on corrupt JSON', () => {
    localStorage.setItem('tae_in_progress', '{bad json');
    expect(getInProgress()).toBeNull();
  });
});

describe('settings', () => {
  it('getSettings returns defaults when no data', () => {
    const s = getSettings();
    expect(s.passPercent).toBe(65);
    expect(s.randomizeQuestions).toBe(true);
    expect(s.randomizeOptions).toBe(true);
    expect(s.theme).toBe('light');
  });

  it('round-trip save/get', () => {
    const settings: AppSettings = {
      passPercent: 70,
      randomizeQuestions: false,
      randomizeOptions: false,
      theme: 'dark',
    };
    saveSettings(settings);
    expect(getSettings()).toEqual(settings);
  });

  it('merges saved partial data with defaults', () => {
    localStorage.setItem('tae_settings', JSON.stringify({ passPercent: 75 }));
    const s = getSettings();
    expect(s.passPercent).toBe(75);
    expect(s.randomizeQuestions).toBe(true); // default preserved
    expect(s.theme).toBe('light');            // default preserved
  });

  it('getSettings returns defaults on corrupt JSON', () => {
    localStorage.setItem('tae_settings', '///bad');
    const s = getSettings();
    expect(s.passPercent).toBe(65);
  });
});

describe('certStorage namespacing', () => {
  it('uses the legacy tae_* keys for prefix "tae"', () => {
    certStorage('tae').saveAttempt(makeAttempt({ id: 'x' }));
    expect(localStorage.getItem('tae_attempts')).not.toBeNull();
  });

  it('different prefixes do not see each other attempts', () => {
    const a = certStorage('tae');
    const b = certStorage('genai');
    a.saveAttempt(makeAttempt({ id: 'tae-1' }));
    expect(b.getAttempts()).toEqual([]);
    b.saveAttempt(makeAttempt({ id: 'genai-1' }));
    expect(a.getAttempts().map(x => x.id)).toEqual(['tae-1']);
    expect(b.getAttempts().map(x => x.id)).toEqual(['genai-1']);
  });

  it('different prefixes do not see the other in-progress data', () => {
    const state: InProgressAttempt = {
      mode: 'full', questionIds: ['q1'], answers: [], flagged: [],
      remainingSeconds: 10, startedAt: '2024-01-01T00:00:00.000Z',
    };
    certStorage('tae').saveInProgress(state);
    expect(certStorage('genai').getInProgress()).toBeNull();
    expect(certStorage('tae').getInProgress()).toEqual(state);
  });
});
