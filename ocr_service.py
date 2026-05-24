# ocr_service.py
import os

import pytesseract
from dotenv import load_dotenv
from pdf2image import convert_from_bytes

load_dotenv()

# Optional local setting. Example for Windows in .env:
# TESSERACT_CMD=C:\Program Files\Tesseract-OCR\tesseract.exe
tesseract_cmd = os.getenv("TESSERACT_CMD")
if tesseract_cmd:
    pytesseract.pytesseract.tesseract_cmd = tesseract_cmd


def extract_text_from_pdf(pdf_bytes):
    """
    Convert PDF bytes to images and apply OCR to extract text.
    Requires Tesseract OCR and Poppler to be installed on the system.
    """
    try:
        images = convert_from_bytes(pdf_bytes)
        extracted_text = ""

        for image in images:
            text = pytesseract.image_to_string(image, lang="eng")
            extracted_text += text + "\n"

        return extracted_text.strip()

    except Exception as error:
        print(f"Error extracting text: {str(error)}")
        return None
