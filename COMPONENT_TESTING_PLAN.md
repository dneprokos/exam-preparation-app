# Component Testing Plan

Plan to add component (and unit) tests to the ISTQB Advanced TAE preparation app, ending with a CI pipeline that runs the tests on every pull request to `main`.

## Goal

- Establish a fast, reliable component-test suite for the React UI.
- Cover the exam-taking flow and the pure scoring/selection logic that drives it.
- Run the suite automatically on every PR to `main` and block merge on failure.

## Reference

We borrow the toolchain and patterns from Mosh Hamedani's
[`react-testing-finish`](https://github.com/mosh-hamedani/react-testing-finish) project:
**Vitest + React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event` + MSW**.

We deliberately **do not** adopt everything from that repo:

- It is a different app (storefront/e-commerce) with React Query, a form library, and auth — none of which exist here.
- We skip its provider-heavy `renderWithProviders` wrapper at first; this app has no router-wrapped components that need testing (`CertificationApp` manages views via state; certification selection is hash-based) and no global context providers around components.
- We keep MSW only for the data-loading path (`useData` fetches JSON from `public/data/<certId>/`), not as a blanket requirement.

What we keep: the test runner config, the custom render helper pattern, `user-event` for interactions, `jest-dom` matchers, and the "test behavior, not implementation" philosophy.

---

## Why this app is testable

The component layer is mostly **presentational with props in / callbacks out**, which is ideal for component testing:

| Unit | Type | Notes |
|------|------|-------|
| `utils/exam.ts` | Pure functions | `scoreQuestion`, `computeResult`, `selectQuestions`, `getWeakChapters`, `shuffle` — pure, deterministic (except RNG/UUID/Date). Highest ROI. |
| `components/QuestionCard.tsx` | Pure component | Single vs multiple select logic, `selectCount` cap, flag toggle. |
| `components/TimerDisplay.tsx` | Pure component | Time formatting + warning threshold at `<= 300s`. |
| `components/NavGrid.tsx` | Pure component | Answered/flagged/current/unanswered cell states. |
| `components/ReviewScreen.tsx` | Pure component | Answered/unanswered/flagged counts, jump-to-question. |
| `components/ResultsScreen.tsx` | Pure component | Pass/fail, percent rounding, chapter breakdown, per-question correctness. |
| `components/TrendChart.tsx` | Pure component | Render with sample attempts. |
| `pages/*` | Composed | Lighter coverage; integration-style smoke tests. |
| `hooks/useExam.ts` | Stateful hook | State machine — test with `renderHook` (medium ROI). |
| `hooks/useData.ts` | Stateful hook | Fetches `data/<certId>/…` JSON — needs a fetch mock (done with `vi.stubGlobal`, no MSW). |
| `utils/storage.ts` | localStorage wrapper | Test against jsdom localStorage. |

Things that complicate testing and how we handle them:

- `crypto.randomUUID()` in `computeResult` → stub `crypto` or assert on shape, not exact id.
- `Math.random()` in `shuffle`/`selectQuestions` → spy on `Math.random` or assert set membership/length, not order.
- `new Date()` in `computeResult` → assert `date` is an ISO string, or fake timers if exact value needed.
- `useData` module-level per-cert cache (`Map<certId, …>`) with a listener array → use a distinct certId per test (or `vi.resetModules`) and mock `fetch` (implemented with `vi.stubGlobal`).

---

## Phase 0 — Tooling setup

Add dev dependencies:

```bash
npm i -D vitest @vitest/coverage-v8 jsdom \
  @testing-library/react @testing-library/dom @testing-library/jest-dom @testing-library/user-event \
  msw
```

Add `vitest.config.ts` (or extend `vite.config.ts`):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.d.ts', 'src/main.tsx', 'src/test/**'],
    },
  },
});
```

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

Conventions:

- Test files live next to source: `Component.test.tsx` / `module.test.ts`.
- Shared helpers in `src/test/` (custom `render`, factory builders).
- Add a `renderWithUser` helper that returns `{ user, ...renderResult }` (the Mosh pattern) so every interaction test sets up `userEvent.setup()` consistently.
- Add type-safe test-data factories: `makeQuestion(overrides)`, `makeAttempt(overrides)` in `src/test/factories.ts` to avoid repeating the large `Question`/`Attempt` shapes.

---

## Phase 1 — Pure logic unit tests (`utils/exam.ts`)

Highest ROI, no DOM. File: `src/utils/exam.test.ts`.

- `scoreQuestion`
  - returns full points when selected set equals `correct` (order-independent).
  - returns 0 on partial, wrong, empty, or superset selection.
- `selectQuestions`
  - returns all when `questions.length <= count`.
  - returns exactly `count` and all items are members of input when more available.
- `computeResult`
  - sums `earned`/`available` correctly across chapters.
  - `percent` math and `passed` boundary (`>= passPercent`) — test just-below / equal / above.
  - builds `chapterBreakdown` per chapter.
  - `percent === 0` when `available === 0` (no divide-by-zero).
  - `date` is a valid ISO string; `id` is present (stub `crypto.randomUUID`).
- `getWeakChapters`
  - returns chapters below `passPercent`, sorted ascending by `avgPercent`.
  - respects `lastN` window; ignores chapters with no relevant attempts.
- `shuffle`
  - returns a permutation (same length, same multiset); original array not mutated.

---

## Phase 2 — Pure component tests

Render with RTL, assert on accessible text/roles, drive with `user-event`.

### `QuestionCard.test.tsx`
- renders question text, chapter/section badge, points, options A/B/C…
- shows "Single answer" badge for `type: 'single'`, "Multiple answers · select N" for `type: 'multiple'`.
- single: clicking an option calls `onAnswer([id])`; clicking another replaces selection.
- multiple: clicking adds ids up to `selectCount`; clicking a selected id removes it; cannot exceed `selectCount`.
- flag button calls `onToggleFlag`; reflects `isFlagged` styling/title (`Flag for review` vs `Remove flag`).

### `TimerDisplay.test.tsx`
- formats `m:ss` under an hour and `h:mm:ss` at/over an hour.
- pads minutes/seconds.
- applies warning style when `seconds <= 300`, normal otherwise (assert via class or role/text).

### `NavGrid.test.tsx`
- renders one button per question, labelled 1..n.
- marks current index, answered (has selection), flagged, unanswered with distinct classes.
- clicking a cell calls `onGoTo(i)`.

### `ReviewScreen.test.tsx`
- counts answered / unanswered / flagged correctly.
- lists unanswered and flagged question buttons; clicking calls `onGoToQuestion` with right index.
- Submit / Back / Keep-reviewing buttons fire their callbacks.

### `ResultsScreen.test.tsx`
- shows rounded percent, PASS/FAIL, points and time.
- renders chapter breakdown rows with per-chapter percent.
- per-question review marks ✓/✗ and reveals correct answer + explanation only when wrong.
- "Back to Home" calls `onGoHome`.

### `TrendChart.test.tsx`
- renders with a list of attempts (smoke + key data points); empty-state handling.

---

## Phase 3 — Stateful hooks & storage

- `utils/storage.test.ts` — round-trip read/write via `certStorage('tae')` for `tae_attempts`, `tae_in_progress`, plus `tae_settings`; prefixes are isolated; tolerates missing/corrupt JSON (returns defaults, no throw).
- `useSettings.test.ts` — `renderHook`; defaults, update persists to localStorage, theme toggle.
- `useExam.test.ts` — `renderHook`; the state machine:
  - start → builds question list, initial index 0.
  - answer / flag / navigate update state.
  - persists to `tae_in_progress` on change; resumes from it.
  - review → submit produces an `Attempt` and clears in-progress.
  - exit clears state.
- `useData.test.ts` — **done** (mocked `fetch` rather than MSW): per-cert URLs `data/<certId>/index.json` + `chapter-{n}.json`, merged result, no refetch on remount, certs cached separately, non-ok response surfaces an error. Distinct certId per test instead of `vi.resetModules()`.
- `useHashRoute.test.ts` — **done** (added with multi-certification): initial/empty hash, `navigate`, external hash change, listener cleanup.

---

## Phase 4 — Page / integration smoke tests (optional, lighter)

- `HomePage`, `SettingsPage`, `HistoryPage` render without crashing given mocked data/settings. (`HistoryPage` is partly covered via `App.test.tsx`; `CertificationSelectPage` and `WorkInProgressPage` have their own tests.)
- One end-to-end-ish flow at component level: start exam → answer a question → open review → submit → see results. Keeps router/state wiring honest without a full browser.
- `App.test.tsx` — **done**: shell flow with mocked `fetch` (landing lists three certifications, TAE home, work-in-progress pages and back, "All certifications", unknown hash, legacy `tae_attempts` shown in History, resume at `#/istqb-tae` vs badge at bare root). The start → answer → review → submit flow is still open.

> Note: full browser E2E (Playwright) is out of scope here — the repo already has a `playwright-e2e-init` path for that. This plan stays at the jsdom component level.

---

## Phase 5 — CI pipeline (PR to `main`)

Create `.github/workflows/component-tests.yml`:

```yaml
name: Component Tests

on:
  pull_request:
    branches: [main]

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Validate question bank
        run: npm run validate

      - name: Run component tests
        run: npm run test:coverage

      - name: Upload coverage
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

Then make it a merge gate:

- Push the workflow, open a PR, confirm the job runs.
- In GitHub repo settings → Branches → branch protection rule for `main`: require the **Component Tests** status check to pass before merge.

Optional hardening (later):

- Add `npm run build` as a CI step to catch type errors in the bundle.
- Add a coverage threshold in `vitest.config.ts` (`coverage.thresholds`) and fail CI below it — start low (e.g. 50%) and ratchet up.

---

## Suggested execution order

1. Phase 0 — tooling (one PR; proves Vitest runs in CI with a single trivial test).
2. Phase 1 — `exam.ts` unit tests (fast, high value).
3. Phase 2 — component tests (the bulk of "component testing").
4. Phase 5 — wire CI + branch protection (can land right after Phase 0/1 so every later PR is gated).
5. Phase 3 — hooks & storage.
6. Phase 4 — page smoke tests (optional).

Wiring CI early (after a first green test) means all subsequent test-adding PRs are themselves validated by the pipeline.

## Definition of done

- `npm run test` runs green locally.
- `utils/exam.ts` and all `src/components/*` have tests.
- CI workflow runs on PRs to `main` and is a required status check.
- Coverage report produced as a CI artifact.
