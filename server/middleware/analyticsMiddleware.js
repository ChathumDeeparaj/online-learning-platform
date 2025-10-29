const analyticsEmitter = require('../events/analyticsEvents');
const analyticsService = require('../services/analyticsService');

// Middleware to track all user activities and session events
const trackActivity = (req, res, next) => {
  // Attach or generate a session ID (for demo, use req.sessionID or fallback)
  const sessionId = req.sessionID || req.headers['x-session-id'] || `${Date.now()}-${Math.random()}`;
  if (!req.session) req.session = {};
  req.session.sessionId = sessionId;

  // Track every request (GET, POST, etc.)
  const activity = {
    userId: req.user ? req.user.id : null,
    sessionId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date(),
    referrer: req.get('Referrer') || req.get('Referer') || null,
  };
  analyticsService.logActivity(activity);
  analyticsEmitter.emit('user-activity', activity);

  // Session tracking: mark session start/end
  if (!req.session._started) {
    req.session._started = new Date();
    analyticsService.logSessionStart({
      userId: activity.userId,
      sessionId,
      startedAt: req.session._started,
      ip: activity.ip,
      userAgent: activity.userAgent,
    });
  }
  res.on('finish', () => {
    if (!req.session._ended) {
      req.session._ended = new Date();
      analyticsService.logSessionEnd({
        userId: activity.userId,
        sessionId,
        endedAt: req.session._ended,
        ip: activity.ip,
        userAgent: activity.userAgent,
      });
    }
  });
  next();
};

module.exports = { trackActivity };
