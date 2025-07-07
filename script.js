// Your API endpoints
const CHALLENGE_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/challenges';
const AI_COACH_API = 'https://gff4sz3oka.execute-api.us-east-1.amazonaws.com/dev/ai-coach';

// Fetch daily challenge
async function fetchDailyChallenge() {
    try {
        const response = await fetch(CHALLENGE_API);
        const data = await response.json();
        console.log('Challenge API response:', data);
        
        // Assuming the challenge data is directly in the response object
        if (data && data.type && data.description) {
            displayChallenge(data);
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
    console.log('Displaying challenge:', challenge);
    const challengeHtml = `
        <h3>${challenge.type || 'Unknown Type'}</h3>
        <p>${challenge.description || 'No description available'}</p>
        <p>Points: ${challenge.points || 'N/A'}</p>
        <div class="tips">
            <h4>Tips:</h4>
            <ul>
                ${(challenge.tips && challenge.tips.length) ? 
                  challenge.tips.map(tip => `<li>${tip}</li>`).join('') : 
                  '<li>No tips available</li>'}
            </ul>
        </div>
    `;
    document.getElementById('daily-challenge').innerHTML = challengeHtml;
}

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
        console.log('AI API raw response:', data);
        console.log('AI API response type:', typeof data);
        console.log('AI API response keys:', Object.keys(data));
        
        removeMessage(loadingId);

        // If data is stringified JSON, try to parse it
        let processedData = data;
        if (typeof data === 'string') {
            try {
                processedData = JSON.parse(data);
            } catch (e) {
                console.log('Failed to parse string response');
            }
        }

        console.log('Processed data:', processedData);

        // Try different ways to access the response
        let aiResponse;
        if (processedData.response) {
            aiResponse = processedData.response;
        } else if (processedData.body) {
            // If body is a string, try to parse it
            if (typeof processedData.body === 'string') {
                try {
                    const parsedBody = JSON.parse(processedData.body);
                    aiResponse = parsedBody.response;
                } catch (e) {
                    aiResponse = processedData.body;
                }
            } else {
                aiResponse = processedData.body;
            }
        }

        if (aiResponse) {
            addMessage(aiResponse, 'ai');
        } else {
            console.error('Could not find response in:', processedData);
            throw new Error('Invalid AI response structure');
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

