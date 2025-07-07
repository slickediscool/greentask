// Your API endpoints
const CHALLENGE_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/challenges';
const AI_COACH_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/ai-coach';

// Fetch daily challenge
async function fetchDailyChallenge() {
    try {
        const response = await fetch(CHALLENGE_API);
        const data = await response.json();
        if (data && data.body) {
            // Parse the body if it's a string
            const challenge = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            displayChallenge(challenge);
        } else {
            console.error('Invalid challenge data:', data);
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
    console.log('Displaying challenge:', challenge); // Debug log
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

// Send message to AI Coach
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;

    addMessage(message, 'user');
    input.value = '';

    // Show loading message
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
        
        // Remove loading message
        removeMessage(loadingId);

        // Display AI response
        if (data && data.body) {
            const aiResponse = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
            addMessage(aiResponse.response, 'ai');
        } else {
            throw new Error('Invalid AI response');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        removeMessage(loadingId);
        addMessage('Sorry, I encountered an error. Please try again.', 'ai');
    }
}

// Add message to chat
function addMessage(message, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv.id = `msg-${Date.now()}`; // Return id for potential removal
}

// Remove message from chat
function removeMessage(id) {
    const messageToRemove = document.getElementById(id);
    if (messageToRemove) {
        messageToRemove.remove();
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

