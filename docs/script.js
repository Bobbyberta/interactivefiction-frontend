// Update this URL to your Render deployment URL when available
const API_URL = 'https://your-render-app.onrender.com';
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
.then(response => response.json())
.then(data => {
    updateStory(data.history);
    addMessage(data.response, 'dm');
})
.catch(error => {
    console.error('Error:', error);
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