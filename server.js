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

app.get('/health', (req, res, next) => {
    res.type('application/json');
    try {
        res.send(JSON.stringify(healthCheck()));
    } catch (err) {
        next(err);
    }
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal server error.');
})

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

function healthCheck() {
    clientCounts = {
        "Closed": 0,
        "Open": 0,
        "Closing": 0,
        "Connecting": 0,
        "Unknown": 0
    };
    wss.clients.forEach((client) => {
        const state =
            client.readyState === WebSocket.CLOSED ? "Closed" :
            client.readyState === WebSocket.OPEN ? "Open" :
            client.readyState === WebSocket.CLOSING ? "Closing" :
            client.readyState === WebSocket.CONNECTING ? "Connecting" :
            "Unknown" ;
        clientCounts[state] = (clientCounts[state] || 0) + 1
    });
    return {
        clientCounts
    };
}
