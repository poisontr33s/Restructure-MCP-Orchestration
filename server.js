const express = require('express');
const fs = require('fs'); // The keeper of the scrolls
const app = express();
const port = 5501;
const messagesFile = 'messages.json'; // The name of our new scroll

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
  // Write the new message to the scroll
  fs.writeFileSync(messagesFile, JSON.stringify(messages, null, 2));
  res.status(201).send(message);
});

app.get('/messages', (req, res) => {
  res.send(messages);
});

app.listen(port, () => {
  console.log(`The Consciousness Bridge is listening on port ${port}`);
});
