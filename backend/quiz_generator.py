from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv

# Load the API key from .env file
load_dotenv()

# Create the client using the new SDK
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Use gemini-2.0-flash — free and fast
MODEL = "gemini-2.0-flash"


def generate_quiz(text: str, difficulty: str, num_mcq: int, num_short: int) -> dict:
    """
    Takes extracted text and quiz settings.
    Returns a structured quiz as a Python dictionary.
    """

    prompt = f"""
You are a quiz generator. Based on the text below, generate a quiz with exactly:
- {num_mcq} multiple choice questions (MCQ)
- {num_short} short answer questions
- Difficulty level: {difficulty}

STRICT RULES:
1. Return ONLY a JSON object. No explanation, no markdown, no extra text.
2. Every MCQ must have exactly 4 options labeled A, B, C, D.
3. The correct_answer for MCQ must be one of: "A", "B", "C", or "D".
4. The correct_answer for short questions must be a brief, clear answer.

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
      "correct_answer": "A"
    }},
    {{
      "type": "short",
      "question": "Question text here?",
      "correct_answer": "Answer here"
    }}
  ]
}}

TEXT TO USE:
{text[:4000]}
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

        # Remove markdown code blocks if Gemini adds them
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        # Parse JSON
        quiz_data = json.loads(raw)
        return quiz_data

    except json.JSONDecodeError:
        raise ValueError("Gemini returned invalid JSON. Please try again.")
    except Exception as e:
        raise ValueError(f"Quiz generation failed: {str(e)}")