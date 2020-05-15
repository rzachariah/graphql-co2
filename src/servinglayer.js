import batchLayer from './batchlayer';
import speedLayer from './speedlayer';

async function getOmtm(req, noCache, startInt, firm, user, end) {
  const log = req.log;
  if (noCache || startInt > 0 || firm || user || end) {
    log.info('Calculate from scratch');
    var exclusiveStart = startInt - 1;
    return speedLayer.getOmtm(req, exclusiveStart, firm, user, end);
  }
  log.info('Apply Lambda architecture!');
  var batch = await batchLayer.getOmtm(req);
  var speed = await speedLayer.getOmtm(req, batch.evaluatedTime);
  return accumulate(batch, speed);
}

async function getAmtm(req, noCache, startInt, firm, user, end) {
  const log = req.log;
  if (noCache, startInt > 0 || firm || user || end) {
    log.info('Calculate from scratch');
    var exclusiveStart = startInt - 1;
    return speedLayer.getAmtm(req, exclusiveStart, firm, user, end);
  }
  log.info('Apply Lambda architecture!');
  var batch = await batchLayer.getAmtm(req);
  var speed = await speedLayer.getAmtm(req, batch.evaluatedTime);
  return accumulate(batch, speed);
}

function accumulate(metricA, metricB) {
  if (metricA.unit != metricB.unit) throw 'Units do not match';
  return {
    evaluatedTime: Math.max(metricA.evaluatedTime, metricB.evaluatedTime),
    value: metricA.value + metricB.value,
    newsTime: Math.max(metricA.newsTime, metricB.newsTime),
    unit: metricA.unit
  };
}

export default {
  getOmtm,
  getAmtm
};