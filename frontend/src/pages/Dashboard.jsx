import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getUserCollections,
  createCollection,
  deleteCollection,
  getDashboardStats,
} from "../quizService";
import "./Dashboard.css";

function CircleProgress({ percentage, name, quizCount, onClick }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 75) return "#276749";
    if (percentage >= 50) return "#744210";
    return "#742a2a";
  };

  return (
    <div className="collection-card" onClick={onClick}>
      <div className="circle-wrapper">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth="8"
          />
          <circle
            cx="50" cy="50" r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
          <text
            x="50" y="46"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="14"
            fontWeight="600"
            fill={getColor()}
          >
            {percentage}%
          </text>
          <text
            x="50" y="62"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="9"
            fill="var(--text-secondary)"
          >
            score
          </text>
        </svg>
      </div>
      <p className="collection-name">{name}</p>
      <p className="collection-count">{quizCount} {quizCount === 1 ? "quiz" : "quizzes"}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    const [collectionsData, statsData] = await Promise.all([
      getUserCollections(user.id),
      getDashboardStats(user.id),
    ]);
    setCollections(collectionsData);
    setStats(statsData || []);
    setLoading(false);
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    const collection = await createCollection(user.id, newCollectionName.trim());
    if (collection) {
      setCollections([collection, ...collections]);
      setNewCollectionName("");
      setShowNewCollection(false);
    }
  };

  const handleDeleteCollection = async (id) => {
    const success = await deleteCollection(id);
    if (success) {
      setCollections(collections.filter((c) => c.id !== id));
      setDeletingId(null);
    }
  };

  // Calculate stats
  const totalQuizzes = stats.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(stats.reduce((acc, q) => {
        if (!q.total_mcq) return acc;
        return acc + (q.score / q.total_mcq) * 100;
      }, 0) / totalQuizzes)
    : 0;

  // Collection stats
  const collectionStats = collections.map((col) => {
    const colQuizzes = stats.filter((q) => q.collection_id === col.id);
    const colAvg = colQuizzes.length > 0
      ? Math.round(colQuizzes.reduce((acc, q) => {
          if (!q.total_mcq) return acc;
          return acc + (q.score / q.total_mcq) * 100;
        }, 0) / colQuizzes.length)
      : 0;
    return { ...col, quizCount: colQuizzes.length, avgScore: colAvg };
  });

  const bestCollection = collectionStats.length > 0
    ? collectionStats.reduce((best, col) => col.avgScore > best.avgScore ? col : best, collectionStats[0])
    : null;

  const worstCollection = collectionStats.length > 0
    ? collectionStats.reduce((worst, col) => col.avgScore < worst.avgScore ? col : worst, collectionStats[0])
    : null;

  const recentQuizzes = stats.slice(0, 5);

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
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* WELCOME */}
        <div className="dashboard-welcome">
          <div>
            <h1>Welcome back! 👋</h1>
            <p>Here's your learning overview</p>
          </div>
          <button className="dash-primary-btn" onClick={() => navigate("/quiz")}>
            ⚡ Generate Quiz
          </button>
        </div>

        {/* STATS */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <p className="stat-label">Total quizzes</p>
            <p className="stat-value">{totalQuizzes}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Average score</p>
            <p className="stat-value">{avgScore}%</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Collections</p>
            <p className="stat-value">{collections.length}</p>
          </div>
          <div className="stat-card">
            <p className="stat-label">Best collection</p>
            <p className="stat-value stat-name">{bestCollection?.name || "—"}</p>
            {bestCollection && <p className="stat-sub">{bestCollection.avgScore}% avg</p>}
          </div>
          <div className="stat-card">
            <p className="stat-label">Needs work</p>
            <p className="stat-value stat-name">{worstCollection?.name || "—"}</p>
            {worstCollection && worstCollection.id !== bestCollection?.id && (
              <p className="stat-sub">{worstCollection.avgScore}% avg</p>
            )}
          </div>
        </div>

        {/* COLLECTIONS */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Collections</h2>
            <button className="section-link" onClick={() => setShowNewCollection(true)}>
              + New Collection
            </button>
          </div>

          {/* New Collection Input */}
          {showNewCollection && (
            <div className="new-collection-form">
              <input
                type="text"
                placeholder="Collection name (e.g. Machine Learning)"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                autoFocus
                className="new-collection-input"
              />
              <div className="new-collection-actions">
                <button className="create-btn" onClick={handleCreateCollection}>Create</button>
                <button className="cancel-btn" onClick={() => setShowNewCollection(false)}>Cancel</button>
              </div>
            </div>
          )}

          {collections.length === 0 ? (
            <div className="empty-collections">
              <p>No collections yet. Create one to organize your quizzes!</p>
            </div>
          ) : (
            <div className="collections-grid">
              {collectionStats.map((col) => (
                <div key={col.id} className="collection-wrapper">
                  <CircleProgress
                    percentage={col.avgScore}
                    name={col.name}
                    quizCount={col.quizCount}
                    onClick={() => navigate(`/collection/${col.id}`)}
                  />
                  {deletingId === col.id ? (
                    <div className="delete-confirm-small">
                      <p>Delete?</p>
                      <button className="delete-yes-sm" onClick={() => handleDeleteCollection(col.id)}>Yes</button>
                      <button className="delete-no-sm" onClick={() => setDeletingId(null)}>No</button>
                    </div>
                  ) : (
                    <button className="delete-col-btn" onClick={() => setDeletingId(col.id)}>🗑️</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT QUIZZES */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Quizzes</h2>
            <button className="section-link" onClick={() => navigate("/history")}>
              View all
            </button>
          </div>

          {recentQuizzes.length === 0 ? (
            <div className="empty-collections">
              <p>No quizzes yet. Generate your first quiz!</p>
            </div>
          ) : (
            <div className="recent-list">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.id} className="recent-row">
                  <div
  className="recent-grade"
  style={{ color: getGradeColor(quiz) }}
>
  {getGrade(quiz)}
</div>
                  <div className="recent-info">
                    <p className="recent-title">{quiz.title}</p>
                    <p className="recent-meta">
                      {new Date(quiz.created_at).toLocaleDateString()} ·{" "}
                      {quiz.collections?.name || "No collection"} ·{" "}
                      {quiz.difficulty}
                    </p>
                  </div>
                  <div className="recent-score">
                    {quiz.score}/{quiz.total_mcq}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;