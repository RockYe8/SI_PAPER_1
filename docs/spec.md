# HKSI Practice Exam Site Spec

## Problem Statement

The user has Markdown-based HKSI Paper 1 practice exams and answers, and wants a simple public GitHub Pages site that turns batches such as `001` through `100` into timed online practice exams.

## Solution

Build a lightweight React/Vite static site. It reads paired Markdown files from `exams/`, lists available batches, lets users take a 90-minute 60-question exam, saves browser-local progress, and shows results after submission.

## User Stories

1. As a learner, I want to choose a paper batch, so that I can practise one complete exam.
2. As a learner, I want English and Cantonese Chinese shown together, so that I can read the original bilingual content.
3. As a learner, I want to jump between questions and revise answers before submitting, so that I can use normal exam strategy.
4. As a learner, I want unfinished manual submissions blocked, so that I know I completed the paper.
5. As a learner, I want the exam to auto-submit when time expires, so that the 90-minute limit is meaningful.
6. As a learner, I want my score as correct count and percentage, so that I can judge performance quickly.
7. As a learner, I want wrong answers explained from the answer file, so that I can review mistakes efficiently.

## Implementation Decisions

- Use React/Vite and GitHub Actions for GitHub Pages deployment.
- Keep all source Markdown files in `exams/`.
- Pair question and answer files by numeric batch id.
- Preserve fixed question order.
- Use A/B/C/D single-choice controls.
- Manual submission requires all questions answered.
- Timer expiry submits current answers and treats blanks as wrong.
- Result page shows all statuses and expands only wrong explanations by default.

## Testing Decisions

- Test the Markdown parser as the main seam.
- Test scoring behavior, especially blank answers.
- Prefer behavior-level tests over implementation-detail tests.

## Out of Scope

- Login, backend, database, private answers, random mode, language switching, local progress persistence, and detailed paper status tracking.
