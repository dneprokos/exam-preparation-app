# Multi-Certification Extension Plan

## Context

The app today is a single-certification practice tool (ISTQB CTAL-TAE). Goal: turn it into a
multi-certification app without breaking the existing one.

- A new landing page lists certifications to practise.
- **ISTQB Test Automation (CTAL-TAE)** works exactly as before, including existing users' history,
  in-progress exam and settings.
- **ISTQB GEN AI** and **Claude Certified Developer – Foundations (CCDV-F)** are listed but show a
  "Work in progress" page. No content for them now.
- Adding a future certification should be: one registry entry + one data folder.

### What currently assumes one certification (verified in code)

| Coupling | Where |
|---|---|
| Flat data path `data/index.json`, `data/chapter-{n}.json` | `src/hooks/useData.ts:15,19`, `scripts/validate-questions.js:7,33,41` |
| Unkeyed module-level data cache, `useData()` takes no argument | `src/hooks/useData.ts:4-8,32` |
| Data load gates the whole app (full-screen loading/error) | `src/App.tsx:14,26-40` |
| Global storage keys `tae_attempts`, `tae_in_progress`, `tae_settings` | `src/utils/storage.ts:3-7` |
| Auto-resume forces the exam view on load | `src/hooks/useExam.ts:273-298` + `src/App.tsx:24` |
| Question ids `ch1-q001` unique only within one cert; validator checks ids globally | `scripts/validate-questions.js:37,92` |
| Hardcoded branding / numbers | `App.tsx:50`, `HomePage.tsx:17,19,26,55`, `ResultsScreen.tsx:47`, `SettingsPage.tsx:17`, `storage.ts:37` |
| Skills hardcode `public/data/chapter-*.json` | `.claude/skills/update-questions-db/SKILL.md`, `.claude/skills/generate-questions/SKILL.md` |

No existing test touches the data path, fetch URLs or the App view flow, so nothing will catch a
regression there today — the plan adds those tests.

## Design decisions

1. **Certification registry in code** — `src/certifications/registry.ts` is the single source of
   truth. Landing page renders without any fetch.
2. **Per-certification data folder** — `public/data/<certId>/index.json` + `chapter-{n}.json`.
   TAE files move to `public/data/istqb-tae/` with `git mv` (content unchanged).
3. **Storage namespaced by a per-cert prefix; TAE's prefix is `tae`** — so TAE keeps the exact keys
   `tae_attempts` and `tae_in_progress`. No migration, existing users lose nothing. Settings stay
   global under the legacy key `tae_settings` (theme and randomize flags are app-wide).
4. **Hash-based selection, no router library** — `#/` = landing, `#/<certId>` = that certification.
   Survives refresh, back button works, no GitHub Pages SPA-fallback problem. Inner views
   (home/history/settings/exam) stay in component state exactly as today. `react-router-dom` stays
   unused.
5. **Existing App body becomes `CertificationApp`**, mounted with `key={cert.id}` so all exam state
   resets when switching certification. `App.tsx` becomes a thin shell.

## Target structure

```
src/
  App.tsx                         # shell: theme, hash route, picks page
  certifications/
    registry.ts                   # Certification type, CERTIFICATIONS, getCertification(id)
    registry.test.ts
  hooks/
    useHashRoute.ts               # (new) certId from location.hash
    useData.ts                    # useData(certId) – cache keyed by certId
    useExam.ts                    # + storage argument
    useSettings.ts                # unchanged (global)
  pages/
    CertificationSelectPage.tsx   # (new) landing
    WorkInProgressPage.tsx        # (new)
    CertificationApp.tsx          # (new) former App body: header + Home/Exam/History/Settings
    HomePage.tsx / ExamPage.tsx / HistoryPage.tsx / SettingsPage.tsx
  utils/storage.ts                # certStorage(prefix) + global settings fns
public/data/
  istqb-tae/index.json, chapter-1..8.json
```

### Registry shape

```ts
export interface Certification {
  id: string;                     // URL hash + data folder name
  title: string;                  // full name, landing card + HomePage h1
  shortTitle: string;             // header brand
  provider: string;               // "ISTQB", "Anthropic"
  description: string;
  status: 'available' | 'wip';
  storagePrefix: string;          // localStorage namespace
}

export const CERTIFICATIONS: Certification[] = [
  { id: 'istqb-tae',   shortTitle: 'ISTQB TAE Prep', status: 'available', storagePrefix: 'tae',   ... },
  { id: 'istqb-genai', shortTitle: 'ISTQB GenAI',    status: 'wip',       storagePrefix: 'genai', ... },
  { id: 'ccdv-f',      shortTitle: 'CCDV-F',         status: 'wip',       storagePrefix: 'ccdvf', ... },
];
```

## Execution

- Implementation is done by Sonnet: each phase is delegated to a subagent running `model: sonnet`,
  sequentially (phases depend on each other). The main session briefs each one from this plan,
  checks its diff and runs the phase gate (`lint`, `validate`, `test`, `build`) before the next.
- Runs in auto mode (permission mode is switched by the user; the session cannot set it itself).
- No commit, push or PR unless asked.

## Implementation phases

Each phase leaves `lint`, `validate`, `test` and `build` green.

### Phase 0 — Branch and plan document
- Branch `feature/multi-certification` from `main`.
- Save this plan in the repo root as `MULTI_CERTIFICATION_PLAN.md` (matches the existing
  `COMPONENT_TESTING_PLAN.md` convention).

### Phase 1 — Registry
- Add `src/certifications/registry.ts` (type, three entries, `getCertification(id)`).
- `registry.test.ts`: ids unique, storage prefixes unique, every `available` cert has
  `public/data/<id>/index.json` on disk (will pass after Phase 2).

### Phase 2 — Data layout, loader, validator, skills (one commit — CI runs `validate`)
- `git mv public/data/index.json public/data/chapter-*.json` → `public/data/istqb-tae/`.
- `src/hooks/useData.ts`: signature `useData(certId: string)`; replace the module singletons with a
  `Map<certId, CacheEntry>`; fetch `${BASE_URL}data/${certId}/…`; add `r.ok` checks so a missing
  file surfaces as an error instead of a JSON parse failure. Return shape unchanged.
- `scripts/validate-questions.js`: wrap the current checks in `validateCert(dir)`; iterate every
  subfolder of `public/data/` that contains `index.json`; make the duplicate-id set per
  certification; generic banner; optional CLI arg to validate one cert. Script path and the
  `validate` npm script name stay the same (CI and a skill call them by name).
- Update paths in `.claude/skills/update-questions-db/SKILL.md` and
  `.claude/skills/generate-questions/SKILL.md` to `public/data/istqb-tae/`. Both skills stay
  TAE-specific. `docs/` is not touched.

### Phase 3 — Storage namespacing
- `src/utils/storage.ts`: add `certStorage(prefix)` returning `getAttempts`, `saveAttempt`,
  `clearAttempts`, `exportAttempts`, `getInProgress`, `saveInProgress`, `clearInProgress`, using
  keys `${prefix}_attempts` / `${prefix}_in_progress` and export filename `${prefix}-history.json`
  (TAE keeps `tae-history.json`). `getSettings` / `saveSettings` remain global on `tae_settings`.
- `useExam(indexData, questionsByChapter, settings, storage)` — use the passed storage instead of
  the module imports.
- `HomePage` and `HistoryPage` receive `storage` as a prop instead of importing storage functions.
- Update `storage.test.ts` to go through `certStorage('tae')`; existing key literals stay valid,
  which proves backward compatibility. Add a test that two prefixes do not see each other's data.

### Phase 4 — Shell, landing page, WIP page
- `src/hooks/useHashRoute.ts`: returns `{ certId, navigate(certId | null) }`, listens to
  `hashchange`. Unknown id → landing.
- `src/pages/CertificationApp.tsx`: move the current `App.tsx` body here (view state, `useData(cert.id)`,
  `useExam`, header, pages). Props: `cert`, `settings`, `updateSettings`, `onBackToCertifications`.
  Header shows `cert.shortTitle` plus an "All certifications" link. Loading/error screens now live
  here, so they no longer block the landing page.
- `src/pages/CertificationSelectPage.tsx`: one card per registry entry — title, provider,
  description; WIP entries carry a "Work in progress" badge but stay clickable; an available cert
  with a saved in-progress attempt shows "Exam in progress — resume".
- `src/pages/WorkInProgressPage.tsx`: cert title, "Work in progress" message, back button.
- `src/App.tsx`: `useSettings` + dark-mode effect (kept at the shell so the theme applies on every
  page), `useHashRoute`, then render landing / `WorkInProgressPage` / `<CertificationApp key={cert.id} />`.

Behaviour note: today a saved in-progress exam opens straight into the exam on load. That stays
true when the URL is `#/istqb-tae` (refresh mid-exam). Opening the bare root URL shows the landing
page with the resume badge instead — the one intentional behaviour change.

### Phase 5 — Remove hardcoded single-cert values
- `HomePage.tsx:26` title → `cert.title`; `:55` "all 8 chapters" → `indexData.chapters.length`;
  `:17,19` default chapter → `indexData.chapters[0].id`.
- `ResultsScreen.tsx:47` literal `65` → new `passPercent` prop (threaded from `ExamPage`).
- `SettingsPage.tsx:17` "(ISTQB standard is 65%)" → neutral wording.

### Phase 6 — Tests
- New: `useHashRoute.test.ts`, `CertificationSelectPage.test.tsx`, `WorkInProgressPage.test.tsx`,
  `useData.test.ts` (mocked `fetch`: correct per-cert URLs, cache per cert, error on non-ok).
- New `App.test.tsx` flow: landing lists three certifications → TAE opens the existing home page →
  each WIP cert shows "Work in progress" → back returns to landing → pre-seeded `tae_attempts`
  appears in TAE history (backward-compat guard).
- Update `ResultsScreen.test.tsx` for the new prop.

### Phase 7 — Docs
- `CLAUDE.md`: architecture, data paths, storage keys, new files.
- `README.md`: multi-cert description, structure tree, new section "Adding a certification".
- `COMPONENT_TESTING_PLAN.md`: data path references.

## Adding a certification later

1. Add an entry to `src/certifications/registry.ts` with `status: 'wip'`.
2. Create `public/data/<id>/index.json` and `chapter-{n}.json` files (same schema as TAE).
3. `npm run validate`, then flip `status` to `'available'`.

No component, hook or storage change needed.

## Out of scope

- Content for ISTQB GEN AI and CCDV-F.
- Per-certification pass threshold: `passPercent` stays one global setting (default 65). Worth
  revisiting when a certification with a different pass mark gets content.
- Per-certification question-authoring skills and `docs/` reorganisation.
- Putting inner views (history/settings) in the URL.

## Verification

1. `npm run lint && npm run validate && npm run test && npm run build` — all pass; validator still
   reports the same 381 checks for `istqb-tae`.
2. `npm run dev`, then in the browser:
   - Root URL shows the landing page with three certifications.
   - ISTQB TAE → home page identical to today; run a section practice and a full exam start,
     answer, flag, review, submit; result lands in History.
   - Refresh mid-exam on `#/istqb-tae` → exam resumes with remaining time.
   - Root URL with an exam in progress → landing shows the resume badge.
   - ISTQB GEN AI and CCDV-F → "Work in progress" page; back returns to landing; browser back works.
   - Dark theme toggled in Settings applies on the landing page too.
3. Backward compatibility: before switching branch, create history and an in-progress exam on
   `main`; after switching, both are still there under TAE.
4. `npm run preview` — confirm data loads under the `/exam-preparation-app/` base path.
