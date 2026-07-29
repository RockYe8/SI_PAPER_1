import assert from "node:assert/strict";

import {
  parseAnswerMarkdown,
  parseExamMarkdown,
  scoreSubmission,
} from "../src/lib/examParser.js";

const examMarkdown = `HKSI Paper 1 - Practice Exam (Batch 1: Questions 1-2)
Question 1 (Topic 1)
English: Which statement is correct?
I. First statement.
II. Second statement.
A. One only
B. Two only
C. Both
D. Neither
廣東話: 邊個講法啱？
A. 只有一
B. 只有二
C. 兩個都係
D. 兩個都唔係
Question 2 (Topic 2)
English: Pick the best option.
A. Alpha
B. Beta
C. Gamma
D. Delta
廣東話: 揀最好嘅答案。
A. 甲
B. 乙
C. 丙
D. 丁`;

const answerMarkdown = `Answers and Explanations (Batch 1: Q1 - Q2)
Question 1
Result: Correct Option: C (Both)
Explanation:
C is correct because both statements are valid.
Source: Manual Chapter 1.
Question 2
Result: Correct Option: B
Explanation:
B is the best answer.
Source: Manual Chapter 2.`;

const boldAnswerMarkdown = `**Question 1**
**Correct Option:** **B (I, II and III only)** [95]
**Explanation:** Under Part X of the SFO, the SFC can issue Intervention Notices directly. It cannot wind up a company directly.
**中文解釋:** 根據《證券及期貨條例》第 X 部，證監會可直接發出干預通知，但無權直接命令公司清盤。
**Source:** Study Manual Chapter 10, Sections 204-206 and 212.
## Question 2
**Correct Option:** **A**
**Explanation:** A is correct.
**中文解釋:** A 正確。
**Source:** Study Manual Chapter 1.`;

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runTest("parseExamMarkdown preserves bilingual body and extracts A-D options", () => {
  const questions = parseExamMarkdown(examMarkdown);

  assert.equal(questions.length, 2);
  assert.equal(questions[0].number, 1);
  assert.match(questions[0].prompt, /Which statement is correct/);
  assert.match(questions[0].prompt, /廣東話/);
  assert.deepEqual(questions[0].options, {
    A: "One only\n只有一",
    B: "Two only\n只有二",
    C: "Both\n兩個都係",
    D: "Neither\n兩個都唔係",
  });
});

runTest("parseAnswerMarkdown extracts correct option, explanation, and source", () => {
  const answers = parseAnswerMarkdown(answerMarkdown);

  assert.equal(answers.get(1).correctOption, "C");
  assert.match(answers.get(1).explanation, /both statements/);
  assert.equal(answers.get(1).source, "Manual Chapter 1.");
});

runTest("parseAnswerMarkdown accepts bold answer labels and inline explanations", () => {
  const answers = parseAnswerMarkdown(boldAnswerMarkdown);

  assert.equal(answers.size, 2);
  assert.equal(answers.get(1).correctOption, "B");
  assert.match(answers.get(1).explanation, /Intervention Notices/);
  assert.match(answers.get(1).explanation, /中文解釋/);
  assert.equal(answers.get(1).source, "Study Manual Chapter 10, Sections 204-206 and 212.");
});

runTest("scoreSubmission treats missing answers as incorrect", () => {
  const result = scoreSubmission(
    [
      { number: 1, correctOption: "C" },
      { number: 2, correctOption: "B" },
    ],
    { 1: "C" },
  );

  assert.equal(result.correctCount, 1);
  assert.equal(result.total, 2);
  assert.equal(result.percentage, 50);
  assert.equal(result.items[1].isCorrect, false);
  assert.equal(result.items[1].selectedOption, null);
});
