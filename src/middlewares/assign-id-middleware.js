const uuid = require('uuid');
/**
 * Assign activity and trace-level
 */
const assignIdMiddleware = function(req, res, next) {
  let activityId = req.get('X-Request-Id') || req.get('x-request-id');
  if (!activityId) {
    activityId = uuid.v4();
    req.headers['X-Request-Id'] = activityId;
  }

  let traceLevel = req.get('X-Trace') || req.get('x-trace');
  if (!traceLevel) {
    traceLevel = 0;
    req.headers['X-Trace'] = 0;
  }

  next();
};

module.exports = assignIdMiddleware;