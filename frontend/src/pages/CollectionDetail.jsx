import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getCollectionQuizzes, renameQuiz, deleteQuiz, getQuizWithQuestions, renameCollection, deleteCollection } from "../quizService";
import { supabase } from "../supabaseClient";
import { downloadResultsPDF } from "../pdfExport";
import "./CollectionDetail.css";

function CircleProgress({ percentage }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return "#276749";
    if (percentage >= 50) return "#744210";
    return "#742a2a";
  };

  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx="65" cy="65" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
      <circle
        cx="65" cy="65" r={radius}
        fill="none"
        stroke={getColor()}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 65 65)"
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="65" y="58" textAnchor="middle" dominantBaseline="central" fontSize="20" fontWeight="700" fill={getColor()}>
        {percentage}%
      </text>
      <text x="65" y="76" textAnchor="middle" dominantBaseline="central" fontSize="11" fill="#718096">
        avg score
      </text>
    </svg>
  );
}

function CollectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [collection, setCollection] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [renamingQuizId, setRenamingQuizId] = useState(null);
  const [renameQuizValue, setRenameQuizValue] = useState("");
  const [deletingQuizId, setDeletingQuizId] = useState(null);
  const [showDeleteCollection, setShowDeleteCollection] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadCollection();
  }, [id, user]);

  const loadCollection = async () => {
    setLoading(true);

    const { data: col } = await supabase
      .from("collections")
      .select("*")
      .eq("id", id)
      .single();

    const quizzesData = await getCollectionQuizzes(id);

    setCollection(col);
    setQuizzes(quizzesData);
    setLoading(false);
  };

  const avgScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((acc, q) => {
        if (!q.total_mcq) return acc;
        return acc + (q.score / q.total_mcq) * 100;
      }, 0) / quizzes.length)
    : 0;

  const handleRenameCollection = async () => {
    if (!newName.trim()) return;
    const success = await renameCollection(id, newName.trim());
    if (success) {
      setCollection({ ...collection, name: newName.trim() });
      setRenaming(false);
      setNewName("");
    }
  };

  const handleDeleteCollection = async () => {
    const success = await deleteCollection(id);
    if (success) navigate("/dashboard");
  };

  const handleRenameQuiz = async (quizId) => {
    if (!renameQuizValue.trim()) return;
    const success = await renameQuiz(quizId, renameQuizValue.trim());
    if (success) {
      setQuizzes(quizzes.map(q => q.id === quizId ? { ...q, title: renameQuizValue.trim() } : q));
      setRenamingQuizId(null);
      setRenameQuizValue("");
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const success = await deleteQuiz(quizId);
    if (success) {
      setQuizzes(quizzes.filter(q => q.id !== quizId));
      setDeletingQuizId(null);
    }
  };

  const handleViewQuiz = async (quizId) => {
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

  const handleDownloadQuiz = async (quizId, quizTitle) => {
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

    const score = quizData.score || 0;
    const total = quizData.total_mcq || 0;
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;

    downloadResultsPDF(formattedQuiz, {}, score, total, pct);
  };

 const getGrade = (quiz) => {
  const pct = quiz.overall_score ?? (quiz.total_mcq ? Math.round((quiz.score / quiz.total_mcq) * 100) : 0);
  if (pct >= 90) return "A+";
  if (pct >= 80) return "A";
  if (pct >= 70) return "B";
  if (pct >= 60) return "C";
  if (pct >= 50) return "D";
  return "F";
};

const getGradeColor = (quiz) => {
  const pct = quiz.overall_score ?? (quiz.total_mcq ? Math.round((quiz.score / quiz.total_mcq) * 100) : 0);
  if (pct >= 70) return "#276749";
  if (pct >= 50) return "#744210";
  return "#742a2a";
};

  if (loading) {
    return (
      <div className="col-detail-page">
        <div className="col-loading">
          <div className="loading-spinner" />
          <p>Loading collection...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="col-detail-page">
        <div className="col-loading">
          <p>Collection not found.</p>
          <button onClick={() => navigate("/dashboard")}>← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="col-detail-page">
      <div className="col-detail-container">

        {/* BACK */}
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <div className="col-header">
          <div className="col-header-left">
            {renaming ? (
              <div className="rename-collection-form">
                <input
                  className="rename-col-input"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRenameCollection()}
                  autoFocus
                />
                <button className="save-btn" onClick={handleRenameCollection}>Save</button>
                <button className="cancel-small-btn" onClick={() => setRenaming(false)}>Cancel</button>
              </div>
            ) : (
              <h1 className="col-name">{collection.name}</h1>
            )}
            <p className="col-meta">{quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"} · Created {new Date(collection.created_at).toLocaleDateString()}</p>
          </div>

          <div className="col-header-actions">
            <button className="col-action-btn rename" onClick={() => { setRenaming(true); setNewName(collection.name); }}>
              ✏️ Rename
            </button>
            <button className="col-action-btn delete" onClick={() => setShowDeleteCollection(true)}>
              🗑️ Delete Collection
            </button>
          </div>
        </div>

        {/* DELETE COLLECTION CONFIRM */}
        {showDeleteCollection && (
          <div className="delete-collection-confirm">
            <p>⚠️ Delete <strong>{collection.name}</strong>? All quizzes will be unlinked but not deleted.</p>
            <div className="delete-col-actions">
              <button className="delete-yes" onClick={handleDeleteCollection}>Delete</button>
              <button className="delete-no" onClick={() => setShowDeleteCollection(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* OVERALL SCORE */}
        <div className="col-score-section">
          <div className="col-score-card">
            <CircleProgress percentage={avgScore} />
            <div className="col-score-info">
              <h2>Overall Performance</h2>
              <p>{quizzes.length} quizzes completed</p>
              <div className="col-score-breakdown">
                <div className="score-item">
                  <span className="score-item-label">Best quiz</span>
                  <span className="score-item-value">
                    {quizzes.length > 0
                      ? Math.max(...quizzes.map(q => q.total_mcq ? Math.round((q.score / q.total_mcq) * 100) : 0))
                      : 0}%
                  </span>
                </div>
                <div className="score-item">
                  <span className="score-item-label">Latest quiz</span>
                  <span className="score-item-value">
                    {quizzes.length > 0 && quizzes[0].total_mcq
                      ? Math.round((quizzes[0].score / quizzes[0].total_mcq) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* QUIZZES LIST */}
        <div className="col-quizzes-section">
          <div className="section-header">
            <h2>Quizzes in this Collection</h2>
            <button className="section-link" onClick={() => navigate("/quiz")}>
              + Add Quiz
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="empty-quizzes">
              <p>No quizzes in this collection yet.</p>
              <button className="add-quiz-btn" onClick={() => navigate("/quiz")}>
                Generate a Quiz
              </button>
            </div>
          ) : (
            <div className="quiz-list">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="quiz-item">
                  <div className="quiz-item-left">
                    <div
  className="quiz-item-grade"
  style={{ color: getGradeColor(quiz) }}
>
  {getGrade(quiz)}
</div>
                    <div className="quiz-item-info">
                      {renamingQuizId === quiz.id ? (
                        <div className="rename-quiz-form">
                          <input
                            className="rename-quiz-input"
                            value={renameQuizValue}
                            onChange={(e) => setRenameQuizValue(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleRenameQuiz(quiz.id)}
                            autoFocus
                          />
                          <button className="save-btn" onClick={() => handleRenameQuiz(quiz.id)}>Save</button>
                          <button className="cancel-small-btn" onClick={() => setRenamingQuizId(null)}>Cancel</button>
                        </div>
                      ) : (
                        <p className="quiz-item-title">{quiz.title}</p>
                      )}
                      <p className="quiz-item-meta">
                        {new Date(quiz.created_at).toLocaleDateString()} · {quiz.difficulty} · {quiz.score}/{quiz.total_mcq} MCQs
                      </p>
                    </div>
                  </div>

                  {deletingQuizId === quiz.id ? (
                    <div className="delete-quiz-confirm">
                      <span>Delete?</span>
                      <button className="delete-yes-sm" onClick={() => handleDeleteQuiz(quiz.id)}>Yes</button>
                      <button className="delete-no-sm" onClick={() => setDeletingQuizId(null)}>No</button>
                    </div>
                  ) : (
                    <div className="quiz-item-actions">
                      <button className="quiz-action-btn view" onClick={() => handleViewQuiz(quiz.id)}>
                        View
                      </button>
                      <button className="quiz-action-btn download" onClick={() => handleDownloadQuiz(quiz.id, quiz.title)}>
                        Download
                      </button>
                      <button className="quiz-action-btn rename" onClick={() => { setRenamingQuizId(quiz.id); setRenameQuizValue(quiz.title); }}>
                        ✏️
                      </button>
                      <button className="quiz-action-btn delete" onClick={() => setDeletingQuizId(quiz.id)}>
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default CollectionDetail;