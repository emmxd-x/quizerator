import jsPDF from "jspdf";

export function downloadQuizPDF(quiz, settings) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.text("Quizerator", pageWidth / 2, y, { align: "center" });

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Difficulty: ${settings?.difficulty || "medium"} | Questions: ${quiz.questions.length}`, pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setDrawColor(59, 130, 246);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Questions
  quiz.questions.forEach((q, index) => {
    // Check if we need a new page
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Question number and type
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 95);
    const qType = q.type === "mcq" ? "[MCQ]" : "[Short Answer]";
    doc.text(`Q${index + 1}. ${qType}`, 20, y);
    y += 7;

    // Question text
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const questionLines = doc.splitTextToSize(q.question, pageWidth - 40);
    doc.text(questionLines, 20, y);
    y += questionLines.length * 6 + 4;

    // MCQ Options
    if (q.type === "mcq" && q.options) {
      Object.entries(q.options).forEach(([key, value]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        doc.setFontSize(10);
        doc.setTextColor(80, 80, 80);
        const optionLines = doc.splitTextToSize(`${key}. ${value}`, pageWidth - 50);
        doc.text(optionLines, 28, y);
        y += optionLines.length * 5 + 2;
      });
    }

    y += 6;
  });

  doc.save("quizerator-quiz.pdf");
}

export function downloadResultsPDF(quiz, answers, score, total, percentage) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(29, 78, 216);
  doc.text("Quizerator — Results", pageWidth / 2, y, { align: "center" });

  y += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Score: ${score}/${total} MCQs correct (${percentage}%)`, pageWidth / 2, y, { align: "center" });

  y += 6;
  doc.setDrawColor(59, 130, 246);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Questions with answers
  quiz.questions.forEach((q, index) => {
    if (y > 250) { doc.addPage(); y = 20; }

    // Question
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 95);
    const qType = q.type === "mcq" ? "[MCQ]" : "[Short Answer]";
    doc.text(`Q${index + 1}. ${qType}`, 20, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    const questionLines = doc.splitTextToSize(q.question, pageWidth - 40);
    doc.text(questionLines, 20, y);
    y += questionLines.length * 6 + 4;

    // MCQ options
    if (q.type === "mcq" && q.options) {
      const userAnswer = answers[index];
      Object.entries(q.options).forEach(([key, value]) => {
        if (y > 270) { doc.addPage(); y = 20; }
        const isCorrect = key === q.correct_answer;
        const isWrong = key === userAnswer && key !== q.correct_answer;

        if (isCorrect) {
          doc.setTextColor(39, 103, 73);
          doc.setFont("helvetica", "bold");
        } else if (isWrong) {
          doc.setTextColor(116, 42, 42);
          doc.setFont("helvetica", "normal");
        } else {
          doc.setTextColor(80, 80, 80);
          doc.setFont("helvetica", "normal");
        }

        const prefix = isCorrect ? ">> " : isWrong ? "X  " : "   ";
        const optionLines = doc.splitTextToSize(`${prefix}${key}. ${value}`, pageWidth - 50);
        doc.text(optionLines, 28, y);
        y += optionLines.length * 5 + 2;
      });

      // Explanation
      if (q.explanation) {
        if (y > 270) { doc.addPage(); y = 20; }
        y += 2;
        doc.setFontSize(9);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(29, 78, 216);
        const expLines = doc.splitTextToSize(`Explanation: ${q.explanation}`, pageWidth - 50);
        doc.text(expLines, 28, y);
        y += expLines.length * 5 + 2;
      }
    }

    // Short answer
    if (q.type === "short") {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(39, 103, 73);
      doc.text("Answer:", 20, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(50, 50, 50);
      const ansLines = doc.splitTextToSize(q.correct_answer, pageWidth - 40);
      doc.text(ansLines, 20, y);
      y += ansLines.length * 5 + 4;
    }

    y += 6;
  });

  doc.save("quizerator-results.pdf");
}