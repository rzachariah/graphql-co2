import {
  GraphQLError
} from 'graphql/error';

import fetch from './utils/fetcher';
import config from './config.js';

const collectorRoot = config.collectorRoot;

function middleware(req, res, next) {
  var uri = decodeURI(req.originalUrl);
  const fullUrl = `${req.protocol}://${req.get('host')}${uri}`; 
  const start = Date.now();
  res.on('finish', function() {
      var duration = Date.now() - start;
      collect(req, fullUrl, duration, 'graphql-co2', true);
  });  
  next();
}

function collect(req, measuredUrl, latency, service, postExhaust) {
  const log = req.log;
  var decoded = decodeURI(measuredUrl);
  var condensed = condense(decoded);
  var collapseWhitespace = condensed.replace(/\s+/g, ' ');
  log.info(`Took ${latency}ms to process request URI ${collapseWhitespace}`)
  if (postExhaust) {
    const exhaust = {
      product: 'DigitalExhaust',
      service,
      url: decoded,
      latency
    };
    const sinkUrl = getApiMetricUrl();
    return post(req, sinkUrl, exhaust);  
  }
}

function condense(queryUrl) {
  var withoutBreaks = queryUrl.replace(/\r?\n|\r/g, ' ');
  var withoutTabs = withoutBreaks.replace(/\t/g, ' ');
  return withoutTabs;    
}

function getApiMetricUrl() {
  return `${collectorRoot}/collection/apisink`;
}

function post(req, url, body) {
  const log = req.log;
  var options = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }
  };
  log.debug(`POSTing to ${url}`);
  return fetch(url, options, req)
    .then(res => {
      if (res.ok) {
        log.debug(`POST succeeded to ${url}: ${res.status} ${res.statusText}`);
        return res;
      }
      throw `POST failed to ${url}: ${res.status} ${res.statusText}`;
    })
    .then(res => res.json())
    .catch(error => {
      log.error(error);
    });
}

export default {
  middleware,
  collect
}