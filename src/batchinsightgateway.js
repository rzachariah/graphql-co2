import apiHelper from './apihelper';
import apiGateway from './apigateway';
import cache from './cache';
import config from './config';

const batchinsightRoot = config.batchinsightRoot;

function get(req, url, isCacheable) {
  const log = req.log;
  if (cache[url]) {
    log.info(`Found ${url} in cache`);
    return Promise.resolve(cache[url]);
  }
  return getHard(req, url)
    .then(result => {
      if (result.LastEvaluatedKey || isCacheable) {
        log.info(`Adding ${url} to cache with ${result.Items.length} items`);
        cache[url] = result;
      }
      if (result.LastEvaluatedKey) {
        var context = {
          url,
          time: result.LastEvaluatedKey.time,
          timeHuman: new Date(result.LastEvaluatedKey.time)
        }
        log.info('[getHard] Result was truncated', context);
      } else {
        log.info(`[getHard] Got all the data | ${url}`);
      }
      return result;
    });
}

function getHard(req, url) {
  const log = req.log;
  return apiGateway.get(req, url)
    .then(result => {
      log.info('Count ' + result.Count);
      return result;
    });
}

function scanInteractions(req, product, environment, firm, exclusiveStart, accumulator, seed, end) {
  const log = req.log;
  var start = exclusiveStart + 1;
  var url = apiHelper.getInteractions2Url(product, environment, firm, start, end);
  return get(req, url)
    .then(json => {
      var itemsUpToEnd = json.Items.filter(x => !end || x.time <= end);
      var next = accumulator(seed, itemsUpToEnd);
      if (json.LastEvaluatedKey  && (!end || json.LastEvaluatedKey.time < end)) {
        log.info('Scanning next page...');
        return scanInteractions(req, product, environment, firm, json.LastEvaluatedKey.time, accumulator, next, end);
      }
      log.info('Scan complete.');
      return next;
    });
}

function scanSessions(req, product, environment, firm, exclusiveStart, accumulator, seed, end) {
  const log = req.log;
  var start = exclusiveStart + 1;
  log.info('Scan from', {start});
  var url = apiHelper.getSessionsUrl(product, environment, firm, start, end);
  return getHard(req, url)
    .then(json => {
      var itemsUpToEnd = json.Items.filter(x => !end || x.time <= end);
      var next = accumulator(seed, itemsUpToEnd);
      if (json.LastEvaluatedKey && (!end || json.LastEvaluatedKey.time < end)) {
        log.info('Scanning next page...');
        return scanSessions(req, product, environment, firm, json.LastEvaluatedKey.time, accumulator, next, end);
      }
      log.info('Scan complete.');
      return next;
    });
}

function getRange(req, relativePath, product, start, end, options) {
  options = options || {};
  var roundingUnit = options.roundingUnit || config.roundingUnit;
  var window = options.window || config.window;
  var date = new Date();
  var rounded = new Date(Math.floor(date.getTime() / roundingUnit) * roundingUnit)
  end = end || rounded.getTime();
  start = start || end - window;
  product = product || config.defaultProduct;  
  var url = `${batchinsightRoot}/history/${relativePath}?product=${product}&start=${start}&end=${end}`;
  if (options.environment) {
    url += `&environment=${options.environment}`;
  }
  return get(req, url, isCacheable(end))
    .then(json => {
      return {
        items: json.Items,
        parameters: {
          product,
          start,
          end
        },
        count: json.Count,
        lastTime: json.LastEvaluatedKey ? json.LastEvaluatedKey.time : end,
        completed: !json.LastEvaluatedKey
      }
    });
}

function isCacheable(end) {
  const resolution = 1000 * 60 * 60;  // one hour
  return end && Number(end) < new Date().getTime() - resolution;
}

export default {
  get,
  scanInteractions,
  scanSessions,
  getRange,
};

