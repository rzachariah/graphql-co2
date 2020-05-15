import config from './config';
import filterService from './filterservice';
import apiHelper from './apihelper';
import batchinsightGateway from './batchinsightgateway';
import aggregationService from './aggregationservice';

// default lookback is one year
const defaultLookback = 365 * 24 * 3600 * 1000;

function clientFilter(x) {
  return config.clientFirms.includes(x.firmCode) 
    && !config.ezeUsers.includes(x.username)
    && !x.username.toUpperCase().endsWith(`_${x.firmCode.toUpperCase()}`);
}

async function productionInteractions(req, start, end, inclusiveFilter) {
  start = start || Date.now() - defaultLookback;
  const log = req.log;
  const product = 'ims';
  const environment = 'AWSProd';
  if (!inclusiveFilter) {
    inclusiveFilter = (s) => true;
  }
  var url = apiHelper.getInteractions2Url(product, environment, null, start, end);
  log.info(`Request ${environment} interactions from ${start} to ${end}`)
  const json = await batchinsightGateway.get(req, url, apiHelper.isCacheable(end))
  return json.Items
    .filter(inclusiveFilter);
}

async function clientInteractions(req, firm, user, start, end) {
  start = start || Date.now() - defaultLookback;
  const startInt = apiHelper.getMillis(start);
  const exclusiveStart = startInt - 1;
  const product = 'ims';
  const environment = 'AWSProd';
  if (!firm && !user) {
    return productionInteractions(req, start, end, clientFilter);
  }
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    const res = await aggregationService.interactionsSince(req, product, environment, firm, filter, exclusiveStart);
    results = results.concat(res);
  }

  return results
    .sort((a, b) => Number(a.time) - Number(b.time));
}

function projectSession(session) {
  session.minutes = session.sessionMinutes;
  session.id = session.sessionId;
  return session;
}

async function productionSessions(req, start, end, inclusiveFilter) {
  start = start || Date.now() - defaultLookback;
  const log = req.log;
  const product = 'ims';
  const environment = 'AWSProd';
  if (!inclusiveFilter) {
    inclusiveFilter = (s) => true;
  }
  var url = apiHelper.getSessionsUrl(product, environment, null, start, end);
  log.info(`Request ${environment} sessions from ${start} to ${end}`)
  const json = await batchinsightGateway.get(req, url, apiHelper.isCacheable(end))
  return json.Items
    .filter(inclusiveFilter)
    .map(projectSession);
}

async function clientSessions(req, firm, user, start, end) {
  start = start || Date.now() - defaultLookback;
  if (!firm && !user) {
    return productionSessions(req, start, end, clientFilter);
  }
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    var url = apiHelper.getSessionsUrl(product, environment, firm, start, end);
    const res = await batchinsightGateway.get(req, url, apiHelper.isCacheable(end))
      .then(json => json.Items)
      .then(items => filterService.applyFilter(items, filter));
    results = results.concat(res);
  }
  return results
    .map(projectSession)
    .sort((a, b) => Number(a.time) - Number(b.time));
}

async function earlyAdopterInteractions(req, start, firm, user) {
  start = start || Date.now() - defaultLookback;
  const startInt = apiHelper.getMillis(start);
  const exclusiveStart = startInt - 1;
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    const res = await aggregationService.interactionsSince(req, product, environment, firm, filter, exclusiveStart);
    results = results.concat(res);
  }

  return results
    .sort((a, b) => Number(a.time) - Number(b.time));
}

async function earlyAdopterSessions(req, firm, user, start, end) {
  start = start || Date.now() - defaultLookback;
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    var url = apiHelper.getSessionsUrl(product, environment, firm, start, end);
    const res = await batchinsightGateway.get(req, url, apiHelper.isCacheable(end))
      .then(json => json.Items)
      .then(items => filterService.applyFilter(items, filter));
    results = results.concat(res);
  }
  return results
    .map(r => {
      r.minutes = r.sessionMinutes;
      return r;
    })
    .sort((a, b) => Number(a.time) - Number(b.time));
}

async function earlyAdopterSessions2(req, firm, user, start, end) {
  var logContext = {
    FirmAuthToken: firm,
    UserName: user,
    start,
    end
  }
  start = start || Date.now() - defaultLookback;
  const log = req.log;
  log.info('Starting earlyAdopterSessions2', logContext);
  const startInt = apiHelper.getMillis(start);
  const exclusiveStart = startInt - 1;
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    const res = await aggregationService.sessionsSince(req, product, environment, firm, filter, exclusiveStart, end);
    results = results.concat(res);
  }
  const response = results
    .map(r => {
      r.minutes = r.sessionMinutes;
      return r;
    })
    .sort((a, b) => Number(a.time) - Number(b.time));
  log.info('Completed earlyAdopterSessions2', logContext);
  return response;
}

async function bugcrowdSessions(req, start, end) {
  start = start || Date.now() - defaultLookback;
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  
  for (let firm of config.bugcrowdFirms) {
    const filter = filterService.getExcludeEzeFilter(firm);
    var url = apiHelper.getSessionsUrl(product, environment, firm, start, end);
    const res = await batchinsightGateway.get(req, url, apiHelper.isCacheable(end))
      .then(json => json.Items)
      .then(items => filterService.applyFilter(items, filter));
    results = results.concat(res);
  }
  return results
    .map(projectSession)
    .sort((a, b) => Number(a.time) - Number(b.time));
}

export default {
  clientFilter,
  clientInteractions,
  clientSessions,
  earlyAdopterInteractions,
  earlyAdopterSessions,
  earlyAdopterSessions2,
  bugcrowdSessions
};
