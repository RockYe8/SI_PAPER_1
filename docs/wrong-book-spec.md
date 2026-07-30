# Wrong Book / 错题本 Spec

## Problem Statement

Learners using the HKSI Paper 1 practice exam site need a simple way to review questions they previously answered incorrectly. The site is hosted on GitHub Pages as a static React/Vite app, so the feature must not require a backend, database, account system, or GitHub-side configuration beyond the existing deployment.

## Solution

Add a browser-local `Wrong Book / 错题本` feature. When a learner submits an exam, the app automatically records each wrong or blank question in the learner's current browser. The wrong book stores only minimal tracking data and reads the latest question text, correct answer, explanation, and source from the current bundled exam data.

The homepage will include a clear `Wrong Book / 错题本` entry. The wrong book page will list saved wrong questions, show the learner's latest selected answer, correct answer, wrong count, latest status, explanation, and source, and allow removing individual questions or clearing the wrong book.

## User Stories

1. As a learner, I want wrong questions to be added automatically after I submit an exam, so that I do not need to manually collect them.
2. As a learner, I want unanswered questions from an auto-submitted timeout exam to enter the wrong book, so that blank questions are not lost during review.
3. As a learner, I want each wrong question to appear only once, so that the wrong book stays readable.
4. As a learner, I want repeated mistakes on the same question to increase a wrong count, so that I can identify questions I keep missing.
5. As a learner, I want the wrong book to remember my latest selected answer, so that I can understand my most recent mistake pattern.
6. As a learner, I want a later correct answer to mark the item as recently correct without removing it, so that one correct attempt does not erase useful review history.
7. As a learner, I want to manually remove a question after I have mastered it, so that I control when it leaves the wrong book.
8. As a learner, I want to clear the entire wrong book, so that I can reset local review history when needed.
9. As a learner, I want the wrong book to show the latest question text and explanation from the current exam files, so that corrections to the question bank are reflected automatically.
10. As a learner, I want the wrong book to work on GitHub Pages without login, so that the site remains simple and free to host.
11. As a learner, I understand that the wrong book is stored only in my current browser, so that I know it will not sync across devices.
12. As a learner, I want a visible `Wrong Book / 错题本` button on the homepage, so that I can enter review mode without first starting an exam.

## Implementation Decisions

- Keep the site static. Do not add a backend, database, authentication, or server-side storage.
- Store wrong book records in browser local storage.
- Use one stable record per question, keyed by exam batch id and question number.
- Store only minimal local data: batch id, question number, wrong count, latest selected option, latest submitted time, and latest status.
- Do not store question text, answer text, correct answer, explanation, or source in local storage.
- Derive display content by joining local wrong book records with the current loaded exam batches.
- Add wrong or blank answers after both manual submission and timeout auto-submission.
- If the question is already in the wrong book and is answered wrong again, increment the wrong count and update the latest selected option and timestamp.
- If the question is already in the wrong book and is answered correctly later, keep the record, update the latest selected option and timestamp, and mark the latest status as recently correct.
- Do not automatically remove recently correct questions.
- Provide explicit controls to remove one wrong book item or clear all wrong book items.
- Add a homepage button labelled `Wrong Book / 错题本`.
- Do not build a wrong-question practice mode in the first version.

## Testing Decisions

- Test at the highest useful seam: a wrong book storage/update module that consumes an exam submission result and produces the next wrong book state.
- Tests should cover external behavior rather than local storage implementation details.
- Test that a new wrong answer creates one record.
- Test that a repeated wrong answer for the same batch and question increments `wrongCount` instead of duplicating the record.
- Test that a later correct answer keeps the record and changes latest status to recently correct.
- Test that a blank answer is treated as wrong when updating the wrong book.
- Test that remove-one and clear-all behaviors produce the expected state.
- Existing parser and scoring tests remain prior art for small behavior-level tests in this codebase.

## Out of Scope

- Cross-device sync.
- User accounts.
- Database storage.
- Cloud backup.
- Wrong-question-only practice mode.
- Export/import of wrong book data.
- Detailed analytics beyond wrong count and latest status.
- Hiding answers from technically advanced users; the site remains a public static question bank.

## Further Notes

The local nature of the wrong book should be visible enough in UI copy to avoid misunderstanding. A concise note such as "Saved in this browser only" is sufficient.
