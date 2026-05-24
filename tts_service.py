# tts_service.py
import base64
import json
import os
import re
import time

import requests
from dotenv import load_dotenv

load_dotenv()

# Keep secrets outside the repository. Create a local .env file with:
# GOOGLE_TTS_API_KEY=your_api_key_here
API_KEY = os.getenv("GOOGLE_TTS_API_KEY")

AUDIO_DIR = "static/audio/"
os.makedirs(AUDIO_DIR, exist_ok=True)


def synthesize_text(text):
    if not API_KEY:
        print("❌ Missing GOOGLE_TTS_API_KEY. Add it to a local .env file.")
        return None

    url = f"https://texttospeech.googleapis.com/v1/text:synthesize?key={API_KEY}"
    headers = {"Content-Type": "application/json"}
    body = {
        "input": {"text": text},
        "voice": {"languageCode": "en-US", "ssmlGender": "NEUTRAL"},
        "audioConfig": {"audioEncoding": "MP3"},
    }

    response = requests.post(url, headers=headers, data=json.dumps(body), timeout=30)

    if response.status_code == 200:
        response_data = response.json()
        audio_content = response_data.get("audioContent")

        if audio_content:
            timestamp = int(time.time())
            audio_filename = f"audio_{timestamp}.mp3"
            audio_path = os.path.join(AUDIO_DIR, audio_filename)

            with open(audio_path, "wb") as audio_file:
                audio_file.write(base64.b64decode(audio_content))

            print(f"✅ Audio file generated: {audio_path}")
            return f"/static/audio/{audio_filename}"

    print(f"❌ Error: {response.text}")
    return None


def clean_text(text):
    """
    Clean extracted PDF text for more natural text-to-speech output.
    """
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\s([?.!,:;])", r"\1", text)
    text = text.replace(" .", ".")
    text = text.replace(" ,", ",")
    text = text.replace(" !", "!")
    text = text.replace(" ?", "?")
    return text.strip()
