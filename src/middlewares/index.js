import config from '../config';
const routingPath = config.routingPath;
function setMiddlewares(app) {  
  app.use(routingPath, require('./log-error-middleware'));
  app.use(routingPath, require('./assign-id-middleware'));
  app.use(routingPath, require('./set-log-middleware'));
  app.use(routingPath, require('./log-request-middleware'));
};

module.exports = setMiddlewares;

export default {
  setMiddlewares
}