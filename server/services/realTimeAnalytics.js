
const analyticsEmitter = require('../events/analyticsEvents');
let wss = null;

// Attach the WebSocket server instance
function attachWebSocketServer(serverInstance) {
  wss = serverInstance;
}

// Broadcast data to all connected WebSocket clients
function broadcast(event, data) {
  if (!wss) return;
  const message = JSON.stringify({ event, data });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

const initializeRealTimeAnalytics = () => {
  analyticsEmitter.on('user-activity', (activity) => {
    broadcast('user-activity', activity);
  });
  analyticsEmitter.on('session-start', (session) => {
    broadcast('session-start', session);
  });
  analyticsEmitter.on('session-end', (session) => {
    broadcast('session-end', session);
  });
  analyticsEmitter.on('custom-analytics', (payload) => {
    broadcast('custom-analytics', payload);
  });
  console.log('Real-time analytics service initialized and broadcasting.');
};

module.exports = {
  initializeRealTimeAnalytics,
  attachWebSocketServer,
  broadcast,
};
