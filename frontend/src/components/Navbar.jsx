import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        ⚡ Quizerator
      </Link>

      <button
        className="hamburger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
        <Link to="/" className={`nav-link ${location.pathname === "/" ? "active" : ""}`} onClick={closeMenu}>
          Home
        </Link>

        {(user || isGuest) && (
          <Link to="/quiz" className={`nav-link ${location.pathname === "/quiz" ? "active" : ""}`} onClick={closeMenu}>
            Generate Quiz
          </Link>
        )}

        {user && (
          <Link to="/dashboard" className={`nav-link ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={closeMenu}>
            Dashboard
          </Link>
        )}

        {user && (
          <Link to="/history" className={`nav-link ${location.pathname === "/history" ? "active" : ""}`} onClick={closeMenu}>
            My History
          </Link>
        )}

        {user && (
          <Link to="/profile" className={`nav-link ${location.pathname === "/profile" ? "active" : ""}`} onClick={closeMenu}>
            Profile
          </Link>
        )}

        {user ? (
          <button className="nav-btn signout" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : isGuest ? (
          <Link to="/login" className="nav-btn" onClick={closeMenu}>
            Sign In
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-link" onClick={closeMenu}>Sign In</Link>
            <Link to="/signup" className="nav-btn" onClick={closeMenu}>Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;