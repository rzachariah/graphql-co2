const Logger = require('../utils/logger');

/**
 * logs the error before calling the default error handler.
 * @param {*} err 
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const logErrorMiddleware = function (err, req, res, next) {
  const log = Logger.getLog(req);
  log.error(err);
  next(err);
};

module.exports = logErrorMiddleware;