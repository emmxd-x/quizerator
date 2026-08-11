import { downloadQuizPDF, downloadResultsPDF } from "../pdfExport";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getUserQuizzes, renameQuiz, deleteQuiz, getQuizWithQuestions } from "../quizService";
import "./History.css";

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadQuizzes();
  }, [user]);

  const loadQuizzes = async () => {
    setLoading(true);
    const data = await getUserQuizzes(user.id);
    setQuizzes(data);
    setLoading(false);
  };

  const handleRename = async (id) => {
    if (!renameValue.trim()) return;
    const success = await renameQuiz(id, renameValue.trim());
    if (success) {
      setQuizzes(quizzes.map(q => q.id === id ? { ...q, title: renameValue.trim() } : q));
      setRenamingId(null);
      setRenameValue("");
    }
  };

  const handleDelete = async (id) => {
    const success = await deleteQuiz(id);
    if (success) {
      setQuizzes(quizzes.filter(q => q.id !== id));
      setDeletingId(null);
    }
  };

  const handleReopen = async (quizId) => {
    const quizData = await getQuizWithQuestions(quizId);
    if (!quizData) return;

    const formattedQuiz = {
      questions: quizData.questions.map(q => ({
        type: q.type,
        question: q.question_text,
        options: q.options,
        correct_answer: q.correct_answer,
        explanation: q.explanation,
      }))
    };

    navigate("/results", {
      state: {
        quiz: formattedQuiz,
        answers: quizData.questions.reduce((acc, q, i) => {
          acc[i] = q.user_answer;
          return acc;
        }, {}),
        settings: {
          difficulty: quizData.difficulty,
          num_mcq: quizData.num_mcq,
          num_short: quizData.num_short,
        },
        fromHistory: true,
      }
    });
  };

  const getGradeColor = (quiz) => {
  const pct = quiz.overall_score ?? (quiz.total_mcq ? Math.round((quiz.score / quiz.total_mcq) * 100) : 0);
  if (pct >= 70) return "#276749";
  if (pct >= 50) return "#744210";
  return "#742a2a";
};

const getGradeLetter = (quiz) => {
  const pct = quiz.overall_score ?? (quiz.total_mcq ? Math.round((quiz.score / quiz.total_mcq) * 100) : 0);
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
};

  if (loading) {
    return (
      <div className="history-page">
        <div className="history-loading">
          <div className="loading-spinner" />
          <p>Loading your quiz history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <div className="history-container">
        <div className="history-header">
          <div>
            <h1>📚 Quiz History</h1>
            <p>All your saved quizzes in one place</p>
          </div>
          <button className="new-quiz-btn" onClick={() => navigate("/quiz")}>
            ⚡ New Quiz
          </button>
        </div>

        {quizzes.length === 0 ? (
          <div className="history-empty">
            <div className="empty-icon">📭</div>
            <h2>No quizzes yet</h2>
            <p>Generate your first quiz to see it here</p>
            <button className="new-quiz-btn" onClick={() => navigate("/quiz")}>
              Generate Quiz
            </button>
          </div>
        ) : (
          <div className="history-grid">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="history-card">

                {/* Card Header */}
                <div className="history-card-header">
                  <div
                    className={`history-grade`}
style={{ color: getGradeColor(quiz) }}
>
{getGradeLetter(quiz)}
                  </div>
                  <div className="history-card-actions">
                    <button
                      className="icon-btn rename"
                      onClick={() => {
                        setRenamingId(quiz.id);
                        setRenameValue(quiz.title);
                      }}
                      title="Rename"
                    >
                      ✏️
                    </button>
                    <button
                      className="icon-btn delete"
                      onClick={() => setDeletingId(quiz.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Title */}
                {renamingId === quiz.id ? (
                  <div className="rename-input-group">
                    <input
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(quiz.id)}
                      autoFocus
                    />
                    <div className="rename-actions">
                      <button className="rename-save" onClick={() => handleRename(quiz.id)}>Save</button>
                      <button className="rename-cancel" onClick={() => setRenamingId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <h3 className="history-title">{quiz.title}</h3>
                )}

                {/* Stats */}
                <div className="history-stats">
                  <span className={`difficulty-tag ${quiz.difficulty}`}>
                    {quiz.difficulty}
                  </span>
                  <span className="history-score">
                    {quiz.score}/{quiz.total_mcq} MCQs
                  </span>
                  <span className="history-date">
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Score Bar */}
                <div className="history-bar">
                  <div
                    className="history-bar-fill"
                    style={{
                      width: quiz.total_mcq ? `${(quiz.score / quiz.total_mcq) * 100}%` : "0%",
                      background: getGradeColor(quiz.score, quiz.total_mcq)
                    }}
                  />
                </div>

                {/* Delete Confirmation */}
                {deletingId === quiz.id && (
                  <div className="delete-confirm">
                    <p>Delete this quiz?</p>
                    <div className="delete-actions">
                      <button className="delete-yes" onClick={() => handleDelete(quiz.id)}>Delete</button>
                      <button className="delete-no" onClick={() => setDeletingId(null)}>Cancel</button>
                    </div>
                  </div>
                )}

                {/* Reopen Button */}
                {deletingId !== quiz.id && (
  <div className="history-card-buttons">
    <button className="reopen-btn" onClick={() => handleReopen(quiz.id)}>
      View Results →
    </button>
  </div>
)}

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default History;