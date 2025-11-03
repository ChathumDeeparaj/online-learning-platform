const { trackActivity } = require('../../middleware/analyticsMiddleware');
const analyticsService = require('../../services/analyticsService');
const analyticsEmitter = require('../../events/analyticsEvents');

jest.mock('../../services/analyticsService');
jest.mock('../../events/analyticsEvents');

describe('Track Activity Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      method: 'GET',
      originalUrl: '/test',
      ip: '127.0.0.1',
      headers: {},
      get: jest.fn((header) => {
        const headers = {
          'User-Agent': 'Jest Test Agent',
          'Referrer': 'http://example.com',
          'Referer': 'http://example.com',
        };
        return headers[header] || null;
      }),
      session: {},
      user: { id: 1 },
    };

    res = {
      on: jest.fn((event, callback) => {
        if (event === 'finish') {
          res.finishCallback = callback;
        }
      }),
    };

    next = jest.fn();

    analyticsService.logActivity = jest.fn();
    analyticsService.logSessionStart = jest.fn();
    analyticsService.logSessionEnd = jest.fn();
    analyticsEmitter.emit = jest.fn();
  });

  it('should log activity and emit event', () => {
    trackActivity(req, res, next);

    expect(analyticsService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        method: 'GET',
        path: '/test',
        ip: '127.0.0.1',
        userAgent: 'Jest Test Agent',
        referrer: 'http://example.com',
      })
    );

    expect(analyticsEmitter.emit).toHaveBeenCalledWith(
      'user-activity',
      expect.any(Object)
    );

    expect(next).toHaveBeenCalled();
  });

  it('should handle requests without authenticated user', () => {
    req.user = null;

    trackActivity(req, res, next);

    expect(analyticsService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
      })
    );
  });

  it('should create session ID if not exists', () => {
    delete req.session;
    
    trackActivity(req, res, next);

    expect(req.session).toBeDefined();
    expect(req.session.sessionId).toBeDefined();
    expect(typeof req.session.sessionId).toBe('string');
  });

  it('should use existing sessionID from request', () => {
    req.sessionID = 'existing-session-123';
    delete req.session;

    trackActivity(req, res, next);

    expect(req.session.sessionId).toBe('existing-session-123');
  });

  it('should use session ID from headers if available', () => {
    delete req.session;
    delete req.sessionID;
    req.headers = { 'x-session-id': 'header-session-456' };

    trackActivity(req, res, next);

    expect(req.session.sessionId).toBe('header-session-456');
  });

  it('should log session start on first request', () => {
    trackActivity(req, res, next);

    expect(analyticsService.logSessionStart).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        sessionId: expect.any(String),
        startedAt: expect.any(Date),
        ip: '127.0.0.1',
        userAgent: 'Jest Test Agent',
      })
    );

    expect(req.session._started).toBeInstanceOf(Date);
  });

  it('should not log session start if already started', () => {
    req.session._started = new Date();

    trackActivity(req, res, next);

    expect(analyticsService.logSessionStart).not.toHaveBeenCalled();
  });

  it('should log session end on response finish', () => {
    trackActivity(req, res, next);

    expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));

    // Simulate response finish
    res.finishCallback();

    expect(analyticsService.logSessionEnd).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        sessionId: expect.any(String),
        endedAt: expect.any(Date),
        ip: '127.0.0.1',
        userAgent: 'Jest Test Agent',
      })
    );

    expect(req.session._ended).toBeInstanceOf(Date);
  });

  it('should not log session end multiple times', () => {
    trackActivity(req, res, next);

    res.finishCallback();
    res.finishCallback();

    expect(analyticsService.logSessionEnd).toHaveBeenCalledTimes(1);
  });

  it('should handle missing referrer header', () => {
    req.get = jest.fn(() => null);

    trackActivity(req, res, next);

    expect(analyticsService.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({
        referrer: null,
      })
    );
  });

  it('should capture timestamp', () => {
    const beforeTime = new Date();
    trackActivity(req, res, next);
    const afterTime = new Date();

    const callArgs = analyticsService.logActivity.mock.calls[0][0];
    expect(callArgs.timestamp).toBeInstanceOf(Date);
    expect(callArgs.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(callArgs.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});