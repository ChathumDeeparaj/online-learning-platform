const analyticsEmitter = require('../../events/analyticsEvents');
const EventEmitter = require('events');

describe('Analytics Events', () => {
  beforeEach(() => {
    analyticsEmitter.removeAllListeners();
  });

  it('should be an instance of EventEmitter', () => {
    expect(analyticsEmitter).toBeInstanceOf(EventEmitter);
  });

  it('should emit and listen to user-activity events', (done) => {
    const testData = { userId: 1, action: 'test' };

    analyticsEmitter.on('user-activity', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    analyticsEmitter.emit('user-activity', testData);
  });

  it('should emit and listen to session-start events', (done) => {
    const testData = { sessionId: 'test-123' };

    analyticsEmitter.on('session-start', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    analyticsEmitter.emit('session-start', testData);
  });

  it('should emit and listen to session-end events', (done) => {
    const testData = { sessionId: 'test-123' };

    analyticsEmitter.on('session-end', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    analyticsEmitter.emit('session-end', testData);
  });

  it('should emit and listen to custom-analytics events', (done) => {
    const testData = { metric: 'custom-value' };

    analyticsEmitter.on('custom-analytics', (data) => {
      expect(data).toEqual(testData);
      done();
    });

    analyticsEmitter.emit('custom-analytics', testData);
  });

  it('should support multiple listeners', () => {
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const testData = { userId: 1 };

    analyticsEmitter.on('user-activity', listener1);
    analyticsEmitter.on('user-activity', listener2);

    analyticsEmitter.emit('user-activity', testData);

    expect(listener1).toHaveBeenCalledWith(testData);
    expect(listener2).toHaveBeenCalledWith(testData);
  });

  it('should allow removing listeners', () => {
    const listener = jest.fn();
    const testData = { userId: 1 };

    analyticsEmitter.on('user-activity', listener);
    analyticsEmitter.removeListener('user-activity', listener);

    analyticsEmitter.emit('user-activity', testData);

    expect(listener).not.toHaveBeenCalled();
  });
});