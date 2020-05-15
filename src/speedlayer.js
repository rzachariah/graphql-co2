import config from './config';
import filterService from './filterservice';
import aggregationService from './aggregationservice';
import util from './util';

async function getOmtm(req, exclusiveStart, firm, user, end) {
  const log = req.log;
  log.info('Speed query for omtm...');
  const startTime = new Date().getTime();
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    const res = await aggregationService.countInteractionsSince(req, product, environment, firm, filter, exclusiveStart, end);
    log.info(`Speed intermediate for firm ${firm}: ${JSON.stringify(res)}`);
    results.push(res);
  }
  var omtm = {
    evaluatedTime: results.map(r => r.evaluatedTime).reduce(util.max, 0),
    value: results.map(r => r.value).reduce(util.add, 0),
    newsTime: results.map(r => r.newsTime).reduce(util.max, 0),
    unit: results[0].unit
  }
  const endTime = new Date().getTime();
  const latency = endTime - startTime;
  log.info(`Speed query for omtm complete. Result ${JSON.stringify(omtm)}. Latency ${latency}`);
  return omtm;
}

async function getAmtm(req, exclusiveStart, firm, user, end) {
  const log = req.log;
  const logContext = { exclusiveStart, firm, user};
  log.info('Speed query for amtm...', logContext);
  const startTime = new Date().getTime();
  const product = 'ims';
  const environment = 'AWSProd';
  let results = [];
  var includedFirms = firm ? [firm] : config.clientFirms;
  for (let firm of includedFirms) {
    const filter = user ? filterService.getUserFilter(user) : filterService.getExcludeEzeFilter(firm);
    const res = await aggregationService.sumSessionMinutesSince(req, product, environment, firm, filter, exclusiveStart, end);
    log.info(`Speed intermediate for firm ${firm}: ${JSON.stringify(res)}`, logContext);
    results.push(res);
  }
  var amtm = {
    evaluatedTime: results.map(r => r.evaluatedTime).reduce(util.max, 0),
    value: results.map(r => r.value).reduce(util.add, 0),
    newsTime: results.map(r => r.newsTime).reduce(util.max, 0),
    unit: results[0].unit
  }
  const endTime = new Date().getTime();
  const latency = endTime - startTime;
  log.info(`Speed query for amtm complete. Result ${JSON.stringify(amtm)}. Latency ${latency}`, logContext);
  return amtm;
}

export default {
  getOmtm,
  getAmtm
};