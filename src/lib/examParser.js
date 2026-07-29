const QUESTION_HEADING = /^\s*(?:\*\*)?Question\s+(\d+)\b.*$/gim;
const OPTION_LINE = /^([A-D])\.\s+(.+)$/;

function splitQuestionBlocks(markdown) {
  const matches = [...markdown.matchAll(QUESTION_HEADING)];

  return matches.map((match, index) => {
    const start = match.index;
    const end = matches[index + 1]?.index ?? markdown.length;
    return markdown.slice(start, end).trim();
  });
}

function cleanLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
}

function stripMarkdownEmphasis(text) {
  return text.replace(/\*\*/g, "").trim();
}

function labelMatch(line, label) {
  const normalized = stripMarkdownEmphasis(line);
  return normalized.match(new RegExp(`^${label}:\\s*(.*)$`, "i"));
}

function sourceMatch(line) {
  const normalized = stripMarkdownEmphasis(line);
  return normalized.match(/^Source:\s*(.*)$/i);
}

export function parseExamMarkdown(markdown) {
  return splitQuestionBlocks(markdown).map((block) => {
    const lines = cleanLines(block);
    const heading = lines[0] ?? "";
    const number = Number(heading.match(/^Question\s+(\d+)/i)?.[1]);
    const optionLines = [];
    const promptLines = [];

    for (const line of lines.slice(1)) {
      const optionMatch = line.match(OPTION_LINE);
      if (optionMatch) {
        optionLines.push({ key: optionMatch[1], text: optionMatch[2].trim() });
      } else {
        promptLines.push(line);
      }
    }

    const groupedOptions = { A: [], B: [], C: [], D: [] };
    for (const optionLine of optionLines) {
      groupedOptions[optionLine.key].push(optionLine.text);
    }

    const options = Object.fromEntries(
      Object.entries(groupedOptions).map(([key, values]) => [
        key,
        [...new Set(values)].join("\n"),
      ]),
    );

    return {
      number,
      title: heading,
      prompt: promptLines.join("\n"),
      options,
    };
  });
}

export function parseAnswerMarkdown(markdown) {
  const answers = new Map();

  for (const block of splitQuestionBlocks(markdown)) {
    const lines = cleanLines(block);
    const number = Number(stripMarkdownEmphasis(lines[0] ?? "").match(/^Question\s+(\d+)/i)?.[1]);
    const resultLine =
      lines.find((line) => /^Result:/i.test(stripMarkdownEmphasis(line))) ??
      lines.find((line) => /Correct Option:/i.test(stripMarkdownEmphasis(line))) ??
      "";
    const correctOption = stripMarkdownEmphasis(resultLine)
      .match(/Correct Option:\s*([A-D])/i)?.[1]
      ?.toUpperCase();
    const explanationIndex = lines.findIndex((line) => Boolean(labelMatch(line, "Explanation")));
    const sourceIndex = lines.findIndex((line) => Boolean(sourceMatch(line)));

    let explanation = "";
    if (explanationIndex >= 0) {
      const inlineExplanation = labelMatch(lines[explanationIndex], "Explanation")?.[1]?.trim();
      const explanationLines = lines
        .slice(explanationIndex + 1, sourceIndex >= 0 ? sourceIndex : undefined)
        .map(stripMarkdownEmphasis);
      explanation = [inlineExplanation, ...explanationLines].filter(Boolean).join("\n").trim();
    }

    const source = sourceIndex >= 0 ? sourceMatch(lines[sourceIndex])?.[1]?.trim() ?? "" : "";

    if (number && correctOption) {
      answers.set(number, { correctOption, explanation, source });
    }
  }

  return answers;
}

export function mergeExamAndAnswers(questions, answers) {
  return questions.map((question) => ({
    ...question,
    ...(answers.get(question.number) ?? {
      correctOption: null,
      explanation: "",
      source: "",
    }),
  }));
}

export function scoreSubmission(answerKey, selectedAnswers) {
  const items = answerKey.map((answer) => {
    const selectedOption = selectedAnswers[answer.number] ?? null;
    const isCorrect = selectedOption === answer.correctOption;

    return {
      number: answer.number,
      selectedOption,
      correctOption: answer.correctOption,
      isCorrect,
    };
  });
  const correctCount = items.filter((item) => item.isCorrect).length;
  const total = items.length;
  const percentage = total === 0 ? 0 : Number(((correctCount / total) * 100).toFixed(1));

  return { correctCount, total, percentage, items };
}
