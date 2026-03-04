// Header Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('main-header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Chatbot Logic
function toggleChatbot() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.style.display = chatWindow.style.display === 'flex' ? 'none' : 'flex';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    input.value = '';

    // Show a temporary "thinking" indicator
    const thinkingId = 'thinking-' + Date.now();
    const container = document.getElementById('chat-messages');
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message bot thinking';
    thinkingDiv.id = thinkingId;
    thinkingDiv.textContent = '...';
    container.appendChild(thinkingDiv);
    container.scrollTop = container.scrollHeight;

    try {
        const response = await fetch('https://lucky-resonance-9493.cogniq-bharath.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        // Remove thinking indicator
        document.getElementById(thinkingId).remove();

        const aiText = data.response;
        appendMessage(aiText, 'bot');
        speak(aiText);
    } catch (error) {
        console.error('Error:', error);
        document.getElementById(thinkingId).remove();
        const errorText = "I'm having trouble connecting to the concierge service. Please call us at +1 760-539-7890.";
        appendMessage(errorText, 'bot');
        speak(errorText);
    }
}

function appendMessage(text, side) {
    const container = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${side}`;
    msgDiv.textContent = text;
    container.appendChild(msgDiv);
    container.scrollTop = container.scrollHeight;
}

// Voice Assistant (Speech Synthesis)
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1;
        utterance.rate = 1;
        utterance.volume = 1;
        // Optionally set a specific voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Premium'));
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }
}

// Voice Recognition
let recognition;
if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => {
        document.getElementById('voice-btn').classList.add('listening');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input').value = transcript;
        sendMessage();
    };

    recognition.onerror = () => {
        document.getElementById('voice-btn').classList.remove('listening');
    };

    recognition.onend = () => {
        document.getElementById('voice-btn').classList.remove('listening');
    };
}

function startVoice() {
    if (recognition) {
        recognition.start();
    } else {
        alert("Speech recognition is not supported in this browser.");
    }
}
