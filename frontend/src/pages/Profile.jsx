import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { supabase } from "../supabaseClient";
import { getDashboardStats } from "../quizService";
import "./Profile.css";

function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    setLoading(true);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const statsData = await getDashboardStats(user.id);

    setProfile(profileData);
    setStats(statsData || []);
    setNewName(profileData?.full_name || "");
    setLoading(false);
  };

  const handleSaveName = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: newName.trim() })
      .eq("id", user.id);

    if (!error) {
      setProfile({ ...profile, full_name: newName.trim() });
      setEditing(false);
      setMessage("Name updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Calculate stats
  const totalQuizzes = stats.length;
  const avgScore = totalQuizzes > 0
    ? Math.round(stats.reduce((acc, q) => {
        if (!q.total_mcq) return acc;
        return acc + (q.score / q.total_mcq) * 100;
      }, 0) / totalQuizzes)
    : 0;

  const bestScore = totalQuizzes > 0
    ? Math.max(...stats.map(q => q.total_mcq ? Math.round((q.score / q.total_mcq) * 100) : 0))
    : 0;

  const totalCorrect = stats.reduce((acc, q) => acc + (q.score || 0), 0);
  const totalQuestions = stats.reduce((acc, q) => acc + (q.total_mcq || 0), 0);

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="loading-spinner" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* PROFILE CARD */}
        <div className="profile-card">
          <div className="profile-avatar">
            {getInitials(profile?.full_name || user?.email)}
          </div>

          {editing ? (
            <div className="edit-name-form">
              <input
                className="edit-name-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                autoFocus
                placeholder="Your full name"
              />
              <div className="edit-name-actions">
                <button className="save-name-btn" onClick={handleSaveName} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>
                <button className="cancel-name-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <h1 className="profile-name">
                {profile?.full_name || "No name set"}
              </h1>
              <p className="profile-email">{user?.email}</p>
              <button className="edit-name-btn" onClick={() => setEditing(true)}>
                ✏️ Edit Name
              </button>
            </div>
          )}

          {message && <p className="success-message">{message}</p>}

          <p className="member-since">
            Member since {new Date(user?.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        {/* STATS */}
        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <p className="pstat-label">Total Quizzes</p>
            <p className="pstat-value">{totalQuizzes}</p>
          </div>
          <div className="profile-stat-card">
            <p className="pstat-label">Average Score</p>
            <p className="pstat-value">{avgScore}%</p>
          </div>
          <div className="profile-stat-card">
            <p className="pstat-label">Best Score</p>
            <p className="pstat-value">{bestScore}%</p>
          </div>
          <div className="profile-stat-card">
            <p className="pstat-label">Total Correct</p>
            <p className="pstat-value">{totalCorrect}/{totalQuestions}</p>
          </div>
        </div>

        {/* ACCOUNT ACTIONS */}
        <div className="profile-actions-card">
          <h2>Account</h2>
          <div className="profile-action-list">
            <button className="profile-action-item" onClick={() => navigate("/dashboard")}>
              <span>📊 Dashboard</span>
              <span className="action-arrow">→</span>
            </button>
            <button className="profile-action-item" onClick={() => navigate("/history")}>
              <span>📚 Quiz History</span>
              <span className="action-arrow">→</span>
            </button>
            <button className="profile-action-item" onClick={() => navigate("/quiz")}>
              <span>⚡ Generate Quiz</span>
              <span className="action-arrow">→</span>
            </button>
            <button className="profile-action-item signout" onClick={handleSignOut}>
              <span>🚪 Sign Out</span>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Profile;