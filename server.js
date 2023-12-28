const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const WebSocket = require('ws');1

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server })

const port = process.env.PORT || 3000;

// In-memory message storage
let messages = [];

// WebSocket connection
wss.on('connection', (ws) => {
    // Send existing messages to the new client
    ws.send(JSON.stringify(messages));

    // Handle new messages from clients
    ws.on('message', (message) => {
        const newMessage = JSON.parse(message);
        messages.push(newMessage);

        // Broadcast the new message to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify([newMessage]));
            }
        });
    });
});

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

