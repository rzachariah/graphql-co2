import config from '../config';

/**
 * logs every request except for health
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const logRequestMiddleware = function (req, res, next) {
  // Don't log health checks
  if (req.originalUrl.toLowerCase() === `${config.routingPath}/health`) {
    next();
    return;
  }

  const log = req.log;
  const start = Date.now();
  var logContext = {};
  log.info('Request | Start', logContext);

  // Response.end is the last method called before putting the bytes on the wire
  const originalReqEnd = res.end;
  res.end = function () {
    const end = Date.now();
    const duration = end - start;
    logContext.StatusCode = res.statusCode;
    logContext.Duration = duration;
    log.info('Request | End', logContext);
    originalReqEnd.apply(res, arguments);
  };
  next();
};

module.exports = logRequestMiddleware;