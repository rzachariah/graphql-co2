import config from './config';
const batchinsightRoot = config.batchinsightRoot;
const collectorRoot = config.collectorRoot;

function getMillis(millisString) {
  var millis = parseInt(millisString);
  if (isNaN(millis)) {
    millis = 0;
  }
  return millis;
}

function isCacheable(end) {
  const resolution = 1000 * 60 * 60;  // one hour
  return end && Number(end) < new Date().getTime() - resolution;
}

function getInteractions2Url(product, environment, firm, start, end) {
  var apiBase = `${batchinsightRoot}/history/interactions2`;
  return byProductEnvironmentStartEnd(apiBase, product, environment, firm, start, end);
}

function getSessionsUrl(product, environment, firm, start, end) {
  var apiBase = `${batchinsightRoot}/history/sessions`;
  return byProductEnvironmentStartEnd(apiBase, product, environment, firm, start, end);
}

function byProductEnvironmentStartEnd(apiBase, product, environment, firm, start, end) {
  var url = apiBase + '?';
  url += `product=${product}`;
  if (environment) {
    url += `&environment=${environment}`;
  }
  if (firm) {
    url += `&firm=${firm}`;
  }  
  if (!start) {
    start=0;
  }
  url += `&start=${start}`;
  if (end) {
    url += `&end=${end}`;
  }
  return url;
}

function getApiMetricUrl() {
  return `${collectorRoot}/collection/apisink`;
}

export default {
  getMillis,
  isCacheable,
  getInteractions2Url,
  getSessionsUrl,
  getApiMetricUrl
};