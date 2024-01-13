const assert = require('assert');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server })

const port = process.env.PORT || 3000;

const MESSAGE_TYPES = {
    INITIAL_MESSAGES: 'initial',
    MESSAGE: 'message',
    PING: 'ping',
    PONG: 'pong'
};

// In-memory message storage
let messages = [];

// WebSocket connection
wss.on('connection', (ws) => {
    // Send existing messages to the new client
    ws.send(createMessage(MESSAGE_TYPES.INITIAL_MESSAGES, messages));

    // Handle new messages from clients
    ws.on('message', (message) => {
        const msg = parseMessage(message);
        if (msg.type === MESSAGE_TYPES.PING) {
            ws.send(createMessage(MESSAGE_TYPES.PONG, { original_ts: msg.ts }));
        } else if (msg.type === MESSAGE_TYPES.PONG) {
            // NOTE: currently, server doesn't send a ping explicitly. clients send pongs on receiving messages
            processServerPong(msg);
        } else {
            const newMessage = msg.data;
            messages.push(newMessage);

            // Broadcast the new message to all connected clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(createMessage(MESSAGE_TYPES.MESSAGE, [newMessage]));
                }
            })
        }
    });

    ws.on('close', (code, reason) => {
        console.log(`WebSocket connection closed. Code: ${code}, Reason: ${reason}`);
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

function messageType(wsMessage) {
    return wsMessage === 'ping' ? 'ping' : wsMessage === 'pingpong' ? 'pingpong' : 'message';
}

function createMessage(type, data) {
    assertValidMessageType(type);
    return JSON.stringify({
        type: type,
        data: data,
        ts: Date.now()
    });
}

function parseMessage(wsMessage) {
    msg = JSON.parse(wsMessage);
    assert(msg !== undefined && msg !== null, 'Invalid undefined or null message');
    assertValidMessageType(msg.type);
    return msg;
}

function assertValidMessageType(type) {
    assert(Object.values(MESSAGE_TYPES).includes(type), `Unknown message type [${type}] received`);
}

function processServerPong(pongMsg) {
    assert(pongMsg && pongMsg && pongMsg.data.original_ts, 'Pong message must have original timestamp to process');
    const original_ts = pongMsg.data.original_ts;
    const received_ts = Date.now();
    const elapsed_time = received_ts - original_ts;
    console.log(`[pingpong] rtt=${elapsed_time} | original_ts=${original_ts} | received_ts=${received_ts}`);
}

