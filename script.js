// Your API endpoints
const CHALLENGE_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/challenges';
const AI_COACH_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/ai-coach';

// Fetch daily challenge
async function fetchDailyChallenge() {
    try {
        const response = await fetch(CHALLENGE_API);
        const data = await response.json();
        displayChallenge(data);
    } catch (error) {
        console.error('Error fetching challenge:', error);
        document.getElementById('daily-challenge').innerHTML = 
            'Error loading challenge. Please try again.';
    }
}

// Display challenge
function displayChallenge(challenge) {
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

    try {
        const response = await fetch(AI_COACH_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        addMessage(data.response, 'ai');
    } catch (error) {
        console.error('Error sending message:', error);
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
}

// Handle enter key in input
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Load initial challenge
fetchDailyChallenge();
