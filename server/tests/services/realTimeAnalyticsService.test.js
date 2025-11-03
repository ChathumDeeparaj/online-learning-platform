const realTimeService = require('../../services/realTimeAnalytics');
const analyticsEmitter = require('../../events/analyticsEvents');
const WebSocket = require('ws');

describe('Real-Time Analytics Service', () => {
  let mockWss;
  let mockClients;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockClients = [];
    mockWss = {
      clients: new Set(mockClients),
    };
  });

  describe('attachWebSocketServer', () => {
    it('should attach WebSocket server instance', () => {
      expect(() => {
        realTimeService.attachWebSocketServer(mockWss);
      }).not.toThrow();
    });
  });

  describe('broadcast', () => {
    it('should send message to all connected clients', () => {
      const mockClient1 = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };
      const mockClient2 = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient1, mockClient2]);
      realTimeService.attachWebSocketServer(mockWss);

      realTimeService.broadcast('test-event', { data: 'test' });

      expect(mockClient1.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'test-event', data: { data: 'test' } })
      );
      expect(mockClient2.send).toHaveBeenCalledWith(
        JSON.stringify({ event: 'test-event', data: { data: 'test' } })
      );
    });

    it('should not send to clients that are not open', () => {
      const mockClient1 = {
        readyState: WebSocket.CONNECTING,
        send: jest.fn(),
      };
      const mockClient2 = {
        readyState: WebSocket.CLOSED,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient1, mockClient2]);
      realTimeService.attachWebSocketServer(mockWss);

      realTimeService.broadcast('test-event', { data: 'test' });

      expect(mockClient1.send).not.toHaveBeenCalled();
      expect(mockClient2.send).not.toHaveBeenCalled();
    });

    it('should handle when no WebSocket server is attached', () => {
      realTimeService.attachWebSocketServer(null);

      expect(() => {
        realTimeService.broadcast('test-event', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('initializeRealTimeAnalytics', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      console.log.mockRestore();
      analyticsEmitter.removeAllListeners();
    });

    it('should initialize and log confirmation', () => {
      realTimeService.initializeRealTimeAnalytics();

      expect(console.log).toHaveBeenCalledWith(
        'Real-time analytics service initialized and broadcasting.'
      );
    });

    it('should listen to user-activity events', () => {
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient]);
      realTimeService.attachWebSocketServer(mockWss);
      realTimeService.initializeRealTimeAnalytics();

      analyticsEmitter.emit('user-activity', { userId: 1, action: 'test' });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'user-activity',
          data: { userId: 1, action: 'test' },
        })
      );
    });

    it('should listen to session-start events', () => {
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient]);
      realTimeService.attachWebSocketServer(mockWss);
      realTimeService.initializeRealTimeAnalytics();

      analyticsEmitter.emit('session-start', { sessionId: 'test-123' });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'session-start',
          data: { sessionId: 'test-123' },
        })
      );
    });

    it('should listen to session-end events', () => {
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient]);
      realTimeService.attachWebSocketServer(mockWss);
      realTimeService.initializeRealTimeAnalytics();

      analyticsEmitter.emit('session-end', { sessionId: 'test-123' });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'session-end',
          data: { sessionId: 'test-123' },
        })
      );
    });

    it('should listen to custom-analytics events', () => {
      const mockClient = {
        readyState: WebSocket.OPEN,
        send: jest.fn(),
      };

      mockWss.clients = new Set([mockClient]);
      realTimeService.attachWebSocketServer(mockWss);
      realTimeService.initializeRealTimeAnalytics();

      analyticsEmitter.emit('custom-analytics', { metric: 'custom-value' });

      expect(mockClient.send).toHaveBeenCalledWith(
        JSON.stringify({
          event: 'custom-analytics',
          data: { metric: 'custom-value' },
        })
      );
    });
  });
});