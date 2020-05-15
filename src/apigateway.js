import fetch from './utils/fetcher';

import exhaust from './exhaust';

function get(req, url, sourceService) {
  const log = req.log;
  sourceService = sourceService || 'batchinsight';
  log.info('Fetching... ' + url);
  const start = new Date().getTime();

  return fetch(url, null, req)
    .then(res => {
      if (res.ok) return res;

      const message = `Fetch failed: ${res.status} ${res.statusText}. URL: ${url}`; 
      log.error(message);
      throw message;
    })
    .then(res => {
      const end = new Date().getTime();
      const latency = end - start;
      exhaust.collect(req, url, latency, sourceService);
      return res;
    })
    .then(res => res.json());
}

export default {
  get
};