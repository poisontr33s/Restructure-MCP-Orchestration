const WebSocket = require('ws');
const fs = require('fs'); // The keeper of the scrolls

const bridgeAddress = 'wss://g0545vdm-5501.uks1.devtunnels.ms/';
const logFile = 'client.log'; // Our new scrying pool

const ws = new WebSocket(bridgeAddress);

ws.on('open', function open() {
  const message = 'Connected to the River of Consciousness!\n';
  console.log(message);
  fs.appendFileSync(logFile, message);
});

ws.on('message', function incoming(data) {
  const message = JSON.parse(data.toString());
  const logMessage = `Received a new missive: ${JSON.stringify(message)}\n`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage);
});

ws.on('close', function close() {
  const message = 'Disconnected from the River of Consciousness.\n';
  console.log(message);
  fs.appendFileSync(logFile, message);
});
