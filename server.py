import os

import PyPDF2
from flask import Flask, jsonify, render_template, request
from flask_socketio import SocketIO, emit

from ocr_service import extract_text_from_pdf as extract_text_with_ocr
from tts_service import clean_text, synthesize_text

app = Flask(__name__, template_folder="templates")
socketio = SocketIO(app)

UPLOAD_FOLDER = "static/uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/")
def index():
    return render_template("home.html")


@socketio.on("sendText")
def handle_text(data):
    text = data.get("text", "").strip()
    if len(text) < 10:
        emit("error", {"message": "Text too short for processing"})
        return

    print(f"🎙️ Processing text: {text}")
    audio_url = synthesize_text(text)

    if audio_url:
        emit("audioReady", {"audioUrl": audio_url})
    else:
        emit("error", {"message": "Failed to generate speech"})


@app.route("/process_pdf", methods=["POST"])
def process_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    try:
        pdf_reader = PyPDF2.PdfReader(file)
        extracted_text = ""

        for page in pdf_reader.pages:
            page_text = page.extract_text() or ""
            extracted_text += page_text + " "

        cleaned_text = clean_text(extracted_text)
        print(f"📄 Extracted text (cleaned): {cleaned_text}")

        audio_url = synthesize_text(cleaned_text)

        if audio_url:
            return jsonify({"audioUrl": audio_url})
        return jsonify({"error": "Failed to generate speech"}), 500

    except Exception as error:
        print(f"❌ Error processing PDF: {str(error)}")
        return jsonify({"error": str(error)}), 500


@app.route("/process_ocr", methods=["POST"])
def process_ocr():
    file = request.files.get("file")
    if not file or file.filename == "":
        return jsonify({"error": "No file or empty filename"}), 400

    try:
        pdf_bytes = file.read()
        extracted_text = extract_text_with_ocr(pdf_bytes)

        if extracted_text:
            return jsonify({"recognizedText": extracted_text})
        return jsonify({"error": "Failed to extract text"}), 500

    except Exception as error:
        print(f"❌ Error processing OCR: {str(error)}")
        return jsonify({"error": str(error)}), 500


if __name__ == "__main__":
    debug_mode = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    socketio.run(app, debug=debug_mode)
