function formatAnswer(text) {
  if (!text) return null;
  
  // Check if answer contains bullet points
  if (text.includes("•")) {
    const parts = text.split("•").filter(p => p.trim());
    return (
      <ul className="answer-bullets">
        {parts.map((part, i) => (
          <li key={i}>{part.trim()}</li>
        ))}
      </ul>
    );
  }
  
  return <p>{text}</p>;
}

function QuestionCard({ question, index, revealed, selectedAnswer, onAnswer, onReveal }) {
  return (
    <div className="question-card-new">
      <div className="question-meta">
        <span className={`q-badge ${question.type}`}>
          {question.type === "mcq" ? "Multiple Choice" : "Short Answer"}
        </span>
      </div>

      <p className="question-text-new">{question.question}</p>

      {/* MCQ Options */}
      {question.type === "mcq" && (
        <div className="options-grid">
          {Object.entries(question.options).map(([key, value]) => (
            <button
              key={key}
              className={`option-btn
                ${selectedAnswer === key ? "selected" : ""}
                ${revealed && key === question.correct_answer ? "correct" : ""}
                ${revealed && selectedAnswer === key && key !== question.correct_answer ? "wrong" : ""}
              `}
              onClick={() => !revealed && onAnswer(index, key)}
              disabled={revealed}
            >
              <span className="option-key-new">{key}</span>
              <span className="option-text">{value}</span>
            </button>
          ))}
        </div>
      )}

      {/* Show Answer Button */}
      {!revealed && (
        <button className="reveal-btn" onClick={onReveal}>
          Show Answer
        </button>
      )}

      {/* Answer Revealed */}
      {revealed && (
        <div className="answer-revealed">

          {/* MCQ: show correct option + explanation */}
          {question.type === "mcq" && (
            <>
              <div className="correct-answer">
                ✅ Correct Answer: <strong>{question.correct_answer} — {question.options[question.correct_answer]}</strong>
              </div>
              {question.explanation && (
                <div className="explanation">
                  💡 <strong>Explanation:</strong> {question.explanation}
                </div>
              )}
            </>
          )}

          {/* Short Answer: show formatted answer only once */}
          {question.type === "short" && (
            <div className="short-answer">
              <p className="short-answer-label">📝 Answer:</p>
              {formatAnswer(question.correct_answer)}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

export default QuestionCard;