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
          <div className="correct-answer">
            ✅ Correct Answer: <strong>{question.correct_answer}</strong>
          </div>
          {question.explanation && (
            <div className="explanation">
              💡 <strong>Explanation:</strong> {question.explanation}
            </div>
          )}
          {question.type === "short" && (
            <div className="short-answer">
              <strong>Answer:</strong>
              <p>{question.correct_answer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionCard;