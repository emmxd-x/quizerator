import { supabase } from "./supabaseClient";

// Save a completed quiz to the database
export async function saveQuiz(userId, quizData, settings, answers) {
  // Calculate score
  const mcqQuestions = quizData.questions.filter(q => q.type === "mcq");
  const correctCount = mcqQuestions.filter((q, i) => {
    const globalIndex = quizData.questions.indexOf(q);
    return answers[globalIndex] === q.correct_answer;
  }).length;

  // Step 1: Insert quiz record
  const { data: quiz, error: quizError } = await supabase
  .from("quizzes")
  .insert({
    user_id: userId,
    title: `Quiz — ${new Date().toLocaleDateString()}`,
    difficulty: settings.difficulty,
    num_mcq: settings.num_mcq,
    num_short: settings.num_short,
    score: correctCount,
    total_mcq: mcqQuestions.length,
    collection_id: settings.collection_id || null,
  })
    .select()
    .single();

  if (quizError) {
    console.error("Error saving quiz:", quizError);
    return null;
  }

  // Step 2: Insert all questions
  const questionsToInsert = quizData.questions.map((q, index) => ({
    quiz_id: quiz.id,
    type: q.type,
    question_text: q.question,
    options: q.options || null,
    correct_answer: q.correct_answer,
    explanation: q.explanation || null,
    user_answer: answers[index] || null,
  }));

  const { error: questionsError } = await supabase
    .from("questions")
    .insert(questionsToInsert);

  if (questionsError) {
    console.error("Error saving questions:", questionsError);
    return null;
  }

  return quiz;
}

// Get all quizzes for a user
export async function getUserQuizzes(userId) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching quizzes:", error);
    return [];
  }

  return data;
}

// Get a single quiz with all questions
export async function getQuizWithQuestions(quizId) {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) return null;

  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });

  if (questionsError) return null;

  return { ...quiz, questions };
}

// Rename a quiz
export async function renameQuiz(quizId, newTitle) {
  const { error } = await supabase
    .from("quizzes")
    .update({ title: newTitle })
    .eq("id", quizId);

  return !error;
}

// Delete a quiz
export async function deleteQuiz(quizId) {
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId);

  return !error;
}

// Get all collections for a user
export async function getUserCollections(userId) {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
  return data;
}

// Create a new collection
export async function createCollection(userId, name) {
  const { data, error } = await supabase
    .from("collections")
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) {
    console.error("Error creating collection:", error);
    return null;
  }
  return data;
}

// Delete a collection
export async function deleteCollection(collectionId) {
  const { error } = await supabase
    .from("collections")
    .delete()
    .eq("id", collectionId);
  return !error;
}

// Get quizzes by collection
export async function getCollectionQuizzes(collectionId) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching collection quizzes:", error);
    return [];
  }
  return data;
}

// Get dashboard stats for a user
export async function getDashboardStats(userId) {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, collections(name)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching stats:", error);
    return null;
  }
  return data;
}

export async function renameCollection(collectionId, newName) {
  const { error } = await supabase
    .from("collections")
    .update({ name: newName })
    .eq("id", collectionId);
  return !error;
}