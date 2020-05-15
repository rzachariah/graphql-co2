import express from 'express';
import graphQLHTTP from 'express-graphql';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'regenerator-runtime/runtime';

import schema from './schema/schema';
import Logger from './utils/logger';
const log = Logger.getLog();
import exhaust from './exhaust';
import pjson from '../package.json';
import config from './config';
import setMiddlewares from './middlewares';

const app = express();

const defaultPort = 3000;
var port = process.env.PORT || defaultPort;
var routingPath = config.routingPath;

app.use( bodyParser.json() );
app.use(cors());
app.get('/', (req, res) => {
  res.redirect(routingPath);
});
app.use(`${routingPath}/health`, (req, res) => {
  var report = {
      name: 'graphql-co2',
      status: 'OK',
      version: pjson.version
    };
  res.json(report);  
});
setMiddlewares(app);
app.use(routingPath, exhaust.middleware);
app.use(routingPath, graphQLHTTP({
  schema,
  graphiql: true
}))

app.listen(port, () => log.info(`Server started at http://localhost:${port}`));