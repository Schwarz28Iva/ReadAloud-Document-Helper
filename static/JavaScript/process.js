// Select required elements
const processFileBtn = document.getElementById('processBtn_sorcerer_file');
const processTextBtn = document.getElementById('processBtn_sorcerer_text');
const audioWrapper = document.querySelector('.audio-wrapper');
const processingOverlay = document.getElementById('processingOverlay');
const audioElement = document.getElementById('audio-player');

// Connect to the server through WebSockets
const socket = io();

// Handle voice input mode selection
document.querySelectorAll('input[name="voiceOption"]').forEach(input => {
    input.addEventListener('change', function () {
        const uploadArea = document.getElementById('drop_zone_sorcerer');
        const textArea = document.getElementById('textForSpeech');
        const fileInput = document.getElementById('fileInput_sorcerer');
        const textInputArea = document.querySelector('#textForSpeech .text-container');

        // Reset buttons and audio player whenever the input mode changes
        audioWrapper.style.display = 'none';

        if (this.value === 'upload') {
            uploadArea.style.display = 'flex';
            textArea.style.display = 'none';
            processFileBtn.style.display = 'none';
            processTextBtn.style.display = 'none';

            // Show the button only after a file has been selected
            fileInput.onchange = () => {
                if (fileInput.files.length > 0) {
                    processFileBtn.style.display = 'block';
                }
            };
        } else if (this.value === 'write') {
            uploadArea.style.display = 'none';
            textArea.style.display = 'block';
            processFileBtn.style.display = 'none';
            processTextBtn.style.display = 'none';

            // Show the button when the entered text contains at least 10 characters
            textInputArea.oninput = () => {
                if (textInputArea.innerText.trim().length >= 10) {
                    processTextBtn.style.display = 'block';
                } else {
                    processTextBtn.style.display = 'none';
                }
            };
        }
    });
});

// Process directly entered text
processTextBtn.addEventListener('click', function () {
    const text = document.querySelector('#textForSpeech .text-container').innerText.trim();

    if (text.length < 10) {
        alert('Text is too short. Please write at least 10 characters.');
        return;
    }

    console.log('Sending text for processing...');
    processingOverlay.style.display = 'flex';

    socket.emit('sendText', { text: text });
});

// Handle generated audio returned by the server
socket.on('audioReady', function (data) {
    console.log('Audio file received:', data.audioUrl);
    processingOverlay.style.display = 'none';

    audioElement.src = data.audioUrl;
    audioWrapper.style.display = 'block';
});

socket.on('error', function (error) {
    console.error('Error from server:', error.message);
    processingOverlay.style.display = 'none';
    alert('Error: ' + error.message);
});

// Process an uploaded PDF for text-to-speech
processFileBtn.addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput_sorcerer');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    processingOverlay.style.display = 'flex';

    fetch('/process_pdf', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        processingOverlay.style.display = 'none';

        if (data.audioUrl) {
            audioElement.src = data.audioUrl;
            audioWrapper.style.display = 'block';
        } else {
            alert('Error processing file: ' + data.error);
        }
    })
    .catch(error => {
        processingOverlay.style.display = 'none';
        alert('An error occurred: ' + error.message);
    });
});

// Initialize the currently selected voice input mode
window.addEventListener('DOMContentLoaded', () => {
    const checkedOption = document.querySelector('input[name="voiceOption"]:checked');
    if (checkedOption) {
        checkedOption.dispatchEvent(new Event('change'));
    }
});

// OCR elements
const processOCRBtn = document.getElementById('processBtn_enchant');
const ocrTextContainer = document.getElementById('recognizedText');

// Process an uploaded PDF with OCR
processOCRBtn.addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput_enchant');
    const file = fileInput.files[0];

    if (!file) {
        alert('Please select a PDF file first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    processingOverlay.style.display = 'flex';

    fetch('/process_ocr', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        processingOverlay.style.display = 'none';

        if (data.recognizedText) {
            ocrTextContainer.textContent = data.recognizedText;
            document.getElementById('ocrResult').style.display = 'block';
        } else {
            alert('Error processing OCR: ' + data.error);
        }
    })
    .catch(error => {
        processingOverlay.style.display = 'none';
        alert('An error occurred: ' + error.message);
    });
});
