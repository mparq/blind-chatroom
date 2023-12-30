const chatContainer = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');

// web socket protocol needs to change based on http protocol used to serve app
// https://stackoverflow.com/questions/74258122/codespaces-and-https
const wsp = window.location.protocol === 'https:' ? 'wss' : 'ws';
const ws = new WebSocket(`${wsp}://` + window.location.host);

// WebSocket connection opened
ws.addEventListener('open', (event) => {
    console.log('WebSocket connection opened:', event);
});

// WebSocket message received
ws.addEventListener('message', (event) => {
    processNewMessages(event.data);
});

function processNewMessages(messageJson) {
    let messages;
    try {
        messages = JSON.parse(messageJson);
    } catch (err) {
        console.error(`Error parsing websocket message: ${messageJson}`)
        throw err;
    }
    displayMessages(messages);
    scrollToBottom();
}

// function getMessages() {
//     fetch('/api/messages')
//         .then(response => response.json())
//         .then(data => {
//             displayMessages(data);
//         });
// }

function displayMessages(messages) {
    // chatMessages.innerHTML = '';
    messages.forEach(message => {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        messageElement.textContent = message;
        chatContainer.appendChild(messageElement);
    });
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
};

function sendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        ws.send(JSON.stringify(messageText));
        // fetch('/api/messages', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({ message: messageText }),
        // })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log(data);
        //         getMessages();
        //     });

        messageInput.value = '';
    }
}

// Handle "Enter" key press in the input box
messageInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        sendMessage();
    }
});

