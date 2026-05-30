import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

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
        <Link
          to="/quiz"
          className={`nav-link ${location.pathname === "/quiz" ? "active" : ""}`}
        >
          Generate Quiz
        </Link>
        <Link to="/quiz" className="nav-btn">
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;