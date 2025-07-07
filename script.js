// Your API endpoints
const CHALLENGE_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/challenges';
const AI_COACH_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/ai-coach';

// Fetch daily challenge
async function fetchDailyChallenge() {
    try {
        const response = await fetch(CHALLENGE_API);
        const data = await response.json();
        console.log('Challenge API raw response:', data);
        
        // The challenge data is directly in the response, not in a body property
        if (data && data.type) {
            displayChallenge(data);
        } else {
            throw new Error('Invalid challenge data');
        }
    } catch (error) {
        console.error('Error fetching challenge:', error);
        document.getElementById('daily-challenge').innerHTML = 
            'Error loading challenge. Please try again.';
    }
}

// Display challenge
function displayChallenge(challenge) {
    console.log('Displaying challenge:', challenge);
    const challengeHtml = `
        <h3>${challenge.type}</h3>
        <p>${challenge.description}</p>
        <p>Points: ${challenge.points}</p>
        <div class="tips">
            <h4>Tips:</h4>
            <ul>
                ${challenge.tips.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        </div>
    `;
    document.getElementById('daily-challenge').innerHTML = challengeHtml;
}

// Helper function to remove a message by ID
function removeMessage(id) {
    const messageToRemove = document.getElementById(id);
    if (messageToRemove) {
        messageToRemove.remove();
    }
}

// Add message to chat with unique ID
function addMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    const messageId = `msg-${Date.now()}`;
    messageDiv.id = messageId;
    messageDiv.className = `message ${sender}-message`;
    
    // Check if the message contains HTML
    if (message.includes('<')) {
        messageDiv.innerHTML = message;
    } else {
        messageDiv.textContent = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageId;
}

// Send message to AI Coach
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    const loadingId = addMessage('Thinking...', 'ai');

    try {
        const response = await fetch(AI_COACH_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        console.log('AI API response:', data);

        removeMessage(loadingId);

        if (data.statusCode === 400) {
            throw new Error(JSON.parse(data.body).error || 'Bad request');
        }

        if (data.body) {
            const parsedBody = JSON.parse(data.body);
            if (parsedBody.response) {
                addMessage(parsedBody.response, 'ai');
            } else {
                throw new Error('Unexpected response format');
            }
        } else {
            throw new Error('Invalid response format');
        }
    } catch (error) {
        console.error('Error:', error.message);
        removeMessage(loadingId);
        addMessage(`Sorry, I encountered an error: ${error.message}`, 'ai');
    }
}

// Handle enter key in input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Add event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    // Initial challenge load
    fetchDailyChallenge();
    
    // Set up button click handlers
    document.querySelector('.refresh-btn').addEventListener('click', fetchDailyChallenge);
    document.querySelector('.send-btn').addEventListener('click', sendMessage);
    
    // Set up enter key handler for chat input
    document.getElementById('user-input').addEventListener('keypress', handleKeyPress);
});


