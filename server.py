import os

import PyPDF2
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

from ocr_service import extract_text_from_pdf as extract_text_with_ocr
from tts_service import clean_text, synthesize_text

app = Flask(__name__, template_folder="templates")
app.config["MAX_CONTENT_LENGTH"] = 16 * 1024 * 1024  # 16 MB

socketio = SocketIO(app)

UPLOAD_FOLDER = "static/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def is_pdf(file):
    """Return True when the uploaded file looks like a PDF."""
    return (
        file
        and file.filename
        and file.filename.lower().endswith(".pdf")
    )


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify({"error": "File is too large. Maximum size is 16 MB."}), 413


@app.route("/")
def index():
    return render_template("home.html")


@socketio.on("sendText")
def handle_text(data):
    text = data.get("text", "").strip()

    if len(text) < 10:
        emit("error", {"message": "Text too short for processing"})
        return

    print(f"Processing text-to-speech request ({len(text)} characters)")

    try:
        audio_url = synthesize_text(text)

        if audio_url:
            emit("audioReady", {"audioUrl": audio_url})
        else:
            emit("error", {"message": "Failed to generate speech"})

    except Exception as error:
        print(f"Text-to-speech processing error: {error}")
        emit("error", {"message": "Failed to generate speech"})


@app.route("/process_pdf", methods=["POST"])
def process_pdf():
    file = request.files.get("file")

    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    if not is_pdf(file):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        pdf_reader = PyPDF2.PdfReader(file)
        extracted_text = ""

        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            extracted_text += page_text + " "

        cleaned_text = clean_text(extracted_text)

        if not cleaned_text:
            return jsonify({"error": "No readable text was found in the PDF"}), 400

        print(
            f"PDF text extracted successfully "
            f"({len(cleaned_text)} characters)"
        )

        audio_url = synthesize_text(cleaned_text)

        if audio_url:
            return jsonify({"audioUrl": audio_url})

        return jsonify({"error": "Failed to generate speech"}), 500

    except Exception as error:
        print(f"Error processing PDF: {error}")
        return jsonify({"error": "Failed to process the PDF"}), 500


@app.route("/process_ocr", methods=["POST"])
def process_ocr():
    file = request.files.get("file")

    if not file or file.filename == "":
        return jsonify({"error": "No file uploaded"}), 400

    if not is_pdf(file):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        pdf_bytes = file.read()
        extracted_text = extract_text_with_ocr(pdf_bytes)

        if extracted_text:
            print(
                f"OCR completed successfully "
                f"({len(extracted_text)} characters extracted)"
            )
            return jsonify({"recognizedText": extracted_text})

        return jsonify({"error": "Failed to extract text from the PDF"}), 500

    except Exception as error:
        print(f"Error processing OCR: {error}")
        return jsonify({"error": "Failed to extract text from the PDF"}), 500


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    socketio.run(app, debug=debug_mode)
