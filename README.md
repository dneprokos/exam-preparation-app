# ISTQB Advanced TAE Preparation App

A browser-based practice tool for the ISTQB Advanced Level Test Automation Engineer (CTAL-TAE) certification exam.

**Live app:** https://dneprokos.github.io/exam-preparation-app/

## Overview

Covers all 8 exam chapters with a combined question bank of 40+ questions per chapter. Supports timed full-exam simulation (40 questions, 90 minutes, 65% pass threshold) and per-chapter practice sessions. Progress is saved in the browser and persists across sessions.

**Key features:**
- Full exam mode and per-chapter practice mode
- Countdown timer with automatic submit on expiry
- Flag questions and return to them during review
- Detailed results with per-chapter score breakdown
- Attempt history with trend chart
- Configurable pass threshold, question/option randomization, and dark mode

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm (bundled with Node.js)

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open `http://localhost:5173` in a browser. The app loads entirely client-side — no backend or network connection required after initial load.

## How to Use

### Starting an exam

1. Open the app. The home screen lists all 8 chapters with their question counts and point weights.
2. Click **Start Full Exam** to begin a timed 40-question simulation drawn randomly from all chapters.
3. Click any chapter card to start an untimed practice session for that chapter only.

### During an exam

- **Navigate** between questions using Previous / Next buttons or the question-index grid.
- **Flag** a question with the flag button to mark it for later review.
- **Answer** single-choice questions by selecting one option; multi-choice questions require selecting all correct options (the prompt states how many to pick).
- Click **Review & Submit** when done. The review screen shows unanswered and flagged questions — you can jump back to any of them before submitting.

### After submitting

- Results show your total score, pass/fail status, time taken, and a breakdown by chapter.
- Each question reveals the correct answer and explanation.
- Click **Home** to return to the main screen.

### History

Click **History** in the top navigation to see all past attempts. A trend chart shows score progression over time. Weak chapters (below pass threshold across recent attempts) are highlighted.

### Settings

Click **Settings** to configure:

| Setting | Description |
|---|---|
| Pass threshold | Minimum percentage to pass (default 65%) |
| Randomize questions | Shuffle question order each session |
| Randomize options | Shuffle answer option order each session |
| Theme | Light or dark mode |

## Project Structure

```
public/data/          # Question bank (JSON — edit here to add/update questions)
  index.json          # Chapter metadata and exam configuration
  chapter-{1..8}.json # Question arrays per chapter
src/
  hooks/              # useData (question loading), useExam (state machine), useSettings
  utils/              # exam logic (scoring, shuffling), localStorage helpers
  components/         # QuestionCard, TimerDisplay, ReviewScreen, ResultsScreen, etc.
  pages/              # HomePage, ExamPage, HistoryPage, SettingsPage
  types.ts            # Shared TypeScript interfaces
```

## Editing the Question Bank

All questions live in `public/data/chapter-{n}.json`. After editing, validate the data:

```bash
npm run validate
```

Validation checks for duplicate IDs, correct option references, and consistent point values within each chapter (required for fair random selection).

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. The app is a static site and can be served from any web host or CDN.
