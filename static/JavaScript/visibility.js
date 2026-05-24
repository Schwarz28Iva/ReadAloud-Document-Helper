// Global variable to track the current state of the page
let currentState = "default"; // Possible values: "default", "enchanted", "sorcerer"

function resetProcessingButtons() {
    document.getElementById('processBtn_enchant').style.display = 'none';
    document.getElementById('processBtn_sorcerer_file').style.display = 'none';
    document.getElementById('processBtn_sorcerer_text').style.display = 'none';
    document.querySelector('.audio-wrapper').style.display = 'none'; // Hide audio player on service switch
}

function updateState(serviceId) {
    resetProcessingButtons(); // Reset buttons every time we switch the state
    const mainTitle = document.getElementById('main-title');
    const mainDescription = document.getElementById('main-description');
    const enchantContent = document.getElementById('lateral-content-enchant');
    const sorcererContent = document.getElementById('lateral-content-sorcerer');
    const textToSpeechService = document.getElementById('text-to-speech');
    const imageToTextService = document.getElementById('image-to-text');
    const ocrResult = document.getElementById('ocrResult');
    const audioPlayer = document.querySelector('.audio-wrapper');
    const textForSpeech = document.getElementById('textForSpeech');

    // Hide all lateral contents initially
    enchantContent.style.display = 'none';
    sorcererContent.style.display = 'none';
    ocrResult.style.display = 'none';
    audioPlayer.style.display = 'none';
    textForSpeech.style.display = 'none';
    // Reset visibility for all service titles and info
    document.querySelectorAll('.service-title, .service-info').forEach(el => el.style.display = '');

    switch (serviceId) {
        case 'image-to-text':
            currentState = 'enchanted'; // Set the current state
            history.pushState({ state: 'enchanted' }, "Enchanted Vision", "?enchanted-vision");
            mainTitle.textContent = 'Enchanted Vision';
            mainDescription.textContent = 'Transform images into editable text with ease.';
            enchantContent.style.display = 'flex'; // Show Enchanted Vision lateral content
            sorcererContent.style.display = 'none'; // Ensure Sorcerer's Voice content is hidden
            textToSpeechService.style.display = 'none'; // Hide text-to-speech service
            imageToTextService.style.display = 'flex'; // Ensure this service is visible
            // Specifically hide the current service's title and info
            document.querySelector('#image-to-text .service-title').style.display = 'none';
            document.querySelector('#image-to-text .service-info').style.display = 'none';
            break;
        case 'text-to-speech':
            currentState = 'default'; // Reset to default when going back to main page
            history.pushState({ state: 'default' }, "Default View", "?default");
            mainTitle.textContent = 'Sorcerer\'s Voice';
            mainDescription.textContent = 'Bring text to life with our simple text-to-speech service.';
            sorcererContent.style.display = 'flex'; // Show Sorcerer's Voice lateral content
            enchantContent.style.display = 'none'; // Ensure Enchanted Vision content is hidden
            textToSpeechService.style.display = 'flex'; // Show text-to-speech service
            imageToTextService.style.display = 'none'; // Hide Enchanted Vision service
            // Specifically hide the current service's title and info
            document.querySelector('#text-to-speech .service-title').style.display = 'none';
            document.querySelector('#text-to-speech .service-info').style.display = 'none';
            break;
        default:
            // Reset text and visibility for default state
            mainTitle.textContent = "Your Wizardly Assistant for Readings";
            mainDescription.textContent = "ReadAloud invites dreamers of all ages to experience the joy of reading in a whole new light, with a touch of magic.";
            enchantContent.style.display = 'none';
            sorcererContent.style.display = 'none';
            textToSpeechService.style.display = 'flex';
            imageToTextService.style.display = 'flex';
            break;
    }

    // Fade effect for the main title and description
    mainTitle.style.opacity = 0;
    mainDescription.style.opacity = 0;
    setTimeout(() => {
        mainTitle.style.opacity = 1;
        mainDescription.style.opacity = 1;
    }, 300);
}

// Event listeners for service selections
document.getElementById('image-to-text').addEventListener('click', () => updateState('image-to-text'));
document.getElementById('text-to-speech').addEventListener('click', () => updateState('text-to-speech'));

// Manage browser history state changes
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.state) {
        updateState(event.state.state === 'enchanted' ? 'image-to-text' : 'text-to-speech');
    } else {
        // Default back to initial state if no state is defined
        updateState('default'); // Return to the default state
    }
});



document.querySelectorAll('input[name="voiceOption"]').forEach(input => {
    input.addEventListener('change', function() {
        const uploadArea = document.getElementById('drop_zone_sorcerer');
        const textArea = document.getElementById('textForSpeech');
        
        if (this.value === 'upload') {
            uploadArea.style.display = 'flex';
            textArea.style.display = 'none';
        } else if (this.value === 'write') {
            uploadArea.style.display = 'none';
            textArea.style.display = 'block';
        }
    });
});

// Inițializare - asigurăm că starea inițială este setată corect
window.addEventListener('DOMContentLoaded', () => {
    const checkedOption = document.querySelector('input[name="voiceOption"]:checked');
    if (checkedOption) {
        checkedOption.dispatchEvent(new Event('change'));
    }
});
