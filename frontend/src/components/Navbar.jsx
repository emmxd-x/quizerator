import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isGuest, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        ⚡ Quizerator
      </Link>
      <div className="navbar-links">
        <Link
          to="/"
          className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
        >
          Home
        </Link>
        {(user || isGuest) && (
          <Link
            to="/quiz"
            className={`nav-link ${location.pathname === "/quiz" ? "active" : ""}`}
          >
            Generate Quiz
          </Link>
        )}

        {user ? (
          <button className="nav-btn signout" onClick={handleSignOut}>
            Sign Out
          </button>
        ) : isGuest ? (
          <Link to="/login" className="nav-btn">
            Sign In
          </Link>
        ) : (
          <>
            <Link to="/login" className="nav-link">Sign In</Link>
            <Link to="/signup" className="nav-btn">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;