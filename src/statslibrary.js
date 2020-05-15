import Rx from 'rx';
var Observable = Rx.Observable;
import util from './util';

async function periodMetrics(req, querylibrary, query, window, field, useWeekStart) {
  if (!querylibrary || !query || !querylibrary[query] || !window || !field) return Promise.resolve([]);
  var items = await querylibrary[query](req);
  var start = Math.min(...items.map(i => i.time));
  if (useWeekStart) {
    start = weekStart(start);
  }

  return items.map(i => {
    var offset = i.time - start;
    var period = Math.floor(offset / window);
    var pStart = start + period * window;
    return {
      start: pStart,
      startUTC: new Date(pStart).toUTCString(),
      period,
      value: i[field] || 1
    };
  });
}

async function periodStats(req, querylibrary, query, window, field, useWeekStart) {
  var metrics = await this.periodMetrics(req, querylibrary, query, window, field, useWeekStart);
  return Observable.from(metrics)
    .groupBy(pv => pv.period)
    .flatMap(g => {
      var pStartObs = g
      .first()
      .map(pv => pv.start);
      var totalObs = g.sum(pv => pv.value);
      var countObs = g.count();
      return Observable.zip(pStartObs, totalObs, countObs, (pStart, total, count) => {
        return {
          start: pStart,
          startUTC: new Date(pStart).toUTCString(),
          period: g.key,
          total,
          count
        }
      });
    })
    .toArray()
    .toPromise()
}

function weekStart(currentMillis) {
  return util.weekStart(currentMillis);
}

export default {
  periodMetrics,
  periodStats,
  weekStart
};