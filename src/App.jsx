import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadExamBatches } from "./data/examLoader.js";
import { scoreSubmission } from "./lib/examParser.js";
import "./styles.css";

const EXAM_SECONDS = 90 * 60;
const OPTION_KEYS = ["A", "B", "C", "D"];

function formatTime(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function ExamList({ batches, onStart }) {
  return (
    <main className="shell">
      <section className="hero">
        <div>
          <p className="muted">HKSI Paper 1</p>
          <h1>Practice Exams</h1>
          <p>
            Choose a batch, complete 60 fixed-order A/B/C/D questions in 90 minutes,
            then review your score and explanations for wrong answers.
          </p>
        </div>
      </section>

      <section className="paperGrid" aria-label="Available exams">
        {batches.map((batch) => (
          <button className="paperCard" key={batch.id} onClick={() => onStart(batch.id)}>
            <span>Batch {batch.id}</span>
            <strong>{batch.title}</strong>
            <small>{batch.questions.length} questions</small>
          </button>
        ))}
      </section>
    </main>
  );
}

function QuestionNav({ questions, answers, currentIndex, onSelect }) {
  return (
    <nav className="questionNav" aria-label="Question navigation">
      {questions.map((question, index) => (
        <button
          className={[
            "questionDot",
            answers[question.number] ? "answered" : "",
            index === currentIndex ? "current" : "",
          ].join(" ")}
          key={question.number}
          onClick={() => onSelect(index)}
        >
          {question.number}
        </button>
      ))}
    </nav>
  );
}

function ExamScreen({ batch, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingSeconds, setRemainingSeconds] = useState(EXAM_SECONDS);
  const [submittedByTimeout, setSubmittedByTimeout] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [message, setMessage] = useState("");
  const currentQuestion = batch.questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const result = useMemo(
    () => (isSubmitted ? scoreSubmission(batch.questions, answers) : null),
    [answers, batch.questions, isSubmitted],
  );

  useEffect(() => {
    if (isSubmitted) return undefined;

    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setSubmittedByTimeout(true);
          setIsSubmitted(true);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSubmitted]);

  function selectAnswer(optionKey) {
    if (isSubmitted) return;
    setAnswers((current) => ({
      ...current,
      [currentQuestion.number]: optionKey,
    }));
    setMessage("");
  }

  function submit() {
    if (answeredCount < batch.questions.length) {
      setMessage(`There are ${batch.questions.length - answeredCount} questions left.`);
      return;
    }

    setIsSubmitted(true);
  }

  if (result) {
    return (
      <main className="shell">
        <section className="resultHero">
          <button className="ghostButton" onClick={onBack}>
            Back to papers
          </button>
          <div>
            <p className="muted">{submittedByTimeout ? "Auto-submitted" : "Submitted"}</p>
            <h1>
              {result.correctCount} / {result.total}
            </h1>
            <p className="score">{result.percentage}% accuracy</p>
          </div>
        </section>

        <section className="resultList">
          {batch.questions.map((question) => {
            const item = result.items.find((resultItem) => resultItem.number === question.number);

            return (
              <details className={item.isCorrect ? "resultItem correct" : "resultItem wrong"} key={question.number} open={!item.isCorrect}>
                <summary>
                  <span>Question {question.number}</span>
                  <strong>{item.isCorrect ? "Correct" : "Wrong"}</strong>
                  <small>
                    Your answer: {item.selectedOption ?? "Blank"} · Correct answer: {item.correctOption}
                  </small>
                </summary>
                {!item.isCorrect && (
                  <div className="explanation">
                    <p>{question.explanation}</p>
                    {question.source && <p className="source">Source: {question.source}</p>}
                  </div>
                )}
              </details>
            );
          })}
        </section>
      </main>
    );
  }

  return (
    <main className="examLayout">
      <aside className="sidebar">
        <button className="ghostButton" onClick={onBack}>
          Back to papers
        </button>
        <div className="timer">{formatTime(remainingSeconds)}</div>
        <p className="muted">
          Answered {answeredCount} / {batch.questions.length}
        </p>
        <QuestionNav
          questions={batch.questions}
          answers={answers}
          currentIndex={currentIndex}
          onSelect={setCurrentIndex}
        />
        <button className="submitButton" onClick={submit}>
          Submit exam
        </button>
        {message && <p className="warning">{message}</p>}
      </aside>

      <section className="questionPanel">
        <p className="muted">
          {batch.title} · Question {currentQuestion.number} of {batch.questions.length}
        </p>
        <h2>{currentQuestion.title}</h2>
        <div className="prompt">
          {currentQuestion.prompt.split("\n").map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>

        <div className="options">
          {OPTION_KEYS.map((optionKey) => (
            <button
              className={[
                "optionButton",
                answers[currentQuestion.number] === optionKey ? "selected" : "",
              ].join(" ")}
              key={optionKey}
              onClick={() => selectAnswer(optionKey)}
            >
              <span>{optionKey}</span>
              <p>
                {(currentQuestion.options[optionKey] ?? "")
                  .split("\n")
                  .map((line) => (
                    <em key={line}>{line}</em>
                  ))}
              </p>
            </button>
          ))}
        </div>

        <div className="pager">
          <button disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>
            Previous
          </button>
          <button
            disabled={currentIndex === batch.questions.length - 1}
            onClick={() => setCurrentIndex((index) => index + 1)}
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}

function App() {
  const batches = useMemo(() => loadExamBatches(), []);
  const [activeBatchId, setActiveBatchId] = useState(null);
  const activeBatch = batches.find((batch) => batch.id === activeBatchId);

  if (activeBatch) {
    return <ExamScreen batch={activeBatch} onBack={() => setActiveBatchId(null)} />;
  }

  return <ExamList batches={batches} onStart={setActiveBatchId} />;
}

createRoot(document.getElementById("root")).render(<App />);
