import {
  mergeExamAndAnswers,
  parseAnswerMarkdown,
  parseExamMarkdown,
} from "../lib/examParser.js";

const examModules = import.meta.glob("../../exams/*_exam_*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const answerModules = import.meta.glob("../../exams/*_answer_*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

function batchIdFromPath(path) {
  return path.match(/_(?:exam|answer)_(\d+)\.md$/)?.[1] ?? null;
}

function titleFromPath(path, batchId) {
  const fileName = path.split(/[\\/]/).pop() ?? path;
  return fileName
    .replace(new RegExp(`_exam_${batchId}\\.md$`), "")
    .replaceAll("_", " ");
}

export function loadExamBatches() {
  return Object.entries(examModules)
    .map(([examPath, examMarkdown]) => {
      const batchId = batchIdFromPath(examPath);
      const answerEntry = Object.entries(answerModules).find(
        ([answerPath]) => batchIdFromPath(answerPath) === batchId,
      );

      if (!batchId || !answerEntry) return null;

      const [, answerMarkdown] = answerEntry;
      const questions = parseExamMarkdown(examMarkdown);
      const answers = parseAnswerMarkdown(answerMarkdown);

      return {
        id: batchId,
        title: `${titleFromPath(examPath, batchId)} ${batchId}`,
        questions: mergeExamAndAnswers(questions, answers),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.id.localeCompare(b.id));
}
