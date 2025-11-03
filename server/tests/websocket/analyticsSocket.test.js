const WebSocket = require('ws');
const http = require('http');
const { initializeAnalyticsSocket } = require('../../websocket/analyticsSocket');
const realTimeService = require('../../services/realTimeAnalytics');

describe('Analytics WebSocket', () => {
  let server, wss, client;
  let port;

  beforeAll((done) => {
    server = http.createServer();
    wss = initializeAnalyticsSocket(server);
    realTimeService.attachWebSocketServer(wss);
    
    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterEach((done) => {
    if (client && client.readyState === WebSocket.OPEN) {
      client.once('close', () => done());
      client.close();
    } else {
      done();
    }
  });

  afterAll((done) => {
    wss.close();
    server.close(done);
  });

  it('should accept WebSocket connections', (done) => {
    client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      expect(client.readyState).toBe(WebSocket.OPEN);
      done();
    });

    client.on('error', done);
  });

  it('should receive welcome message on connection', (done) => {
    client = new WebSocket(`ws://localhost:${port}`);

    client.on('message', (data) => {
      const message = JSON.parse(data.toString());
      expect(message).toHaveProperty('message');
      expect(message.message).toContain('Welcome to the real-time analytics dashboard!');
      done();
    });

    client.on('error', done);
  });

  it('should log client connection', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      expect(consoleSpy).toHaveBeenCalledWith('Client connected to analytics socket');
      consoleSpy.mockRestore();
      done();
    });

    client.on('error', done);
  });

  it('should log client disconnection', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      client.close();
    });

    client.on('close', () => {
      expect(consoleSpy).toHaveBeenCalledWith('Client disconnected from analytics socket');
      consoleSpy.mockRestore();
      done();
    });

    client.on('error', done);
  });

  it('should receive messages from client', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    client = new WebSocket(`ws://localhost:${port}`);

    client.on('open', () => {
      client.send('Test message from client');
      
      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Received from client:',
          expect.any(Buffer)
        );
        consoleSpy.mockRestore();
        done();
      }, 100);
    });

    client.on('error', done);
  });

  it('should broadcast analytics events to all connected clients', (done) => {
    const client1 = new WebSocket(`ws://localhost:${port}`);
    const client2 = new WebSocket(`ws://localhost:${port}`);
    
    let messagesReceived = 0;
    const expectedEvent = {
      event: 'user-activity',
      data: { userId: 1, action: 'test' },
    };

    const messageHandler = (data) => {
      const message = JSON.parse(data.toString());
      
      if (message.event === 'user-activity') {
        expect(message).toEqual(expectedEvent);
        messagesReceived++;
        
        if (messagesReceived === 2) {
          client1.close();
          client2.close();
          done();
        }
      }
    };

    client1.on('message', messageHandler);
    client2.on('message', messageHandler);

    let openCount = 0;
    const onOpen = () => {
      openCount++;
      if (openCount === 2) {
        // Both clients connected, broadcast event
        realTimeService.broadcast('user-activity', { userId: 1, action: 'test' });
      }
    };

    client1.on('open', onOpen);
    client2.on('open', onOpen);
    
    client1.on('error', done);
    client2.on('error', done);
  });
});
