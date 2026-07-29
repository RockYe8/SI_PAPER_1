# Ticket 001: Build HKSI Practice Exam Site

## Scope

Create the first deployable React/Vite static site that parses Markdown exam batches, lets users complete timed exams, saves local progress, and shows results after submission.

## Acceptance Criteria

- `exams/` contains the current `001` exam and answer Markdown files.
- The app lists available batches discovered from Markdown file pairs.
- Users can start an exam.
- Users can freely navigate between questions and change answers before submission.
- Manual submission is blocked until all questions are answered.
- A 90-minute countdown is shown.
- Expired exams auto-submit with unanswered questions marked incorrect.
- Results show `correct / total` and percentage.
- Results show all question statuses and expand explanations for wrong answers.
- GitHub Actions builds the site and deploys to GitHub Pages.
- Core parser and scoring behavior has automated tests.

## Deferred for speed

- Browser-local progress persistence.
- Paper status tracking on the list page.
- Restart controls beyond returning to the paper list and starting again.
