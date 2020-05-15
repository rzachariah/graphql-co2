import Rx from 'rx';
import fetch from './utils/fetcher';

var fromHttpGet = (req, url) => {
  const log = req.log;
  return Rx.Observable.create((observer) => {
    log.info('HTTP Request: GET ' + url);
    fetch(url, null, req)
      .then(res => res.json())
      .then((json) => {
        log.info('HTTP Response: ' + json);
        observer.onNext(json);
        observer.onCompleted();
      })
      .catch(error => {
        console.error('HTTP error: ' + error);
        observer.onError(error);
      });

    // Return disposable
    return () => {
      log.info('Disposing observable for HTTP GET ' + url);
    };
  });
};

export default {
  fromHttpGet
};