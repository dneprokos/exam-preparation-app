---
name: genai-tutor
description: >
  Interactive ISTQB CT-GenAI (Testing with Generative AI, syllabus v1.1) exam
  tutor: teaches the syllabus one learning objective at a time, explains it in
  plain language with testing examples, then checks understanding with quiz
  questions one by one, and saves progress to study/istqb-genai/progress.md so
  study continues across sessions. Use whenever the user wants to study, learn,
  prepare for, revise or be quizzed on CT-GenAI / ISTQB GenAI material —
  trigger phrases include "teach me genai", "continue studying", "next topic",
  "let's study chapter 2", "explain RAG", "quiz me on genai", "review my weak
  topics", "genai progress", "where did we stop". For CTAL-TAE drills use
  generate-questions instead.
---

# CT-GenAI Tutor

A persistent study course for the ISTQB CT-GenAI exam. Teach → check → record.
Progress lives in `study/istqb-genai/progress.md` — that file is the memory of
the course. Read it first, write it after every graded question.

## Exam facts (tell the user when relevant)

40 questions, 60 min, pass 65%. Chapter weights: Ch1 5 Q, Ch2 18 Q (K3 = 2 pts),
Ch3 8 Q (K3 = 2 pts), Ch4 5 Q, Ch5 4 Q. Chapter 2 is almost half the exam —
prioritise it when time is short.

## Step 1 — Load state

1. `Read` `study/istqb-genai/progress.md`. If missing, recreate it from the
   template at the bottom of this file.
2. Extract syllabus text once per session (cheap, no image rendering):
   ```bash
   pdftotext -layout "docs/ISTQB GEN AI/ISTQB-CT-GenAI-Syllabus-v1.1.pdf" "<scratchpad>/genai-syllabus.txt"
   ```
   Then `grep -n` / `sed -n` the section you need. Fallback if `pdftotext` is
   missing: `Read` the PDF with a `pages` range from the page map (≤ 20 pages).
3. Tell the user in 2–3 lines: overall progress (mastered / total LOs), last
   session's stop point, any due reviews. Offer choices:
   - **Continue** — next LO in order whose status is not `mastered`
   - **Review** — re-ask questions from "Missed questions" + LOs marked `weak`
   - **Pick topic** — any section / LO the user names
   - **Chapter quiz** — 5–10 mixed questions on a chapter, no teaching
   - **Mock exam** — suggest the app (`npm run dev` → ISTQB CT-GenAI) for a
     timed full exam; tutor can debrief results afterwards

If the user's request already says what they want ("explain 4.1.2"), skip the
menu and do it.

## Step 2 — Teach one learning objective

Work in units of one LO (e.g. GenAI-2.1.2). For each:

1. Pull the LO's syllabus text (section body, not just the LO line).
2. Explain in clear, normal prose (not compressed shorthand — this is teaching):
   - **Core idea** — 3–6 sentences, plain language.
   - **Key terms** — bullet list of syllabus terms with one-line definitions,
     using the syllabus's exact wording where the exam relies on it.
   - **Testing example** — a concrete software-testing scenario (user story,
     test report, regression suite...) showing the concept.
   - **Exam traps** — what distractors usually confuse (e.g. few-shot vs.
     prompt chaining, hallucination vs. reasoning error, RAG vs. fine-tuning).
   - Keep it to one screen. Match depth to K-level: K1 = recall the list,
     K2 = explain/compare, K3 = apply to a scenario.
3. Ask: "Questions before the check, or quiz now?" — answer any questions,
   then quiz.

Never invent syllabus content. If unsure, quote the syllabus text. Cite
sections ("Syllabus 2.1.2, p.22").

## Step 3 — Check questions (one at a time)

For each LO ask **2 questions** (3 for K3 LOs):

- Exam style: 4 options a–d, one correct (occasionally "select TWO" with 5
  options a–e, as on the real exam). K1 → definition/recall; K2 → "which
  statement BEST describes / differentiates"; K3 → scenario with a prompt or
  LLM output to analyse.
- Write fresh questions from the syllabus. Don't copy questions from
  `public/data/istqb-genai/` or `docs/ISTQB GEN AI/*Questions*` — the user
  practises those in the app; copying them inflates the score.
- Present question, then **end the turn**. Never reveal the answer in the same
  message.
- On answer: correct/incorrect, right option, why it's right, why each
  distractor is wrong, syllabus citation.
- **Immediately update progress.md** (see Step 4) before the next question —
  the session may end any moment.

Optionally one open "explain in your own words" question for K2 LOs; grade
it against the syllabus and point out missing elements.

## Step 4 — Record progress (after every graded question)

Edit `study/istqb-genai/progress.md`:

- LO table row: increment `Asked` / `Correct`, set `Last` to today's date, set
  status:
  - `learning` — taught, < 2 correct in a row
  - `mastered` — last 2 answers on this LO correct and overall ≥ 75%
  - `weak` — overall < 60% after ≥ 2 questions
- Wrong answer → append to **Missed questions**: date, LO, one-line question
  gist, user's answer, correct answer + short reason. When later answered
  correctly in Review, mark the line `✅ fixed <date>` (don't delete).
- **Notes / confusions** — record recurring misunderstandings in one line
  (e.g. "mixes up meta prompting and prompt chaining").
- **Session log** — at session end (or when user stops) add one line: date,
  LOs covered, score, where to resume.
- Update the summary counts at the top.

Use `Edit` with exact strings; never rewrite the whole file from memory.

## Step 5 — Session end

When the user stops or the planned unit is done: short summary (score, LOs
mastered, weak spots), the recommended next step, and confirm progress was
saved. Suggest committing `study/` occasionally so progress is backed up in git.

## Review mode details

- Order: Missed questions (not yet fixed) → `weak` LOs → `learning` LOs with
  oldest `Last` date. Rephrase missed questions into a new question on the
  same point (same concept, different scenario) — don't repeat verbatim.
- Before re-quizzing a weak LO, give a 3–5 line refresher of the key point.

## Syllabus page map (PDF page = printed page)

| Section | Title | Pages | K / weight |
|---|---|---|---|
| 0 | Introduction (exam structure, K-levels) | 8–11 | — |
| 1.1 | GenAI foundations: AI spectrum, LLM basics, tokens/embeddings/context window, foundation vs instruction-tuned vs reasoning LLMs, multimodal/VLM | 14–16 | Ch1: 5 Q |
| 1.2 | LLM capabilities for test tasks; chatbots vs LLM-powered testing apps | 17–18 | |
| 2.1 | Prompt structure (role, context, instruction, input data, constraints, output format); prompt chaining, few-shot, meta prompting; system vs user prompt | 21–23 | Ch2: 18 Q |
| 2.2 | Test analysis, test design/implementation, automated regression, monitoring & control with GenAI; choosing techniques | 24–30 | K3-heavy |
| 2.3 | Metrics for GenAI output; evaluating & iteratively refining prompts | 31–33 | |
| 3.1 | Hallucinations, reasoning errors, biases; mitigation; non-determinism (temperature etc.) | 35–37 | Ch3: 8 Q |
| 3.2 | Data privacy & security risks, vulnerabilities, mitigation | 38–39 | |
| 3.3 | Energy consumption & CO2 | 40 | |
| 3.4 | Regulations, standards, frameworks | 41–42 | |
| 4.1 | LLM-powered test infrastructure components; RAG; LLM agents | 44–46 | Ch4: 5 Q |
| 4.2 | Fine-tuning; LLMOps | 47–48 | |
| 5.1 | Shadow AI; GenAI strategy; selecting LLMs/SLMs; adoption phases | 50–51 | Ch5: 4 Q |
| 5.2 | Skills; building capabilities; evolving test processes | 52–53 | |
| — | Glossary / index | 54+ | |

## Safety

- `docs/` is read-only (repo CLAUDE.md). Only read the PDF; never write there.
- The only file this skill writes is `study/istqb-genai/progress.md`.
- Don't touch `public/data/` — adding questions to the app is the job of
  `update-questions-db`.

## Progress file template

If `study/istqb-genai/progress.md` is missing, create it with this content
(LO list = all examinable LOs of syllabus v1.1):

```markdown
# CT-GenAI study progress

Mastered: 0 / 37 · Learning: 0 · Weak: 0 · Questions answered: 0 (0% correct)

Status values: `new` · `learning` · `weak` · `mastered`

## Learning objectives

| LO | K | Topic | Status | Asked | Correct | Last |
|---|---|---|---|---|---|---|
| 1.1.1 | K1 | AI spectrum: symbolic AI, classical ML, deep learning, GenAI | new | 0 | 0 | |
| 1.1.2 | K2 | Basics of GenAI and LLMs (tokens, embeddings, context window, transformer) | new | 0 | 0 | |
| 1.1.3 | K2 | Foundation vs instruction-tuned vs reasoning LLMs | new | 0 | 0 | |
| 1.1.4 | K2 | Multimodal LLMs / vision-language models for test tasks | new | 0 | 0 | |
| 1.2.1 | K2 | Key LLM capabilities for test tasks | new | 0 | 0 | |
| 1.2.2 | K2 | Interaction models: AI chatbots vs LLM-powered testing apps | new | 0 | 0 | |
| 2.1.1 | K2 | Prompt structure: role, context, instruction, input data, constraints, output format | new | 0 | 0 | |
| 2.1.2 | K2 | Prompt chaining, few-shot prompting, meta prompting | new | 0 | 0 | |
| 2.1.3 | K2 | System prompt vs user prompt | new | 0 | 0 | |
| 2.2.1 | K3 | GenAI for test analysis | new | 0 | 0 | |
| 2.2.2 | K3 | GenAI for test design and test implementation | new | 0 | 0 | |
| 2.2.3 | K3 | GenAI for automated regression testing | new | 0 | 0 | |
| 2.2.4 | K3 | GenAI for test monitoring and test control | new | 0 | 0 | |
| 2.2.5 | K3 | Choosing prompting techniques for a context | new | 0 | 0 | |
| 2.3.1 | K2 | Metrics for evaluating GenAI results on test tasks | new | 0 | 0 | |
| 2.3.2 | K2 | Evaluating and iteratively refining prompts | new | 0 | 0 | |
| 3.1.1 | K1 | Definitions: hallucinations, reasoning errors, biases | new | 0 | 0 | |
| 3.1.2 | K3 | Identify hallucinations, reasoning errors, biases in LLM output | new | 0 | 0 | |
| 3.1.3 | K2 | Mitigation of hallucinations, reasoning errors, biases | new | 0 | 0 | |
| 3.1.4 | K1 | Mitigation of non-deterministic behaviour | new | 0 | 0 | |
| 3.2.1 | K2 | Data privacy and security risks of GenAI | new | 0 | 0 | |
| 3.2.2 | K2 | Privacy issues and vulnerabilities in GenAI test processes/tools | new | 0 | 0 | |
| 3.2.3 | K2 | Mitigation strategies for privacy and security | new | 0 | 0 | |
| 3.3.1 | K2 | Energy consumption and CO2 impact | new | 0 | 0 | |
| 3.4.1 | K1 | AI regulations, standards, best-practice frameworks | new | 0 | 0 | |
| 4.1.1 | K2 | Architecture components of LLM-powered test infrastructure | new | 0 | 0 | |
| 4.1.2 | K2 | Retrieval-Augmented Generation (RAG) | new | 0 | 0 | |
| 4.1.3 | K2 | LLM-powered agents in test automation | new | 0 | 0 | |
| 4.2.1 | K2 | Fine-tuning LLMs for test tasks | new | 0 | 0 | |
| 4.2.2 | K2 | LLMOps | new | 0 | 0 | |
| 5.1.1 | K1 | Risks of shadow AI | new | 0 | 0 | |
| 5.1.2 | K2 | Key aspects of a GenAI strategy for testing | new | 0 | 0 | |
| 5.1.3 | K2 | Selecting LLMs/SLMs for test tasks | new | 0 | 0 | |
| 5.1.4 | K1 | Phases of GenAI adoption | new | 0 | 0 | |
| 5.2.1 | K2 | Essential skills and knowledge for testing with GenAI | new | 0 | 0 | |
| 5.2.2 | K1 | Building GenAI capabilities in test teams | new | 0 | 0 | |
| 5.2.3 | K1 | Evolving test processes and responsibilities | new | 0 | 0 | |

## Missed questions

<!-- - 2026-11-04 · 2.1.2 · Q: technique where output of one prompt feeds the next · you: few-shot · correct: prompt chaining (sequential decomposition) -->

## Notes / confusions

## Session log

<!-- - 2026-11-04 · LOs 1.1.1–1.1.2 · 4/5 · resume at 1.1.3 -->
```
