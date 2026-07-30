# 02 — Capture wrong book records after exam submission

**What to build:** After a learner submits an exam manually or the timer auto-submits it, automatically update the browser-local wrong book from the submitted result. Wrong and blank answers enter the wrong book; questions already in the wrong book are updated according to the local state rules.

**Blocked by:** 01 — Wrong Book local state.

**Status:** ready-for-agent

- [ ] Manual submission updates the wrong book.
- [ ] Timeout auto-submission updates the wrong book.
- [ ] Wrong answers are captured.
- [ ] Blank answers are captured as wrong.
- [ ] Previously wrong questions answered correctly later are marked recently correct, not removed.
- [ ] Existing score and result page behavior still works.
