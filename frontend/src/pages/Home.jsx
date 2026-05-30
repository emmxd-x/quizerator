import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <div className="home">

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">⚡ AI-Powered Quiz Generator</div>
          <h1 className="hero-title">
            Turn Any Document Into
            <span className="hero-highlight"> A Smart Quiz</span>
          </h1>
          <p className="hero-subtitle">
            Upload your PDF or DOCX files and let AI generate professional
            quizzes instantly. Perfect for students, teachers, and lifelong learners.
          </p>
          <div className="hero-buttons">
            <Link to="/quiz" className="btn-primary-lg">
              Generate Quiz Free →
            </Link>
            <a href="#features" className="btn-secondary-lg">
              See How It Works
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Files at once</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">20</span>
              <span className="stat-label">MCQs per quiz</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-number">3</span>
              <span className="stat-label">Difficulty levels</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="quiz-preview">
            <div className="preview-header">
              <span className="preview-dot red" />
              <span className="preview-dot yellow" />
              <span className="preview-dot green" />
              <span className="preview-title">Quiz Preview</span>
            </div>
            <div className="preview-question">
              <span className="preview-badge">MCQ</span>
              <p>What is the primary purpose of encapsulation in OOP?</p>
            </div>
            <div className="preview-options">
              <div className="preview-option">A. To increase code speed</div>
              <div className="preview-option correct">B. To bundle data and methods ✓</div>
              <div className="preview-option">C. To enable multiple inheritance</div>
              <div className="preview-option">D. To reduce memory usage</div>
            </div>
            <div className="preview-explanation">
              💡 Encapsulation bundles data and the methods that operate on that data within a single unit, restricting direct access to some components.
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="features">
        <h2 className="section-title">Everything You Need to Study Smarter</h2>
        <p className="section-subtitle">Powerful features designed for serious learners</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>Multi-File Upload</h3>
            <p>Upload up to 3 PDF or DOCX files at once. Quizerator combines all content into one comprehensive quiz.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Generated Questions</h3>
            <p>Powered by Google Gemini AI. Questions are extracted directly from your documents — not generic content.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💡</div>
            <h3>Explained Answers</h3>
            <p>Every MCQ comes with a 1-2 line explanation sourced from your document so you actually learn.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Optional Timer</h3>
            <p>Set a countdown per question to simulate exam conditions. Auto-advances when time runs out.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Score Tracking</h3>
            <p>Get a detailed results breakdown after every quiz. Track your performance over time.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📥</div>
            <h3>PDF Export</h3>
            <p>Download your quiz and results as a clean PDF to study offline or share with classmates.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Three simple steps to your perfect quiz</p>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Upload Your Files</h3>
            <p>Drag and drop up to 3 PDF or DOCX files. Lecture notes, textbooks, research papers — anything works.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Configure Your Quiz</h3>
            <p>Choose difficulty, number of MCQs and short answer questions, and whether to enable the timer.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate and Learn</h3>
            <p>AI generates your quiz in seconds. Answer questions, reveal explanations, track your score.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <h2>Ready to Study Smarter?</h2>
        <p>Join students who use Quizerator to ace their exams</p>
        <Link to="/quiz" className="btn-primary-lg">
          Generate Your First Quiz →
        </Link>
      </section>

    </div>
  );
}

export default Home;