const chatContainer = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');

// web socket protocol needs to change based on http protocol used to serve app
// https://stackoverflow.com/questions/74258122/codespaces-and-https
const wsp = window.location.protocol === 'https:' ? 'wss' : 'ws';
const wsHostAddress = `${wsp}://` + window.location.host;
let ws = setupWebSocket(wsHostAddress);

function setupWebSocket(hostAddress) {
    const ws = new WebSocket(hostAddress);

    let errorOnConnect = false;

    // WebSocket connection opened
    ws.addEventListener('open', (event) => {
        console.log('WebSocket connection opened:', event);
        clearErrorMessage();
        clearReconnectButton();
    });

    ws.addEventListener('close', (event) => {
        console.warn(`WebSocket connection closed: ${event}`);
        if (!errorOnConnect) {
            // unsure about this logic. behavior I'm seeing: if connection gets dropped on server-side, we don't actually
            // get an 'error' event in browser WebSocket implementation, just a 'close' with a code and a reason.
            // but if we get an error on connecting (e.g. no internet connection or server is down), then we do get the
            // 'error' event. hmm. oh well.
            displayErrorMessage(`WebSocket error occured and the connection was closed. I recommend reconnecting.`);
        }
        displayReconnectButton();
    });

    ws.addEventListener('error', (event) => {
        errorOnConnect = true;
        // NOTE: most browser implementations strip any web socket error information due to security implications
        // we can't get much information here, other than showing a generic error message. Sad.
        // https://stackoverflow.com/questions/18803971/websocket-onerror-how-to-read-error-description
        console.error(`WebSocket error: There will be a better error message in the browser console.`);
        displayErrorMessage(`WebSocket error occurred on connection attempt. Server or internet is potentially down.`);
    })

    // WebSocket message received
    ws.addEventListener('message', (event) => {
        processNewMessages(event.data);
    });

    return ws;
}

function displayReconnectButton() {
    document.getElementById('reconnect-button').style.display = 'block';
}

function clearReconnectButton() {
    document.getElementById('reconnect-button').style.display = 'none';
}

function displayErrorMessage(message) {
    const errorMessageEl = document.getElementById('error-message');
    errorMessageEl.innerText = message;
    errorMessageEl.style.display = 'block';
}

function clearErrorMessage() {
    document.getElementById('error-message').style.display = 'none';
}

function reconnect() {
    ws = setupWebSocket(wsHostAddress);
}

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

