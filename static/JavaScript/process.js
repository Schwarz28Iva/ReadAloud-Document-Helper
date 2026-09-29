// SelectÄƒm elementele necesare
const processFileBtn = document.getElementById('processBtn_sorcerer_file');
const processTextBtn = document.getElementById('processBtn_sorcerer_text');
const audioWrapper = document.querySelector('.audio-wrapper'); 
const processingOverlay = document.getElementById('processingOverlay');
const audioElement = document.getElementById('audio-player');

// Conectare la server prin WebSockets
const socket = io();

// AscultÄƒtor pentru opÈ›iuni (upload sau text)
document.querySelectorAll('input[name="voiceOption"]').forEach(input => {
    input.addEventListener('change', function () {
        const uploadArea = document.getElementById('drop_zone_sorcerer');
        const textArea = document.getElementById('textForSpeech');
        const fileInput = document.getElementById('fileInput_sorcerer');
        const textInputArea = document.querySelector('#textForSpeech .text-container');

        // ResetÄƒm butoanele È™i playerul audio la fiecare schimbare de mod
        audioWrapper.style.display = 'none';

        if (this.value === 'upload') {
            uploadArea.style.display = 'flex';
            textArea.style.display = 'none';
            processFileBtn.style.display = 'none';
            processTextBtn.style.display = 'none';

            // AfiÈ™Äƒm butonul doar dupÄƒ ce un fiÈ™ier este selectat
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

            // AfiÈ™Äƒm butonul doar dacÄƒ sunt minim 100 de caractere Ã®n text
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

// Gestionare procesare text (Sorcerer's Voice)
processTextBtn.addEventListener('click', function () {
    const text = document.querySelector('#textForSpeech .text-container').innerText.trim();

    if (text.length < 10) {
        alert("Text is too short. Please write at least 10 characters.");
        return;
    }

    console.log('ðŸ“¤ Sending text for processing...');
    processingOverlay.style.display = 'flex'; // AfiÈ™Äƒm mesajul de procesare

    socket.emit('sendText', { text: text });
});

// Gestionare rÄƒspuns de la server
socket.on('audioReady', function (data) {
    console.log('ðŸŽ§ Audio file received:', data.audioUrl);
    processingOverlay.style.display = 'none'; // Ascundem mesajul "Processing..."
    
    audioElement.src = data.audioUrl;
    audioWrapper.style.display = 'block'; // AfiÈ™Äƒm player-ul audio
});

socket.on('error', function (error) {
    console.error("âŒ Error from server:", error.message);
    processingOverlay.style.display = 'none'; // Ascundem mesajul "Processing..."
    alert("Error: " + error.message);
});

// Gestionare procesare fiÈ™ier (Sorcerer's Voice)
processFileBtn.addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput_sorcerer');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF file first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // AfiÈ™Äƒm animaÈ›ia de procesare
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
            alert("Error processing file: " + data.error);
        }
    })
    .catch(error => {
        processingOverlay.style.display = 'none';
        alert("An error occurred: " + error.message);
    });
});

// IniÈ›ializare: setÄƒm starea iniÈ›ialÄƒ corect
window.addEventListener('DOMContentLoaded', () => {
    const checkedOption = document.querySelector('input[name="voiceOption"]:checked');
    if (checkedOption) {
        checkedOption.dispatchEvent(new Event('change'));
    }
});

// SelectÄƒm elementele necesare
const processOCRBtn = document.getElementById('processBtn_enchant');
const ocrTextContainer = document.getElementById('recognizedText');

// Gestionare procesare OCR (Enchanted Vision)
processOCRBtn.addEventListener('click', function () {
    const fileInput = document.getElementById('fileInput_enchant');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a PDF file first.");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    // AfiÈ™Äƒm animaÈ›ia de procesare
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
            alert("Error processing OCR: " + data.error);
        }
    })
    .catch(error => {
        processingOverlay.style.display = 'none';
        alert("An error occurred: " + error.message);
    });
});
