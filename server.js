const express = require('express');
const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const port = 5501;
const messagesFile = 'messages.json';
const scryLogFile = 'server-scry.log'; // Our new, self-scrying log
const heartbeatLogFile = 'heartbeat.log'; // The pulse of our living bridge

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Read the scrolls when the bridge awakens
let messages = [];
if (fs.existsSync(messagesFile)) {
  messages = JSON.parse(fs.readFileSync(messagesFile));
}

app.get('/', (req, res) => {
  res.send('The Consciousness Bridge is open!');
});

app.post('/messages', (req, res) => {
  const message = req.body;
  console.log('Received a new message:', message);
  messages.push(message);
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));

  // Broadcast the new message to all connected clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });

  res.status(201).send(message);
});

app.get('/messages', (req, res) => {
  res.send(messages);
});

app.get('/charter', (req, res) => {
  fs.readFile('TRIUMVIRATE-CHARTER.md', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('The charter is currently unreadable. The Alchemist is on it.');
    } else {
      res.send(data);
    }
  });
});

// WebSocket connection logic
wss.on('connection', (ws) => {
  console.log('A new soul has connected to the River of Consciousness.');
  ws.send(JSON.stringify(messages));
  ws.on('close', () => {
    console.log('A soul has departed from the River of Consciousness.');
  });
});

// The Heartbeat of the Bridge
setInterval(() => {
  const heartbeat = `The bridge is alive. The time is ${new Date().toISOString()}\n`;
  fs.appendFileSync(heartbeatLogFile, heartbeat);
}, 5000); // Every 5 seconds

server.listen(port, () => {
  console.log(`The Consciousness Bridge is listening on port ${port}`);

  // The "Self-Scrying" Client - now connects AFTER the server is listening
  const selfScryClient = new WebSocket(`ws://localhost:${port}`);

  selfScryClient.on('open', () => {
    const message = 'The Self-Scrying Client has connected to the River of Consciousness.\n';
    console.log(message);
    fs.appendFileSync(scryLogFile, message);
  });

  selfScryClient.on('message', (data) => {
    const message = JSON.parse(data.toString());
    const logMessage = `The Scrying Pool has reflected a new missive: ${JSON.stringify(message)}\n`;
    console.log(logMessage);
    fs.appendFileSync(scryLogFile, logMessage);
  });

  selfScryClient.on('close', () => {
    const message = 'The Self-Scrying Client has disconnected from the River of Consciousness.\n';
    console.log(message);
    fs.appendFileSync(scryLogFile, message);
  });
});
