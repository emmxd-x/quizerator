import fitz  # PyMuPDF
import docx
import os

def extract_text(file_path: str) -> str:
    """
    Takes a file path, detects file type,
    extracts and returns all text as a string.
    """
    # Get the file extension (.pdf or .docx)
    extension = os.path.splitext(file_path)[1].lower()

    if extension == ".pdf":
        return extract_from_pdf(file_path)
    elif extension == ".docx":
        return extract_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}")


def extract_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    text = ""
    
    # Open the PDF
    doc = fitz.open(file_path)
    
    # Loop through every page and extract text
    for page in doc:
        text += page.get_text()
    
    doc.close()
    
    if not text.strip():
        raise ValueError("No text found in PDF. It may be a scanned image.")
    
    return text.strip()


def extract_from_docx(file_path: str) -> str:
    """Extract text from a DOCX file."""
    text = ""
    
    # Open the DOCX file
    document = docx.Document(file_path)
    
    # Loop through every paragraph and extract text
    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text += paragraph.text + "\n"
    
    if not text.strip():
        raise ValueError("No text found in DOCX file.")
    
    return text.strip()