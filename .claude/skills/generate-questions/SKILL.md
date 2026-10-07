---
name: generate-questions
description: >
  Runs an interactive ISTQB CTAL-TAE exam-question drill: generates fresh
  practice questions live from the syllabus PDF, quizzes the user one at a
  time, and reveals the answer with explanation after each. Use whenever the
  user wants to practice, drill, quiz themselves, or test their knowledge on
  CTAL-TAE material — trigger phrases include "quiz me", "give me practice
  questions", "drill me on chapter 3", "test my knowledge", "generate some
  ISTQB questions", "let's practice section 5", or "ask me questions about
  test automation architecture". This is a live study session, not a
  question-bank import — it never writes files. Contrast with
  update-questions-db, which is for adding vetted questions to the permanent
  bank.
---

# Generate ISTQB Practice Questions

Run a live, one-question-at-a-time practice drill. You write each question
yourself, freshly, from the syllabus — never copy or lightly reword a
question that's already in `public/data/istqb-tae/`. Those files are only a style
reference (tone, difficulty, option format), not a source to draw from.

## Step 1 — Get parameters

Both are required. If either is missing from the user's request, ask before
doing anything else:

- **sections**: `1`–`8`, `all`, or a comma list (`2,5,7`)
- **count**: total number of questions across the selected sections

Don't guess these — a wrong section or count wastes the user's practice time.

## Step 2 — Read the syllabus once

`Read` the whole PDF (`docs/ISTQB_CTAL-TAE_Syllabus_v2.0 - WORKBOOK.pdf`,
34 pages) a single time at the start of the session — don't pass a `pages`
range and don't re-read it per question. Page-scoped reads render pages as
images and depend on `pdftoppm`/poppler being installed, which isn't
guaranteed; a single whole-document read avoids that dependency entirely and
is cheaper than reading repeatedly anyway. Use the page map below only to
navigate to the right section within the content you already have loaded.

## Step 3 — Build the queue

Distribute `count` across the selected sections round-robin (e.g. 3 sections,
count 10 → 4/3/3). Randomize the order sections are drawn in so the same
chapter doesn't always open the session.

## Step 4 — Per question loop

Repeat until the queue is empty or the user says stop:

**a. Pull the source material.** From the syllabus text already loaded in
Step 2, use the section you're drawing on. Optionally glance at that
chapter's `public/data/istqb-tae/chapter-{n}.json` for tone/format only (question
phrasing style, option count, scenario framing) — never for content to reuse.

**b. Write one question.** 4 options (`a`–`d`). Mostly single-choice, with an
occasional multiple-choice question mixed in, matching the real exam's ratio.
Favor scenario-style K3/K4 questions ("a team wants to...", "which approach is
MOST appropriate...") over flat recall, again matching the sample bank's
style — this is what makes practice feel like the real exam.

**c. Dedup check.** Normalize the new question's text (lowercase, strip
punctuation/whitespace) and compare against every question already asked this
session. If it's essentially the same question, discard and write a
different one before presenting anything.

**d. Present and stop.** Show the question text and options a–d. End your
turn here — do not reveal the answer in the same message. Wait for the
user's reply.

**e. Grade and reveal.** On the user's answer: state correct/incorrect,
reveal the correct option(s), explain why the right answer is right and why
each plausible distractor is wrong, and cite the syllabus section (e.g.
"Syllabus 3.1.1"). Record the result (section + correct/incorrect) for the
summary.

**f. Continue prompt.** Ask if they want the next question or want to stop
early. Either way, move to the top of Step 4's loop again or fall through to
Step 5.

## Step 5 — Score summary

Once the queue is empty or the user stops:

```
Score: X/N correct (XX%)

By section:
  2 - Preparing for Test Automation: 3/4
  5 - Implementation and Deployment Strategies: 1/2

Weak sections (below 60%): 5
```

Only list a "weak sections" line if at least one section is actually below
the threshold — don't print an empty warning.

## Syllabus page map

The PDF has 34 pages. These ranges were extracted from the table of contents
and section headers — use them purely to locate a section's content within
the whole-document text you already loaded in Step 2.

| Section | Title | Pages |
|---|---|---|
| 1 | Introduction and Objectives for Test Automation | 1-2 |
| 2 | Preparing for Test Automation | 3-6 |
| 3 | Test Automation Architecture | 7-12 |
| 4 | Implementing Test Automation | 13-16 |
| 5 | Implementation and Deployment Strategies for Test Automation | 17-19 |
| 6 | Test Automation Reporting and Metrics | 20-23 |
| 7 | Verifying the Test Automation Solution | 24-27 |
| 8 | Continuous Improvement | 28-33 |

File: `docs/ISTQB_CTAL-TAE_Syllabus_v2.0 - WORKBOOK.pdf`

## Safety — never violate

- **Never write, edit, or delete any file.** This is a read-only drill. No
  question bank writes, no state files — everything lives in the
  conversation.
- `docs/` is read-only per this repo's `CLAUDE.md` — only ever `Read` from
  the syllabus PDF, never pass it to `Write`/`Edit` or any tool with
  overwrite flags.
- No-repeat tracking is session-only. A new session may generate a similar
  question — that's expected, not a bug.
