import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // Track which step the user is on
  const [step, setStep] = useState("upload"); // upload | loading | quiz

  // Form state
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [numMcq, setNumMcq] = useState(3);
  const [numShort, setNumShort] = useState(2);

  // Quiz data from backend
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState("");

  // Track which answers are revealed
  const [revealed, setRevealed] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleSubmit = async () => {
    // Validate inputs
    if (!file) {
      setError("Please select a file first.");
      return;
    }
    if (numMcq + numShort === 0) {
      setError("Please request at least 1 question.");
      return;
    }

    setStep("loading");
    setError("");

    // Build form data to send to backend
    const formData = new FormData();
    formData.append("file", file);
    formData.append("difficulty", difficulty);
    formData.append("num_mcq", numMcq);
    formData.append("num_short", numShort);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/generate-quiz",
        formData
      );
      setQuiz(response.data.quiz);
      setRevealed({});
      setStep("quiz");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Please try again."
      );
      setStep("upload");
    }
  };

  const toggleReveal = (index) => {
    setRevealed((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleReset = () => {
    setStep("upload");
    setFile(null);
    setQuiz(null);
    setRevealed({});
    setError("");
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1>⚡ Quizerator</h1>
        <p>Upload a PDF or DOCX and generate a quiz instantly</p>
      </div>

      {/* STEP 1: UPLOAD + SETTINGS */}
      {step === "upload" && (
        <div className="card">
          {/* File Upload */}
          <div className="section">
            <h2>📄 Upload Your File</h2>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="file-input"
            />
            {file && (
              <p className="file-name">✅ Selected: {file.name}</p>
            )}
          </div>

          {/* Quiz Settings */}
          <div className="section">
            <h2>⚙️ Quiz Settings</h2>

            <div className="setting-row">
              <label>Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="setting-row">
              <label>Number of MCQs</label>
              <input
                type="number"
                min="0"
                max="10"
                value={numMcq}
                onChange={(e) => setNumMcq(parseInt(e.target.value))}
              />
            </div>

            <div className="setting-row">
              <label>Number of Short Answer Questions</label>
              <input
                type="number"
                min="0"
                max="10"
                value={numShort}
                onChange={(e) => setNumShort(parseInt(e.target.value))}
              />
            </div>
          </div>

          {/* Error */}
          {error && <p className="error">{error}</p>}

          {/* Submit */}
          <button className="btn-primary" onClick={handleSubmit}>
            Generate Quiz
          </button>
        </div>
      )}

      {/* STEP 2: LOADING */}
      {step === "loading" && (
        <div className="card center">
          <div className="spinner"></div>
          <p>Analyzing your document and generating quiz...</p>
          <p className="hint">This may take 10–20 seconds</p>
        </div>
      )}

      {/* STEP 3: QUIZ DISPLAY */}
      {step === "quiz" && quiz && (
        <div>
          <div className="quiz-header">
            <h2>📝 Your Quiz</h2>
            <button className="btn-secondary" onClick={handleReset}>
              ↩ Generate New Quiz
            </button>
          </div>

          {quiz.questions.map((q, index) => (
            <div key={index} className="question-card">
              <p className="question-number">
                Question {index + 1}
                <span className={`badge ${q.type}`}>
                  {q.type === "mcq" ? "MCQ" : "Short Answer"}
                </span>
              </p>
              <p className="question-text">{q.question}</p>

              {/* MCQ Options */}
              {q.type === "mcq" && (
                <div className="options">
                  {Object.entries(q.options).map(([key, value]) => (
                    <div
                      key={key}
                      className={`option ${
                        revealed[index] && key === q.correct_answer
                          ? "correct"
                          : ""
                      }`}
                    >
                      <span className="option-key">{key}</span> {value}
                    </div>
                  ))}
                </div>
              )}

              {/* Show Answer Button */}
              <button
                className="btn-reveal"
                onClick={() => toggleReveal(index)}
              >
                {revealed[index] ? "Hide Answer" : "Show Answer"}
              </button>

              {/* Answer Reveal */}
              {revealed[index] && (
                <div className="answer-box">
                  ✅ Correct Answer: <strong>{q.correct_answer}</strong>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;