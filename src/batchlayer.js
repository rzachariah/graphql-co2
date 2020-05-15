import config from './config';
import apiGateway from './apigateway';

const batchqueryRoot = config.batchqueryRoot;

function getOmtm(req) {
  return getMetric(req, 'omtm');
}

function getAmtm(req) {
  return getMetric(req, 'amtm');
}

function getMetric(req, metric) {
  const log = req.log;
  log.info(`Batch query for ${metric}...`);
  const start = new Date().getTime();  
  var url = `${batchqueryRoot}/batchquery/graphql?query={ ${metric} { evaluatedTime value newsTime unit } }`;
  return apiGateway.get(req, url)
    .then(json => {
      if (json.errors) throw errors;
      return json;
    })
    .then(json => json.data[metric])
    .then(metric => {
      return {
        evaluatedTime: Number(metric.evaluatedTime),
        value: metric.value,
        newsTime: Number(metric.newsTime),
        unit: metric.unit,
      }
    })
    .then(metric => {
      const end = new Date().getTime();
      const latency = end - start;
      log.info(`Batch query for ${metric} complete. Result ${JSON.stringify(metric)}. Latency ${latency}`);
      return metric;
    })  
}

export default {
  getOmtm,
  getAmtm
};