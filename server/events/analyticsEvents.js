const EventEmitter = require('events');

class AnalyticsEmitter extends EventEmitter {}

const analyticsEmitter = new AnalyticsEmitter();

module.exports = analyticsEmitter;
