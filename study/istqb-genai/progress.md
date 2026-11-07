# CT-GenAI study progress

Mastered: 34 / 37 · Learning: 3 · Weak: 0 · Questions answered: 101 (90% correct)

Status values: `new` · `learning` · `weak` · `mastered`

## Learning objectives

| LO | K | Topic | Status | Asked | Correct | Last |
|---|---|---|---|---|---|---|
| 1.1.1 | K1 | AI spectrum: symbolic AI, classical ML, deep learning, GenAI | mastered | 2 | 2 | 2026-11-04 |
| 1.1.2 | K2 | Basics of GenAI and LLMs (tokens, embeddings, context window, transformer) | mastered | 2 | 2 | 2026-11-04 |
| 1.1.3 | K2 | Foundation vs instruction-tuned vs reasoning LLMs | mastered | 2 | 2 | 2026-11-04 |
| 1.1.4 | K2 | Multimodal LLMs / vision-language models for test tasks | mastered | 2 | 2 | 2026-11-04 |
| 1.2.1 | K2 | Key LLM capabilities for test tasks | mastered | 2 | 2 | 2026-11-04 |
| 1.2.2 | K2 | Interaction models: AI chatbots vs LLM-powered testing apps | mastered | 4 | 3 | 2026-11-07 |
| 2.1.1 | K2 | Prompt structure: role, context, instruction, input data, constraints, output format | learning | 8 | 5 | 2026-11-07 |
| 2.1.2 | K2 | Prompt chaining, few-shot prompting, meta prompting | learning | 6 | 4 | 2026-11-07 |
| 2.1.3 | K2 | System prompt vs user prompt | mastered | 2 | 2 | 2026-11-04 |
| 2.2.1 | K3 | GenAI for test analysis | mastered | 3 | 3 | 2026-11-04 |
| 2.2.2 | K3 | GenAI for test design and test implementation | mastered | 3 | 3 | 2026-11-04 |
| 2.2.3 | K3 | GenAI for automated regression testing | mastered | 5 | 4 | 2026-11-07 |
| 2.2.4 | K3 | GenAI for test monitoring and test control | mastered | 5 | 4 | 2026-11-07 |
| 2.2.5 | K3 | Choosing prompting techniques for a context | mastered | 3 | 3 | 2026-11-05 |
| 2.3.1 | K2 | Metrics for evaluating GenAI results on test tasks | mastered | 2 | 2 | 2026-11-05 |
| 2.3.2 | K2 | Evaluating and iteratively refining prompts | mastered | 2 | 2 | 2026-11-05 |
| 3.1.1 | K1 | Definitions: hallucinations, reasoning errors, biases | mastered | 2 | 2 | 2026-11-05 |
| 3.1.2 | K3 | Identify hallucinations, reasoning errors, biases in LLM output | mastered | 3 | 3 | 2026-11-05 |
| 3.1.3 | K2 | Mitigation of hallucinations, reasoning errors, biases | mastered | 2 | 2 | 2026-11-05 |
| 3.1.4 | K1 | Mitigation of non-deterministic behaviour | mastered | 2 | 2 | 2026-11-05 |
| 3.2.1 | K2 | Data privacy and security risks of GenAI | learning | 7 | 5 | 2026-11-07 |
| 3.2.2 | K2 | Privacy issues and vulnerabilities in GenAI test processes/tools | mastered | 2 | 2 | 2026-11-07 |
| 3.2.3 | K2 | Mitigation strategies for privacy and security | mastered | 2 | 2 | 2026-11-07 |
| 3.3.1 | K2 | Energy consumption and CO2 impact | mastered | 2 | 2 | 2026-11-07 |
| 3.4.1 | K1 | AI regulations, standards, best-practice frameworks | mastered | 2 | 2 | 2026-11-07 |
| 4.1.1 | K2 | Architecture components of LLM-powered test infrastructure | mastered | 2 | 2 | 2026-11-07 |
| 4.1.2 | K2 | Retrieval-Augmented Generation (RAG) | mastered | 2 | 2 | 2026-11-07 |
| 4.1.3 | K2 | LLM-powered agents in test automation | mastered | 2 | 2 | 2026-11-07 |
| 4.2.1 | K2 | Fine-tuning LLMs for test tasks | mastered | 2 | 2 | 2026-11-07 |
| 4.2.2 | K2 | LLMOps | mastered | 2 | 2 | 2026-11-07 |
| 5.1.1 | K1 | Risks of shadow AI | mastered | 2 | 2 | 2026-11-07 |
| 5.1.2 | K2 | Key aspects of a GenAI strategy for testing | mastered | 2 | 2 | 2026-11-07 |
| 5.1.3 | K2 | Selecting LLMs/SLMs for test tasks | mastered | 2 | 2 | 2026-11-07 |
| 5.1.4 | K1 | Phases of GenAI adoption | mastered | 2 | 2 | 2026-11-07 |
| 5.2.1 | K2 | Essential skills and knowledge for testing with GenAI | mastered | 2 | 2 | 2026-11-07 |
| 5.2.2 | K1 | Building GenAI capabilities in test teams | mastered | 2 | 2 | 2026-11-07 |
| 5.2.3 | K1 | Evolving test processes and responsibilities | mastered | 2 | 2 | 2026-11-07 |

## Missed questions

<!-- - 2026-11-04 · 2.1.2 · Q: technique where output of one prompt feeds the next · you: few-shot · correct: prompt chaining (sequential decomposition) -->

- 2026-11-04 · 1.2.2 · Q: nightly automated test data for 300 suites — best fit and why · you: d (LLM app, no prompt engineering needed) · correct: c — LLM app via APIs = scalability/customisation; prompt engineering required for BOTH chatbots and LLM apps · ✅ fixed 2026-11-07 (review Q: overnight CI failure analysis, 40 projects → LLM app + prompts still needed)
- 2026-11-04 · 2.1.1 · Q: "here is an example test case from our suite" — which prompt component · you: c (context) · correct: b input data — syllabus lists existing test cases / output examples under input data; context = background on test object & feature · ✅ fixed 2026-11-04 (bonus Q: identified context correctly)
- 2026-11-04 · 2.1.2 · Q: prompt with ONE example (requirement → 4 test conditions), then new requirement · you: a (few-shot) · correct: d one-shot — count input→output example PAIRS, not items inside the example · ✅ fixed 2026-11-04 (bonus Q: 2 pairs → few-shot)
- 2026-11-04 · 2.2.3 · Q: 2,000-test / 6 h CI suite slows delivery on small commits — best GenAI use · you: b (self-healing) · correct: a impact analysis → targeted regression on high-risk areas. Self-healing fixes flaky failures from minor UI/API changes, not execution time · ✅ fixed 2026-11-07 (review Q: 4,500 API tests / 5 h → impact analysis)
- 2026-11-05 · 2.2.4 · Q: release finished, integration tests started too late — make NEXT release benefit · you: a (test control) · correct: c test completion insights (lessons learned → refine strategy). Control acts on the CURRENT release only · ✅ fixed 2026-11-07 (review Q: release deployed, future releases → completion insights)
- 2026-11-07 · 2.1.1 · Q: pharmacy prompt — bold 1 "system is an online pharmacy; testing prescription-upload feature" + bold 2 pasted user story/AC · you: b (input data, then context) · correct: a context, then input data — sentence DESCRIBING system/feature = context; pasted artefact = input data · ✅ fixed 2026-11-07 (bonus Q: B2B invoicing feature sentence → context)
- 2026-11-07 · 2.1.1 · Q: pasted complete Cypress test as "example of the output style we expect" · you: a (output format) · correct: b input data — syllabus lists "output examples" under input data; output format = DESCRIBED spec of shape (table, JSON, columns) · ✅ fixed 2026-11-07 (bonus Q: JSON spec sentence → output format; pasted sample report → input data)
- 2026-11-07 · 2.1.2 · Q: ONE example (password-reset story → 5 TCs), then new story · you: a (few-shot, "5 test cases") · correct: d one-shot — SAME mistake as 2026-11-04: counting output items instead of input→output pairs · ✅ fixed 2026-11-07 (bonus Q: 2 bug-report pairs → few-shot)
- 2026-11-05 · 3.2.1 · Q: vendor stores/processes prompts with real customer data, no consent, no opt-out · you: a (compliance risk) · correct: b lack of control over data usage — "without explicit user consent or control" is its definition; compliance risk = possible legal disputes from not following GDPR, and nothing happens "automatically" · ✅ fixed 2026-11-07 (bonus Q: SaaS contract retains docs, no opt-out → lack of control)
- 2026-11-05 · 3.2.1 · Q: LLM summary of failed login tests contains real customer email/phone, no attack · you: b (lack of control) · correct: a unintentional data exposure — the problem is in the OUTPUT (it revealed data); lack of control = how the tool STORES/PROCESSES data behind the scenes · ✅ fixed 2026-11-07 (bonus Q: fine-tuned LLM outputs customer address → exposure)

## Notes / confusions

- Picked right category but wrong justification (1.2.2) — read the "because…" part; absolute claims like "doesn't need prompt engineering" are false.
- Context vs input data (2.1.1, missed twice — 2nd time swapped them the other way): treats example/reference material as context. Test: "could I attach it as a file?" yes → input data; a sentence describing the test object/feature → context. Rule: concrete material the LLM works with or imitates (stories, AC, code, screenshots, existing TCs, output examples) = input data; background about system/feature = context.
- Output example vs output format (2.1.1): a pasted EXAMPLE of desired output = input data (syllabus lists "output examples"); a WRITTEN SPEC of the shape ("Markdown table: ID, Steps, Expected", "JSON") = output format. Same attach-as-file test.
- One-shot vs few-shot (2.1.2, REPEATED 2026-11-07 — persistent): counted the 4 test conditions as 4 examples. Count how many times the word "Input" (a source artefact) appears with its own output. Count example input→output pairs: 1 pair = one-shot, 2+ = few-shot, 0 = zero-shot.
- Regression activities (2.2.3): match problem → activity. Too slow / too many tests → impact analysis. Broken locators / minor API changes → self-healing. Need insight → reporting. Need defect detail → defect reporting/RCA.
- Monitoring/control/completion (2.2.4): check the TIME frame. Ongoing release + detect → monitoring; ongoing release + act → control; finished release + future improvement → completion insights / lessons learned.
- Privacy concerns (3.2.1, missed twice in opposite directions): ask WHERE the problem is — in the OUTPUT (data shown to someone) → unintentional exposure; in STORAGE/PROCESSING behind the scenes (no consent/opt-out) → lack of control; regulation/legal → compliance. Choose the concern that matches the DESCRIBED FACT, not a possible consequence. No consent/control over storage → lack of control; output leaks data → unintentional exposure; regulation/legal dispute named → compliance. Absolute words ("automatically") are a red flag.
- Exam technique: on "select TWO" once gave only one letter — always count required answers before submitting.

## Session log

- 2026-11-04 · Chapter 1 complete (1.1.1–1.2.2) · 11/12 (92%) · 1.2.2 weak (review) · then Section 2.1 (2.1.1–2.1.3) · then 2.2.1–2.2.2 mastered · total 23/26 (88%) · 2.1.1, 2.1.2 learning · resume at 2.2.3
- 2026-11-05 · 2.2.3–2.2.5 (Section 2.2 complete) · then 2.3.1–2.3.2 mastered → Chapter 2 complete · 11/13 today · total 34/39 (87%) · missed: impact analysis (2.2.3), completion vs control (2.2.4) · next: Review (1.2.2 weak; 2.1.1, 2.1.2, 2.2.3, 2.2.4 learning) or start 3.1.1
- 2026-11-05 · Section 3.1 complete (3.1.1–3.1.4 mastered, 9/9) · started 3.2.1 (privacy vs security risks) · resumed 2026-11-07
- 2026-11-07 · 3.2.1–3.4.1 → Chapter 3 complete · 3.2.1 learning (privacy concern mix-ups, both misses fixed via bonus Qs) · 3.2.2–3.4.1 mastered · total 54/61 (89%) · next: Chapter 4 (4.1.1) or Review
- 2026-11-07 · Chapter 4 complete (4.1.1–4.2.2 all mastered, 10/10) · total 64/71 (90%) · next: Chapter 5 (5.1.1) or Review
- 2026-11-07 · Chapter 5 complete (5.1.1–5.2.3 all mastered, 14/14) → WHOLE SYLLABUS TAUGHT · total 78/85 (92%) · 31/37 mastered · next: Review (1.2.2 weak; 2.1.1, 2.1.2, 2.2.3, 2.2.4, 3.2.1 learning; 3 unfixed missed Qs) then mock exam in app
- 2026-11-07 · REVIEW of 6 non-mastered LOs · 1.2.2, 2.2.3, 2.2.4 → mastered (all old misses fixed) · 2.1.1 learning 5/8 (context↔input data, output example = input data) · 2.1.2 learning 4/6 (one-shot counting repeated once, then fixed) · 3.2.1 learning 5/7 · review 13/16 · total 91/101 (90%) · next: short review of 2.1.1, 2.1.2, 3.2.1 (need ~2–3 more correct each for 75%) then mock exam in app

<!-- - 2026-11-04 · LOs 1.1.1–1.1.2 · 4/5 · resume at 1.1.3 -->
