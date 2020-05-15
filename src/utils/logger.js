'use strict';

const _ = require('lodash');
const Logger = require('eze-log');

var properties = {
  Product: 'Exhaust',
  Service: 'co2-graphql',
  AppDomain: 'Exhaust-GraphQL'
};
Logger.setConfiguration({
  context: properties
});

const log = new Logger();

/**
 * Create logger with user and context properties
 * @param {*} user User making the request
 * @param {*} context Context properties to log
 */
Logger.createWithUserContext = function (user = null, context = null) {
  let logContext = {};
  if (user && user.UserSession) {
    logContext.FirmId = user.UserSession.FirmId;
    logContext.FirmName = user.UserSession.FirmName;
    logContext.UserId = user.UserSession.UserId;
    logContext.UserName = user.UserSession.UserName;
    logContext.FirmAuthToken = user.UserSession.FirmAuthToken;
  }
  if (_.isNull(context) === false) {
    logContext = _.extend(context, logContext);
  }
  const logger = new Logger(logContext);
  return logger;
};

/**
 * Get logger from request or use a default one
 * @param {*} req Request context
 */
Logger.getLog = function (req) {
  return _.isUndefined(req) || _.isUndefined(req.log) ? log : req.log;
}

module.exports = Logger;