---
name: update-questions-db
description: >
  Adds new questions to the ISTQB TAE preparation app's question database
  (public/data/istqb-tae/chapter-*.json files). Use this skill whenever the user wants
  to add questions, import questions, update the question bank, load new Q&A
  pairs, or provides quiz questions (pasted text or a .txt file path).
  Trigger phrases include: "add questions", "update question database",
  "import questions", "load these into the question bank", "add these to the
  app", "I have new questions", or when the user pastes Q&A blocks or
  mentions a txt file containing questions. Always append — never removes
  existing questions.
---

# Update Questions Database

You are importing questions into the ISTQB TAE preparation app's question bank. The database lives in `public/data/istqb-tae/chapter-{1..8}.json` — one JSON array per chapter. Your job: parse the input, route each question to the right chapter, build valid question objects, and append them without touching what's already there.

## File map

| File | Purpose |
|------|---------|
| `public/data/istqb-tae/chapter-{1-8}.json` | Question arrays — **only files you write** |
| `public/data/istqb-tae/index.json` | Exam config — **never modify** |
| `docs/` | Source PDFs/txt — **read only, never write** |
| `scripts/validate-questions.js` | Validator — run after every write |

## Chapter reference

| # | Title |
|---|-------|
| 1 | Introduction and Objectives for Test Automation |
| 2 | Preparing for Test Automation |
| 3 | Test Automation Architecture |
| 4 | Implementing Test Automation |
| 5 | Implementation and Deployment Strategies for Test Automation |
| 6 | Test Automation Reporting and Metrics |
| 7 | Verifying the Test Automation Solution |
| 8 | Continuous Improvement |

---

## Step 1 — Ingest

**File path given**: Read it with the Read tool. Accept any path — absolute, relative to project root, or a bare filename checked against `docs/`.

**Text pasted**: Use it directly.

Split into discrete question blocks. The `docs/` txt files use this structure:
```
QUESTION N
================================================================================
Points: X / Y

Q<number>

TAE-X.Y.Z     ← section code (may appear here, inline, or as "Syllabus X.Y")

<question text>

Options:
A. ...
B. ...
C. ...
D. ...

Correct Answer: <letter(s)>

Explanation:
<text>
```

Other formats may vary — extract: question text, all options (letter + text), correct answer(s), explanation, and any section/syllabus reference.

---

## Step 2 — Classify chapter

For each question, determine its chapter in order of confidence:

**1. Section code present** (`TAE-X.Y.Z`, `Syllabus X.Y`, `TAE X.Y`):
Chapter = first digit. `TAE-3.1.1` → chapter 3. `TAE-7.2` → chapter 7.

**2. No code — infer from content** using keyword signals:

| Chapter | Strong signals |
|---------|---------------|
| 1 | "advantage", "limitation", "benefit", "V-model", "SDLC", "ROI", "test automation goals" |
| 2 | "gTAA", "TAF", "tool selection", "SUT", "pilot project", "risk", "stakeholder", "TAS" |
| 3 | "architecture", "TAA", "layer", "adaptation layer", "test generation", "test execution", "TDL", "test definition" |
| 4 | "scripting", "keyword-driven", "data-driven", "BDD", "TDD", "API testing", "version control", "CI" |
| 5 | "migration", "deployment", "strategy", "legacy", "rollout", "maintenance strategy" |
| 6 | "metric", "report", "coverage", "dashboard", "KPI", "trend", "measurement" |
| 7 | "verify", "audit", "review", "quality gate", "inspection", "peer review", "static analysis" |
| 8 | "improvement", "retrospective", "optimization", "maturity", "TPI", "process improvement", "PDCA" |

**3. Ambiguous or unknown**: STOP. Do not write anything. Show the user:
- The full question text
- Your best-guess chapter with a 1–2 sentence rationale explaining which signals led you there
- Ask: "Which chapter should this go into? (1–8, or paste the section code if you have it)"

Resume only after the user confirms.

---

## Step 3 — Build question object

Read the target chapter file first to find the existing `points` value (the validator requires all questions in a chapter to share the same `points`).

```json
{
  "id": "ch{N}-q{NNN}",
  "chapter": N,
  "section": "X.Y.Z",
  "type": "single",
  "points": 1.00,
  "text": "Full question text ending with question mark?",
  "options": [
    { "id": "a", "text": "Option A text" },
    { "id": "b", "text": "Option B text" },
    { "id": "c", "text": "Option C text" },
    { "id": "d", "text": "Option D text" }
  ],
  "correct": ["b"],
  "selectCount": 1,
  "image": null,
  "explanation": "Explanation of why the answer is correct.",
  "reference": "Syllabus X.Y.Z"
}
```

**Field rules:**
- `type`: `"single"` if 1 correct answer; `"multiple"` if 2 or more
- `selectCount`: must equal `correct.length`
- `correct`: array of lowercase option ids. Map `A→a`, `B→b`, `C→c`, `D→d`, `E→e`
- `section`: strip "TAE-" prefix — store `"3.1.1"` not `"TAE-3.1.1"`. If unknown use `"{N}.0"` as fallback
- `reference`: `"Syllabus X.Y.Z"` mirroring the section value
- `points`: copy exactly from the first existing question in the target chapter — never invent a value
- `image`: always `null` unless the question explicitly references an image

---

## Step 4 — Assign IDs

For each target chapter:
1. Read `public/data/istqb-tae/chapter-{N}.json`
2. Find the highest number in existing `"ch{N}-q{NNN}"` IDs using a pattern match
3. New questions in that chapter get the next sequential numbers

Example: last ID is `ch3-q009`, adding 2 questions → `ch3-q010`, `ch3-q011`.

Track per-chapter counters across all questions in one import session so IDs don't collide.

---

## Step 5 — Dedup check

Before writing, normalize each new question's text: lowercase, strip punctuation, collapse whitespace. Compare against all existing questions in the target chapter.

If similarity is very high (essentially the same question), skip it and note it for the report. Don't error — continue with other questions.

---

## Step 6 — Append and write

For each chapter that received new questions:
1. Read existing array from `public/data/istqb-tae/chapter-{N}.json`
2. Push all new question objects to the **end** of the array
3. Write back with **2-space JSON indentation**
4. Never touch existing entries

Only write files where at least one question was accepted.

---

## Step 7 — Validate

```
node scripts/validate-questions.js
```

Read the output carefully. Common causes of failure with newly added questions:

| Error | Fix |
|-------|-----|
| `correct options exist in options array` | A `correct` id doesn't match any option `id` |
| `single type has exactly 1 correct` | `correct` array has wrong length for the declared `type` |
| `all questions have same point value` | New question's `points` doesn't match chapter's existing value |
| `no duplicate question IDs` | ID collision — regenerate the ID |

Fix and rerun until validator passes. If validator fails after 3 attempts, report exactly what failed and stop.

---

## Step 8 — Report

```
## Import complete

| Chapter | Added | Skipped (dup) | Chapter confirmed by user |
|---------|-------|---------------|--------------------------|
| ch3     | 2     | 0             | No (section code present) |
| ch6     | 1     | 0             | No (inferred from content) |

Validator: ✅ PASSED
```

If validator failed: show `❌ FAILED` with the exact error message.

---

## Safety — never violate

- `docs/` is **read-only**. Never write, delete, or modify files there.
- **Append only** — never delete or modify existing question objects.
- `public/data/istqb-tae/index.json` is config — **never modify it**.
- No `--overwrite` or `--force` flags anywhere.
- Always confirm with user before writing when chapter is ambiguous.
