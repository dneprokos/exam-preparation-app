import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithUser } from './test/renderWithUser';
import App from './App';
import { makeIndexData, makeChapterMeta, makeQuestion, makeAttempt } from './test/factories';

const index = makeIndexData({
  chapters: [makeChapterMeta({ id: 1, title: 'Intro Chapter', examQuestions: 2, points: 2 })],
});
const questions = [
  makeQuestion({ id: 'ch1-q001', chapter: 1, text: 'First saved question' }),
  makeQuestion({ id: 'ch1-q002', chapter: 1, text: 'Second saved question' }),
];

function jsonResponse(body: unknown, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(body) } as Response;
}

const fetchMock = vi.fn((url: string) => {
  if (url === '/data/istqb-tae/index.json') return Promise.resolve(jsonResponse(index));
  if (url === '/data/istqb-tae/chapter-1.json') return Promise.resolve(jsonResponse(questions));
  if (url === '/data/istqb-genai/index.json') return Promise.resolve(jsonResponse(index));
  if (url === '/data/istqb-genai/chapter-1.json') return Promise.resolve(jsonResponse(questions));
  return Promise.resolve(jsonResponse(null, false, 404));
});

const TAE_TITLE = /ISTQB CTAL-TAE Preparation/;

function seedInProgress() {
  localStorage.setItem('tae_in_progress', JSON.stringify({
    mode: 'full',
    questionIds: ['ch1-q001', 'ch1-q002'],
    answers: [],
    flagged: [],
    remainingSeconds: null,
    startedAt: '2024-01-01T00:00:00.000Z',
  }));
}

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '';
    localStorage.clear();
    fetchMock.mockClear();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the landing page listing the three certifications', () => {
    renderWithUser(<App />);
    expect(screen.getByRole('heading', { name: 'Choose a certification' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TAE_TITLE })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ISTQB CT-GenAI/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Claude Certified Developer/ })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('opens the TAE home page and header brand when TAE is chosen', async () => {
    const { user } = renderWithUser(<App />);
    await user.click(screen.getByRole('button', { name: TAE_TITLE }));
    expect(await screen.findByRole('heading', { level: 1, name: 'ISTQB CTAL-TAE Preparation' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ISTQB TAE Prep' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/istqb-tae');
  });

  it('opens the GenAI home page when GenAI is chosen', async () => {
    const { user } = renderWithUser(<App />);
    await user.click(screen.getByRole('button', { name: /ISTQB CT-GenAI/ }));
    expect(await screen.findByRole('heading', { level: 1, name: 'ISTQB CT-GenAI Preparation' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/istqb-genai');
  });

  it.each([
    [/Claude Certified Developer/, 'Claude Certified Developer – Foundations (CCDV-F)'],
  ])('wip cert %s shows Work in progress and back returns to the landing', async (name, title) => {
    const { user } = renderWithUser(<App />);
    await user.click(screen.getByRole('button', { name }));
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument();
    expect(screen.getByText('Work in progress')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to all certifications' }));
    expect(await screen.findByRole('heading', { name: 'Choose a certification' })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('"All certifications" in the TAE header returns to the landing', async () => {
    window.location.hash = '#/istqb-tae';
    const { user } = renderWithUser(<App />);
    await screen.findByRole('heading', { level: 1, name: 'ISTQB CTAL-TAE Preparation' });
    await user.click(screen.getByRole('button', { name: 'All certifications' }));
    expect(await screen.findByRole('heading', { name: 'Choose a certification' })).toBeInTheDocument();
  });

  it('shows the landing for an unknown hash id', () => {
    window.location.hash = '#/does-not-exist';
    renderWithUser(<App />);
    expect(screen.getByRole('heading', { name: 'Choose a certification' })).toBeInTheDocument();
  });

  it('shows a pre-seeded legacy tae_attempts entry in TAE history', async () => {
    localStorage.setItem('tae_attempts', JSON.stringify([
      makeAttempt({ id: 'legacy-1', mode: 'section', chapterId: 3, percent: 77, passed: true }),
    ]));
    window.location.hash = '#/istqb-tae';
    const { user } = renderWithUser(<App />);
    await screen.findByRole('heading', { level: 1, name: 'ISTQB CTAL-TAE Preparation' });
    await user.click(screen.getByRole('button', { name: 'History' }));
    expect(await screen.findByRole('heading', { name: 'Attempt History' })).toBeInTheDocument();
    expect(screen.getByText('Ch3 Practice')).toBeInTheDocument();
    expect(screen.getByText('77%')).toBeInTheDocument();
  });

  it('resumes the saved exam when opened at #/istqb-tae', async () => {
    seedInProgress();
    window.location.hash = '#/istqb-tae';
    renderWithUser(<App />);
    expect(await screen.findByText(/Question 1 of 2/)).toBeInTheDocument();
  });

  it('shows the landing with the resume badge at the bare root', async () => {
    seedInProgress();
    renderWithUser(<App />);
    expect(screen.getByRole('heading', { name: 'Choose a certification' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TAE_TITLE })).toHaveTextContent(/Exam in progress — resume/);
    await waitFor(() => expect(screen.queryByText(/Question 1 of 2/)).not.toBeInTheDocument());
  });
});
