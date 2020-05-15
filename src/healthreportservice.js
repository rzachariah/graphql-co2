import Rx from 'rx';
import rxGateway from './rxgateway';

var reportRequest = (req) => {
  var timeout = 10000;

  var inputs = [
    { environment: 'Castle', stack: 'exhaust-pipe-ims', name: 'collector', link: 'https://castle.ezesoftcloud.com/api/exhaust/v1/collection' },
    { environment: 'Perf', stack: 'exhaust-pipe-ims', name: 'collector', link: 'https://perf.ezesoftcloud.com/api/exhaust/v1/collection' },
    { environment: 'AWSProd', stack: 'exhaust-pipe-ims', name: 'collector', link: 'https://app.ezesoftcloud.com/api/exhaust/v1/collection' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-pipe', name: 'collector', link: 'https://digitalexhaust.ezesoft.net/api/collection' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'batchinsight', link: 'https://digitalexhaust.ezesoft.net/api/history' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'batchquery', link: 'https://digitalexhaust.ezesoft.net/api/batchquery' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'graphql-co2', link: 'https://digitalexhaust.ezesoft.net/api/graphql' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'react-insight', link: 'https://digitalexhaust.ezesoft.net/app' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'insight', link: 'http://aedigitalexhaust02.awsdev.ezesoftcloud.com:8008/app' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'streaminsight', link: 'https://streaminsight.ezesoft.net/api' },
    { environment: 'Digital-Exhaust', stack: 'exhaust-insight', name: 'streaminsight2', link: 'http://aedigitalexhaust02.awsdev.ezesoftcloud.com:8000' },
  ]

  var healthRoutes = inputs.map(i => `${i.link}/health`);
  var healthRequests = healthRoutes.map(h => rxGateway.fromHttpGet(req, h));
  var requestsWithTimeout = healthRequests.map(function (h, idx) {
    const input = inputs[idx];
    input.status = 'FAIL';
    return Rx.Observable.catch(h.timeout(timeout), Rx.Observable.return(input));
  });

  var combined = Rx.Observable.zip(requestsWithTimeout, function () {
    var results = Array.prototype.slice.call(arguments);
    var augmented = results.map((r, idx) => {
      inputs[idx].name = r.name;
      inputs[idx].status = r.status;
      inputs[idx].version = r.version;
      return inputs[idx];
    });
    return augmented;
  });

  return combined;
};

export default {
  reportRequest
};