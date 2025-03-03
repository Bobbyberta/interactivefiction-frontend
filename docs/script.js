// Update this URL to your Render deployment URL when available
// For local development
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001'
    : 'https://interactivefiction-sl2f.onrender.com';  // Make sure this matches your actual Render URL

// Add debug logging
console.log('Using API URL:', API_URL);

const storyContainer = document.getElementById('story-container');
const playerInput = document.getElementById('player-input');
const sendButton = document.querySelector('button');

// Initial DM message
fetch(`${API_URL}/api/story`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({input: 'start game'})
})
.then(response => {
    console.log('Response status:', response.status);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
})
.then(data => {
    console.log('Response data:', data);
    updateStory(data.history);
    addMessage(data.response, 'dm');
})
.catch(error => {
    console.error('Detailed error:', error);
    console.error('Stack trace:', error.stack);
    addMessage("Connection error. Please try again later.", 'dm');
});

function sendMessage() {
    const input = playerInput.value.trim();
    if (!input) return;

    // Disable input and show loading state
    playerInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = 'Thinking...';

    // Add player message to UI
    addMessage(input, 'player');
    playerInput.value = '';

    // Send to backend
    fetch(`${API_URL}/api/story`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({input: input})
    })
    .then(response => response.json())
    .then(data => {
        addMessage(data.response, 'dm');
        storyContainer.scrollTop = storyContainer.scrollHeight;
    })
    .catch(error => {
        console.error('Error:', error);
        addMessage("Connection error. Please try again.", 'dm');
    })
    .finally(() => {
        // Re-enable input
        playerInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
        playerInput.focus();
    });
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    messageDiv.textContent = `${type === 'dm' ? 'DM' : 'Player'}: ${text}`;
    storyContainer.appendChild(messageDiv);
    storyContainer.scrollTop = storyContainer.scrollHeight;
}

function updateStory(history) {
    storyContainer.innerHTML = '';
    if (history && history.length) {
        history.forEach((message, index) => {
            addMessage(message, index % 2 === 0 ? 'player' : 'dm');
        });
    }
}

// Handle Enter key
playerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
}); 