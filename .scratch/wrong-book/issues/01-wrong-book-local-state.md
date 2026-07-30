# 01 — Wrong Book local state

**What to build:** Create the browser-local wrong book behavior so exam results can create and update wrong question records. A wrong or blank answer creates one record; repeating the same mistake increments the wrong count instead of duplicating it; a later correct answer keeps the record and marks it as recently correct. The learner can remove one item or clear all items.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] A wrong answer creates a wrong book record.
- [ ] A blank answer creates a wrong book record.
- [ ] The same batch/question appears only once.
- [ ] Repeated wrong answers increment `wrongCount`.
- [ ] Later correct answers do not remove the record and mark it as recently correct.
- [ ] Each record stores only batch id, question number, wrong count, latest selected option, latest submitted time, and latest status.
- [ ] Single-item removal works.
- [ ] Clear-all works.
- [ ] Behavior-level tests cover the update and removal rules.
