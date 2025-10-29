const WebSocket = require('ws');

const initializeAnalyticsSocket = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('Client connected to analytics socket');

    ws.on('message', (message) => {
      console.log('Received from client:', message);
    });

    ws.on('close', () => {
      console.log('Client disconnected from analytics socket');
    });

    // Send a welcome message
    ws.send(JSON.stringify({ message: 'Welcome to the real-time analytics dashboard!' }));
  });

  console.log('Analytics WebSocket server initialized.');

  return wss;
};

module.exports = { initializeAnalyticsSocket };
