from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import shutil
import os
from extractor import extract_text
from quiz_generator import generate_quiz

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/")
def root():
    return {"status": "Quiz Generator API is running"}


@app.post("/api/generate-quiz")
async def generate_quiz_endpoint(
    files: List[UploadFile] = File(...),
    difficulty: str = Form(...),
    num_mcq: int = Form(...),
    num_short: int = Form(...),
):
    if len(files) > 3:
        raise HTTPException(
            status_code=400,
            detail="Maximum 3 files allowed."
        )

    combined_text = ""
    saved_paths = []

    for file in files:
        filename = file.filename
        if not filename.endswith((".pdf", ".docx")):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type: {filename}. Only PDF and DOCX allowed."
            )

        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_paths.append(file_path)

    try:
        for path in saved_paths:
            text = extract_text(path)
            combined_text += f"\n\n--- Content from {os.path.basename(path)} ---\n\n{text}"

        if len(combined_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Files have too little text to generate a quiz."
            )

        quiz = generate_quiz(combined_text, difficulty, num_mcq, num_short)
        return {"success": True, "quiz": quiz}

    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        for path in saved_paths:
            if os.path.exists(path):
                os.remove(path)