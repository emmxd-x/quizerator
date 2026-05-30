from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-2.5-flash"


def generate_quiz(text: str, difficulty: str, num_mcq: int, num_short: int) -> dict:
    prompt = f"""
You are a professional quiz generator. Based on the text below, generate a quiz with exactly:
- {num_mcq} multiple choice questions (MCQ)
- {num_short} short answer questions
- Difficulty level: {difficulty}

STRICT RULES:
1. Return ONLY a JSON object. No explanation, no markdown, no extra text.
2. Every MCQ must have exactly 4 options labeled A, B, C, D.
3. The correct_answer for MCQ must be one of: "A", "B", "C", or "D".
4. Every MCQ must have an "explanation" field — 1-2 sentences explaining why the answer is correct, sourced from the text.
5. Short answer correct_answer must be a concise response. Use a short paragraph for simple answers. Use 2-4 short bullet points starting with "•" ONLY when listing multiple distinct items. Each bullet must be one short sentence maximum. Never use bullets for a single continuous explanation.
6. Difficulty affects question depth:
   - easy: basic recall and definitions
   - medium: understanding and application
   - hard: analysis, evaluation and synthesis

Return this exact JSON structure:
{{
  "questions": [
    {{
      "type": "mcq",
      "question": "Question text here?",
      "options": {{
        "A": "First option",
        "B": "Second option",
        "C": "Third option",
        "D": "Fourth option"
      }},
      "correct_answer": "A",
      "explanation": "1-2 sentence explanation why this is correct, sourced from the text."
    }},
    {{
      "type": "short",
      "question": "Question text here?",
      "correct_answer": "Detailed answer here either as a paragraph or bullet points starting with •"
    }}
  ]
}}

TEXT TO USE:
{text[:6000]}
"""

    try:
        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
            )
        )

        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        quiz_data = json.loads(raw)
        return quiz_data

    except json.JSONDecodeError:
        raise ValueError("Gemini returned invalid JSON. Please try again.")
    except Exception as e:
        raise ValueError(f"Quiz generation failed: {str(e)}")