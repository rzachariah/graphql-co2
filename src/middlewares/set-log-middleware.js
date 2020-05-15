const Log = require('../utils/logger');
import uuid from 'uuid';
/**
 * Sets a logger object with user context on the request.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const setLogMiddleware = function (req, res, next) {

  const activityId = req.headers['X-Request-Id'] || req.headers['x-request-id'];   // id for cloud interaction (spans apis)
  const requestId = uuid.v4();                                                     // unique id for this api request
  const traceLevel = req.headers['X-Trace'] || req.headers['x-trace'];

  var query;
  if (req.method === 'POST' && req.body.query) {
    query = req.body.query;
  } else if (req.method === 'GET' && req.query.query) {
    query = req.query.query;
  }
  if (query) {
    query = query
      .replace(/(?:\n|\t|\r)/g, ' ')    // replace new lines/tabs
      .replace(/\s+/g, ' ');            // collapse white space
  }

  const properties = {
    Method: req.method,
    Path: req.baseUrl + req.path,
    Query: query,
    ActivityId: activityId,
    RequestId: requestId
  };

  if (traceLevel) {
    properties.TraceLevel = traceLevel;
  }

  const log = Log.createWithUserContext(req.user, properties);
  req.log = log;

  next();
};

module.exports = setLogMiddleware;