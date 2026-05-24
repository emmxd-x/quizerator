from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from extractor import extract_text
from quiz_generator import generate_quiz

# Create the FastAPI app
app = FastAPI()

# Allow frontend to talk to backend
# (This is called CORS — we'll explain below)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://quizerator.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder where uploaded files are temporarily saved
UPLOAD_DIR = "uploads"


@app.get("/")
def root():
    """Health check — confirms server is running."""
    return {"status": "Quiz Generator API is running"}


@app.post("/api/generate-quiz")
async def generate_quiz_endpoint(
    file: UploadFile = File(...),
    difficulty: str = Form(...),
    num_mcq: int = Form(...),
    num_short: int = Form(...),
):
    """
    Main endpoint. Receives:
    - file: PDF or DOCX
    - difficulty: easy / medium / hard
    - num_mcq: number of MCQ questions
    - num_short: number of short answer questions

    Returns: structured quiz JSON
    """

    # Step 1: Validate file type
    filename = file.filename
    if not filename.endswith((".pdf", ".docx")):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only PDF and DOCX are allowed."
        )

    # Step 2: Save file temporarily to disk
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Step 3: Extract text from the file
        text = extract_text(file_path)

        # Step 4: Validate we got enough text
        if len(text) < 100:
            raise HTTPException(
                status_code=400,
                detail="File has too little text to generate a quiz."
            )

        # Step 5: Generate quiz using Gemini
        quiz = generate_quiz(text, difficulty, num_mcq, num_short)

        # Step 6: Return the quiz to the frontend
        return {"success": True, "quiz": quiz}

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Step 7: Always delete the uploaded file after processing
        if os.path.exists(file_path):
            os.remove(file_path)