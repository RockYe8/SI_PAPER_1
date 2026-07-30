import assert from "node:assert/strict";

import {
  clearWrongBook,
  removeWrongBookItem,
  updateWrongBookFromResult,
} from "../src/lib/wrongBook.js";

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

const submittedAt = "2026-07-30T10:00:00.000Z";

runTest("wrong and blank answers create minimal wrong book records", () => {
  const records = updateWrongBookFromResult({
    existingRecords: [],
    batchId: "001",
    submittedAt,
    resultItems: [
      { number: 1, selectedOption: "A", correctOption: "B", isCorrect: false },
      { number: 2, selectedOption: null, correctOption: "C", isCorrect: false },
      { number: 3, selectedOption: "D", correctOption: "D", isCorrect: true },
    ],
  });

  assert.deepEqual(records, [
    {
      batchId: "001",
      questionNumber: 1,
      wrongCount: 1,
      latestSelectedOption: "A",
      latestSubmittedAt: submittedAt,
      latestStatus: "wrong",
    },
    {
      batchId: "001",
      questionNumber: 2,
      wrongCount: 1,
      latestSelectedOption: null,
      latestSubmittedAt: submittedAt,
      latestStatus: "wrong",
    },
  ]);
});

runTest("repeated wrong answer increments wrong count without duplicating", () => {
  const records = updateWrongBookFromResult({
    existingRecords: [
      {
        batchId: "001",
        questionNumber: 1,
        wrongCount: 1,
        latestSelectedOption: "A",
        latestSubmittedAt: submittedAt,
        latestStatus: "wrong",
      },
    ],
    batchId: "001",
    submittedAt: "2026-07-30T11:00:00.000Z",
    resultItems: [
      { number: 1, selectedOption: "C", correctOption: "B", isCorrect: false },
    ],
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].wrongCount, 2);
  assert.equal(records[0].latestSelectedOption, "C");
  assert.equal(records[0].latestStatus, "wrong");
});

runTest("later correct answer keeps record and marks recently correct", () => {
  const records = updateWrongBookFromResult({
    existingRecords: [
      {
        batchId: "001",
        questionNumber: 1,
        wrongCount: 2,
        latestSelectedOption: "C",
        latestSubmittedAt: submittedAt,
        latestStatus: "wrong",
      },
    ],
    batchId: "001",
    submittedAt: "2026-07-30T12:00:00.000Z",
    resultItems: [
      { number: 1, selectedOption: "B", correctOption: "B", isCorrect: true },
    ],
  });

  assert.equal(records.length, 1);
  assert.equal(records[0].wrongCount, 2);
  assert.equal(records[0].latestSelectedOption, "B");
  assert.equal(records[0].latestStatus, "recently_correct");
});

runTest("remove one and clear all update records", () => {
  const records = [
    { batchId: "001", questionNumber: 1, wrongCount: 1 },
    { batchId: "002", questionNumber: 1, wrongCount: 1 },
  ];

  assert.deepEqual(removeWrongBookItem(records, "001", 1), [
    { batchId: "002", questionNumber: 1, wrongCount: 1 },
  ]);
  assert.deepEqual(clearWrongBook(), []);
});
