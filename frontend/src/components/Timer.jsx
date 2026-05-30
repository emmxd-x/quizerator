import { useState, useEffect } from "react";

function Timer({ seconds, onExpire }) {
  const [timeLeft, setTimeLeft] = useState(seconds);

  useEffect(() => {
    if (timeLeft === 0) {
      onExpire();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const percentage = (timeLeft / seconds) * 100;
  const isWarning = timeLeft <= 10;

  return (
    <div className={`timer-container ${isWarning ? "warning" : ""}`}>
      <div className="timer-bar">
        <div
          className="timer-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="timer-text">
        ⏱️ {timeLeft}s remaining
      </span>
    </div>
  );
}

export default Timer;