import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Login.css";

function Signup() {
  const navigate = useNavigate();
  const { signUp, continueAsGuest } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  useEffect(() => {
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setError("");
  }, []);

  const handleSignup = async (e) => {
  e.preventDefault();
  setError("");

  if (password !== confirm) {
    setError("Passwords do not match.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  setLoading(true);
  const { error } = await signUp(email, password, fullName);

  if (error) {
    setError(error.message);
    setLoading(false);
  } else {
    // Show verification message instead of redirecting
    setLoading(false);
    setError("");
    // Replace the form with success message
    setVerificationSent(true);
  }
};

  const handleGuest = () => {
    continueAsGuest();
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">⚡ Quizerator</Link>
          <h1>Create Account</h1>
          <p>Start generating quizzes for free</p>
        </div>

        <form onSubmit={handleSignup} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-btn primary" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="auth-btn guest" onClick={handleGuest}>
          👤 Continue as Guest
        </button>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
      {verificationSent ? (
  <div className="verification-sent">
    <div className="verification-icon">✅</div>
    <h2>Check your email!</h2>
    <p>We sent a verification link to <strong>{email}</strong></p>
    <p>Click the link in the email to activate your account.</p>
    <button className="auth-btn primary" onClick={() => navigate("/login")}>
      Go to Login
    </button>
  </div>
) : (
  // existing form content
  <>
    ...your existing form JSX...
  </>
)}
    </div>
  );
}

export default Signup;