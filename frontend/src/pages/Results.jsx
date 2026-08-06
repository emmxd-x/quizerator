import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "../AuthContext";
import { saveQuiz } from "../quizService";
import { downloadQuizPDF, downloadResultsPDF } from "../pdfExport";
import "./Results.css";

function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const hasSaved = useRef(false);

  const { quiz, answers, settings, selfAssessments, collectionId } = location.state || {};
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!quiz) {
      navigate("/quiz");
      return;
    }
    if (user && !hasSaved.current && !location.state?.fromHistory) {
  hasSaved.current = true;
  saveQuiz(user.id, quiz, {
    ...settings,
    collection_id: collectionId,
  } || {
    difficulty: "medium",
    num_mcq: quiz.questions.filter(q => q.type === "mcq").length,
    num_short: quiz.questions.filter(q => q.type === "short").length,
    collection_id: collectionId,
  }, answers).then((result) => {
    if (result) {
      setSaved(true);
      window.history.replaceState({}, '');
    }
  });
}
  }, []);

  if (!quiz) return null;

  const mcqQuestions = quiz.questions.filter((q) => q.type === "mcq");
  const shortQuestions = quiz.questions.filter((q) => q.type === "short");

  const correctMcq = mcqQuestions.filter((q) => {
    const globalIndex = quiz.questions.indexOf(q);
    return answers[globalIndex] === q.correct_answer;
  }).length;

  const correctShort = shortQuestions.filter((q) => {
    const globalIndex = quiz.questions.indexOf(q);
    return selfAssessments?.[globalIndex] === true;
  }).length;

  const correctAnswers = correctMcq + correctShort;
  const totalMcq = mcqQuestions.length;
  const totalShort = shortQuestions.length;
  const totalQuestions = quiz.questions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { grade: "A+", color: "#276749", bg: "#f0fff4", label: "Excellent!" };
    if (percentage >= 80) return { grade: "A", color: "#276749", bg: "#f0fff4", label: "Great Job!" };
    if (percentage >= 70) return { grade: "B", color: "#744210", bg: "#fffbeb", label: "Good Work!" };
    if (percentage >= 60) return { grade: "C", color: "#744210", bg: "#fffbeb", label: "Keep Practicing!" };
    if (percentage >= 50) return { grade: "D", color: "#92400e", bg: "#fff7ed", label: "Needs Improvement!" };
    return { grade: "F", color: "#742a2a", bg: "#fff5f5", label: "Need More Practice!" };
  };

  const gradeInfo = getGrade();

  return (
    <div className="results-page">
      <div className="results-container">

        {/* SCORE CARD */}
        <div className="score-card" style={{ background: gradeInfo.bg }}>
          <div className="score-grade" style={{ color: gradeInfo.color }}>
            {gradeInfo.grade}
          </div>
          <h1 className="score-label" style={{ color: gradeInfo.color }}>
            {gradeInfo.label}
          </h1>
          {saved && (
            <p className="saved-indicator">✅ Quiz saved to your history</p>
          )}
          <div className="score-stats">
            <div className="score-stat">
              <span className="score-number">{correctMcq}/{totalMcq}</span>
              <span className="score-desc">MCQs Correct</span>
            </div>
            <div className="score-divider" />
            <div className="score-stat">
              <span className="score-number">{correctShort}/{totalShort}</span>
              <span className="score-desc">Short Correct</span>
            </div>
            <div className="score-divider" />
            <div className="score-stat">
              <span className="score-number">{percentage}%</span>
              <span className="score-desc">Overall Score</span>
            </div>
          </div>
          <div className="score-bar-container">
            <div className="score-bar">
              <div
                className="score-bar-fill"
                style={{ width: `${percentage}%`, background: gradeInfo.color }}
              />
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="results-actions">
          <button className="action-btn primary" onClick={() => navigate("/quiz")}>
            ⚡ Generate New Quiz
          </button>
          <button
            className="action-btn secondary"
            onClick={() => downloadResultsPDF(quiz, answers, correctAnswers, totalQuestions, percentage)}
          >
            📥 Download Results PDF
          </button>
          <button
            className="action-btn outline"
            onClick={() => downloadQuizPDF(quiz, settings)}
          >
            📄 Download Quiz PDF
          </button>
        </div>

        {/* REVIEW SECTION */}
        <div className="review-section">
          <h2 className="review-title">📋 Question Review</h2>
          <p className="review-subtitle">Review all questions and answers</p>

          {quiz.questions.map((q, index) => {
            const userAnswer = answers[index];
            const isCorrect = q.type === "mcq" && userAnswer === q.correct_answer;
            const isWrong = q.type === "mcq" && userAnswer && userAnswer !== q.correct_answer;
            const isSkipped = q.type === "mcq" && !userAnswer;
            const shortCorrect = q.type === "short" && selfAssessments?.[index] === true;
            const shortWrong = q.type === "short" && selfAssessments?.[index] === false;

            return (
              <div
                key={index}
                className={`review-card ${isCorrect || shortCorrect ? "correct" : isWrong || shortWrong ? "wrong" : isSkipped ? "skipped" : "short"}`}
              >
                <div className="review-card-header">
                  <div className="review-meta">
                    <span className="review-number">Q{index + 1}</span>
                    <span className={`review-badge ${q.type}`}>
                      {q.type === "mcq" ? "MCQ" : "Short Answer"}
                    </span>
                  </div>
                  {q.type === "mcq" && (
                    <span className={`review-status ${isCorrect ? "correct" : isWrong ? "wrong" : "skipped"}`}>
                      {isCorrect ? "✅ Correct" : isWrong ? "❌ Wrong" : "⏭️ Skipped"}
                    </span>
                  )}
                  {q.type === "short" && selfAssessments?.[index] !== undefined && (
                    <span className={`review-status ${shortCorrect ? "correct" : "wrong"}`}>
                      {shortCorrect ? "✅ Self: Correct" : "❌ Self: Wrong"}
                    </span>
                  )}
                </div>

                <p className="review-question">{q.question}</p>

                {q.type === "mcq" && (
                  <div className="review-options">
                    {Object.entries(q.options).map(([key, value]) => (
                      <div
                        key={key}
                        className={`review-option
                          ${key === q.correct_answer ? "correct" : ""}
                          ${userAnswer === key && key !== q.correct_answer ? "wrong" : ""}
                        `}
                      >
                        <span className="review-option-key">{key}</span>
                        <span>{value}</span>
                        {key === q.correct_answer && <span className="review-tick">✓</span>}
                        {userAnswer === key && key !== q.correct_answer && <span className="review-cross">✗</span>}
                      </div>
                    ))}
                    {q.explanation && (
                      <div className="review-explanation">
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                )}

                {q.type === "short" && (
                  <div className="review-short-answer">
                    <p className="review-answer-label">📝 Answer:</p>
                    {q.correct_answer.includes("•") ? (
                      <ul className="review-bullets">
                        {q.correct_answer.split("•").filter(p => p.trim()).map((point, i) => (
                          <li key={i}>{point.trim()}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{q.correct_answer}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default Results;