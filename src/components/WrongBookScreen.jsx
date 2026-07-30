import {
  clearWrongBook,
  isRecentlyCorrect,
  readWrongBook,
  removeWrongBookItem,
  writeWrongBook,
} from "../lib/wrongBook.js";
import { useState } from "react";

const OPTION_KEYS = ["A", "B", "C", "D"];

function findQuestion(batches, batchId, questionNumber) {
  return batches
    .find((batch) => batch.id === batchId)
    ?.questions.find((question) => question.number === questionNumber);
}

function QuestionPrompt({ prompt }) {
  return (
    <div className="prompt compactPrompt">
      {prompt.split("\n").map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  );
}

function WrongBookOptions({ question, latestSelectedOption }) {
  return (
    <div className="wrongBookOptions">
      {OPTION_KEYS.map((optionKey) => (
        <div
          className={[
            "wrongBookOption",
            latestSelectedOption === optionKey ? "latestChoice" : "",
            question.correctOption === optionKey ? "correctChoice" : "",
          ].join(" ")}
          key={optionKey}
        >
          <span>{optionKey}</span>
          <p>
            {(question.options[optionKey] ?? "").split("\n").map((line) => (
              <em key={line}>{line}</em>
            ))}
          </p>
        </div>
      ))}
    </div>
  );
}

function ExplanationBlock({ explanation, source }) {
  return (
    <div className="explanation">
      <p>{explanation}</p>
      {source && <p className="source">Source: {source}</p>}
    </div>
  );
}

export function WrongBookScreen({ batches, onBack }) {
  const [records, setRecords] = useState(() => readWrongBook());
  const enrichedRecords = records.map((record) => ({
    ...record,
    question: findQuestion(batches, record.batchId, record.questionNumber),
  }));

  function removeItem(batchId, questionNumber) {
    const nextRecords = removeWrongBookItem(records, batchId, questionNumber);
    setRecords(writeWrongBook(nextRecords));
  }

  function clearAll() {
    const nextRecords = clearWrongBook();
    setRecords(writeWrongBook(nextRecords));
  }

  return (
    <main className="shell">
      <section className="resultHero">
        <button className="ghostButton" onClick={onBack}>
          Back to papers
        </button>
        <div>
          <p className="muted">Saved in this browser only</p>
          <h1>Wrong Book / 错题本</h1>
          <p className="score">{records.length} saved questions</p>
        </div>
        {records.length > 0 && (
          <button className="dangerButton" onClick={clearAll}>
            Clear all
          </button>
        )}
      </section>

      {records.length === 0 ? (
        <section className="emptyState">
          <h2>No wrong questions yet</h2>
          <p>Submit an exam and wrong or blank answers will appear here automatically.</p>
        </section>
      ) : (
        <section className="resultList">
          {enrichedRecords.map((record) => {
            const question = record.question;

            return (
              <article
                className={[
                  "wrongBookItem",
                  isRecentlyCorrect(record) ? "recentlyCorrect" : "stillWrong",
                ].join(" ")}
                key={`${record.batchId}-${record.questionNumber}`}
              >
                <div className="wrongBookMeta">
                  <span>
                    Batch {record.batchId} · Question {record.questionNumber}
                  </span>
                  <strong>{isRecentlyCorrect(record) ? "Recently correct" : "Latest wrong"}</strong>
                </div>
                <p className="muted">
                  Wrong count: {record.wrongCount} · Latest answer:{" "}
                  {record.latestSelectedOption ?? "Blank"} · Correct answer:{" "}
                  {question?.correctOption ?? "Unavailable"}
                </p>
                {question ? (
                  <>
                    <h2>{question.title}</h2>
                    <QuestionPrompt prompt={question.prompt} />
                    <WrongBookOptions
                      question={question}
                      latestSelectedOption={record.latestSelectedOption}
                    />
                    <ExplanationBlock explanation={question.explanation} source={question.source} />
                  </>
                ) : (
                  <p className="warning">
                    This question is no longer available in the current exam files.
                  </p>
                )}
                <button
                  className="ghostButton"
                  onClick={() => removeItem(record.batchId, record.questionNumber)}
                >
                  Remove / 已掌握
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
