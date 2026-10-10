# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # start dev server (Vite HMR)
npm run build         # tsc -b && vite build
npm run lint          # eslint .
npm run preview       # preview production build
npm run validate      # validate question bank JSON integrity
npm run test          # run component tests once (vitest)
npm run test:watch    # vitest in watch mode
npm run test:coverage # run tests + generate coverage report
npx vitest run src/utils/exam.test.ts           # single test file
npx vitest run -t "test name substring"         # single test by name
```

## Architecture

React 19 + TypeScript + Vite + Tailwind CSS. Multi-certification app (ISTQB CTAL-TAE and ISTQB CT-GenAI available; CCDV-F is work in progress). No router library in use (`react-router-dom` is in package.json but unimported) — certification selection is hash-based (`#/` = landing, `#/<certId>` = that certification) via `src/hooks/useHashRoute.ts`.

- `App.tsx` is a thin shell: settings + dark-mode class, `useHashRoute`, then renders `CertificationSelectPage` (no/unknown cert), `WorkInProgressPage` (`status: 'wip'`) or `<CertificationApp key={cert.id} />` (`status: 'available'`).
- `src/pages/CertificationApp.tsx` holds the former App body: a single `AppView` state (`'home' | 'exam' | 'history' | 'settings'`), `useData(cert.id)`, `useExam`, header and the Home/Exam/History/Settings pages. If `examState !== null`, the exam view overrides whatever view is set. Loading/error screens live here, so they never block the landing page.
- `src/certifications/registry.ts` — single source of truth: `CERTIFICATIONS` (`id`, `title`, `shortTitle`, `provider`, `description`, `status`, `storagePrefix`) and `getCertification(id)`.
- Opening `#/istqb-tae` with a saved in-progress exam resumes it; the bare root shows the landing page with an "Exam in progress — resume" badge instead.

**Data flow:**
- `src/hooks/useData.ts` — `useData(certId)` fetches `public/data/<certId>/index.json` + all `chapter-{n}.json` files once per certification. Module-level `Map<certId, CacheEntry>` with a listener array; later mounts of the same cert get the cached result. Non-ok responses surface as `error`.
- `src/hooks/useExam.ts` — full exam state machine (start, answer, flag, navigate, review, submit, exit). Takes the cert's storage as an argument and persists in-progress state on every change.
- `src/hooks/useSettings.ts` — reads/writes `AppSettings` to localStorage (global, shared by all certifications).

**Persistence** (`src/utils/storage.ts`, localStorage keys):
- `certStorage(prefix)` returns `getAttempts`, `saveAttempt`, `clearAttempts`, `exportAttempts`, `getInProgress`, `saveInProgress`, `clearInProgress` using keys `${prefix}_attempts` and `${prefix}_in_progress` (export file `${prefix}-history.json`). Prefixes are per certification and must be unique.
- TAE uses prefix `tae`, so its keys stay `tae_attempts` (completed `Attempt[]` history) and `tae_in_progress` (resumable `InProgressAttempt`) — existing users lose nothing.
- `tae_settings` — `AppSettings` (passPercent, randomize flags, theme); global, legacy key kept.

**Question bank** (`public/data/<certId>/`):
- GenAI (`istqb-genai`, prefix `genai`): 5 chapters, 40 questions, 60 min, 65% pass. Chapters 2 and 3 set `mixedPoints: true` (K3 questions are 2 pts, others 1), so full-exam totals vary slightly; `points` in index is nominal. Source: `docs/ISTQB GEN AI/ISTQB_CT_GenAI_Questions_by_Syllabus.json`.
- `index.json` — chapter metadata + exam config (TAE: 40 questions, 66 points, 90 min, 65% pass)
- `chapter-{n}.json` — arrays of `Question` objects (TAE: `chapter-1..8`)
- All questions within a chapter must have equal `points` (required for random selection fairness)
- `npm run validate` validates every certification folder under `public/data/` that contains an `index.json` (optional CLI arg limits it to one cert); duplicate-id checks are per certification. Run it after editing any JSON.

**Types** (`src/types.ts`): single source of truth — `Question`, `Attempt`, `InProgressAttempt`, `AppSettings`, `IndexData`.

## Testing

**Stack:** Vitest + React Testing Library + `@testing-library/jest-dom` + `@testing-library/user-event`. Test environment is jsdom. No globals — import `describe`/`it`/`expect`/`vi` explicitly from `'vitest'`.

**Conventions:**
- Test files live next to source: `Component.test.tsx` / `module.test.ts`
- Shared helpers in `src/test/`: `renderWithUser.tsx` (RTL render + userEvent.setup()), `factories.ts` (makeQuestion, makeAttempt, makeIndexData)
- `tsconfig.app.json` excludes `*.test.*` and `src/test/**` — test files are transpiled by esbuild only, not tsc

**Coverage:** `src/components/*` and `src/utils/exam.ts` are at or near 100%. The multi-certification layer is tested too: `useHashRoute`, `useData` (mocked `fetch`; its cache is module-level, so tests use a distinct certId each), `CertificationSelectPage`, `WorkInProgressPage` and an `App.test.tsx` flow test (landing, wip pages, history backward-compat, resume). `useExam` and the Home/Exam/History/Settings pages have no dedicated tests yet (Phase 3/4 of COMPONENT_TESTING_PLAN.md).

**CI:** `.github/workflows/component-tests.yml` runs lint + validate + test:coverage on every PR to `main`. Make it a required status check via GitHub branch protection.

## Project skills
- `.claude/skills/update-questions-db` — append vetted questions to `public/data/istqb-tae/chapter-*.json`; `generate-questions` — live quiz drill from the syllabus, writes nothing.
- Vite `base` is `/exam-preparation-app/` (GitHub Pages) — `fetch` paths for data must respect `import.meta.env.BASE_URL`.

## Protected directories — never touch
- `docs/` — source PDFs and reference material. Never delete, overwrite, or pass `--overwrite` / `-f` flags to any scaffolding tool that could affect this directory.

## Scaffolding in non-empty directories
When running `npm create vite`, `create-react-app`, or any generator in this directory: do NOT use `--overwrite`, `--force`, or equivalent flags. Create files manually or move existing files out first.
