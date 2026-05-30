import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QuestionCard from "../components/QuestionCard";
import Timer from "../components/Timer";
import "./Quiz.css";

const BACKEND_URL = "https://emmxd-x-quizerator-api.hf.space";

function Quiz() {
  const navigate = useNavigate();

  // File state
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

  // Settings state
  const [difficulty, setDifficulty] = useState("medium");
  const [numMcq, setNumMcq] = useState(5);
  const [numShort, setNumShort] = useState(3);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timePerQuestion, setTimePerQuestion] = useState(60);

  // Quiz state
  const [step, setStep] = useState("upload"); // upload | loading | quiz
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [revealed, setRevealed] = useState({});
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");

  // File handling
  const handleFiles = (newFiles) => {
    const valid = Array.from(newFiles).filter(
      (f) => f.name.endsWith(".pdf") || f.name.endsWith(".docx")
    );
    if (valid.length === 0) {
      setError("Only PDF and DOCX files are allowed.");
      return;
    }
    const combined = [...files, ...valid].slice(0, 3);
    setFiles(combined);
    setError("");
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  // Submit
  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please upload at least one file.");
      return;
    }
    setStep("loading");
    setError("");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("difficulty", difficulty);
    formData.append("num_mcq", numMcq);
    formData.append("num_short", numShort);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/generate-quiz`,
        formData
      );
      setQuiz(response.data.quiz);
      setRevealed({});
      setAnswers({});
      setCurrentQuestion(0);
      setStep("quiz");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again."
      );
      setStep("upload");
    }
  };

  const handleAnswer = (index, answer) => {
    setAnswers((prev) => ({ ...prev, [index]: answer }));
    setRevealed((prev) => ({ ...prev, [index]: true }));
  };

  const handleTimerExpire = () => {
    setRevealed((prev) => ({ ...prev, [currentQuestion]: true }));
    setTimeout(() => {
      if (currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion((prev) => prev + 1);
      }
    }, 1500);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      // Go to results
      navigate("/results", {
        state: { quiz, answers },
      });
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setStep("upload");
    setFiles([]);
    setQuiz(null);
    setRevealed({});
    setAnswers({});
    setCurrentQuestion(0);
    setError("");
  };

  return (
    <div className="quiz-page">

      {/* UPLOAD STEP */}
      {step === "upload" && (
        <div className="quiz-container">
          <div className="quiz-header">
            <h1>Generate Your Quiz</h1>
            <p>Upload your study material and configure your quiz settings</p>
          </div>

          <div className="quiz-layout">
            {/* LEFT: File Upload */}
            <div className="quiz-card">
              <h2 className="card-title">📄 Upload Files</h2>
              <p className="card-subtitle">Upload up to 3 PDF or DOCX files</p>

              {/* Drop Zone */}
              <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input").click()}
              >
                <div className="drop-icon">📁</div>
                <p className="drop-text">Drag & drop files here</p>
                <p className="drop-subtext">or click to browse</p>
                <p className="drop-hint">PDF, DOCX • Max 3 files</p>
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
                  multiple
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {/* File Cards */}
              {files.length > 0 && (
                <div className="file-list">
                  {files.map((file, index) => (
                    <div key={index} className="file-card">
                      <span className="file-icon">
                        {file.name.endsWith(".pdf") ? "📕" : "📘"}
                      </span>
                      <div className="file-info">
                        <p className="file-name">{file.name}</p>
                        <p className="file-size">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        className="file-remove"
                        onClick={() => removeFile(index)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Settings */}
            <div className="quiz-card">
              <h2 className="card-title">⚙️ Quiz Settings</h2>
              <p className="card-subtitle">Configure your quiz preferences</p>

              <div className="settings-list">
                <div className="setting-item">
                  <label>Difficulty Level</label>
                  <div className="difficulty-buttons">
                    {["easy", "medium", "hard"].map((d) => (
                      <button
                        key={d}
                        className={`diff-btn ${difficulty === d ? "active " + d : ""}`}
                        onClick={() => setDifficulty(d)}
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-item">
                  <label>Number of MCQs <span className="setting-value">{numMcq}</span></label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={numMcq}
                    onChange={(e) => setNumMcq(parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>0</span><span>20</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Short Answer Questions <span className="setting-value">{numShort}</span></label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={numShort}
                    onChange={(e) => setNumShort(parseInt(e.target.value))}
                    className="range-slider"
                  />
                  <div className="range-labels">
                    <span>0</span><span>10</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Timer per Question</label>
                  <div className="timer-toggle">
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={timerEnabled}
                        onChange={(e) => setTimerEnabled(e.target.checked)}
                      />
                      <span className="toggle-slider" />
                    </label>
                    <span className="toggle-label">
                      {timerEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  {timerEnabled && (
                    <div className="timer-options">
                      {[30, 60, 90, 120].map((t) => (
                        <button
                          key={t}
                          className={`timer-btn ${timePerQuestion === t ? "active" : ""}`}
                          onClick={() => setTimePerQuestion(t)}
                        >
                          {t}s
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && <p className="error-msg">{error}</p>}

              <button
                className="generate-btn"
                onClick={handleSubmit}
                disabled={files.length === 0}
              >
                ⚡ Generate Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STEP */}
      {step === "loading" && (
        <div className="loading-container">
          <div className="loading-card">
            <div className="loading-spinner" />
            <h2>Generating Your Quiz</h2>
            <p>AI is analyzing your documents...</p>
            <div className="loading-steps">
              <div className="loading-step active">📄 Extracting text</div>
              <div className="loading-step active">🤖 Processing with AI</div>
              <div className="loading-step active">✍️ Generating questions</div>
            </div>
          </div>
        </div>
      )}

      {/* QUIZ STEP */}
      {step === "quiz" && quiz && (
        <div className="quiz-container">
          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div className="progress-info">
              <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / quiz.questions.length) * 100)}% Complete</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Timer */}
          {timerEnabled && (
            <Timer
              key={currentQuestion}
              seconds={timePerQuestion}
              onExpire={handleTimerExpire}
            />
          )}

          {/* Question Card */}
          <QuestionCard
            question={quiz.questions[currentQuestion]}
            index={currentQuestion}
            revealed={revealed[currentQuestion]}
            selectedAnswer={answers[currentQuestion]}
            onAnswer={handleAnswer}
            onReveal={() => setRevealed((prev) => ({ ...prev, [currentQuestion]: true }))}
          />

          {/* Navigation */}
          <div className="quiz-navigation">
            <button
              className="nav-btn-quiz secondary"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
            >
              ← Previous
            </button>
            <button className="nav-btn-quiz danger" onClick={handleReset}>
              ↩ Start Over
            </button>
            <button className="nav-btn-quiz primary" onClick={handleNext}>
              {currentQuestion === quiz.questions.length - 1 ? "See Results →" : "Next →"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Quiz;