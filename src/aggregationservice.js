import filterService from './filterservice';
import batchinsightGateway from './batchinsightgateway';
import util from './util';

function interactionsSince(req, product, environment, firm, filter, exclusiveStart) {
  exclusiveStart = exclusiveStart || -1;
  var seed = [];
  var accumulator = (acc, current) => {
    var predicate = filterService.getPredicate(filter);
    var filtered = current.filter(predicate);
    return acc.concat(filtered);
  }
  return batchinsightGateway.scanInteractions(req, product, environment, firm, exclusiveStart, accumulator, seed);
}

function sessionsSince(req, product, environment, firm, filter, exclusiveStart, end) {
  exclusiveStart = exclusiveStart || -1;
  var seed = [];
  var accumulator = (acc, current) => {
    var predicate = filterService.getPredicate(filter);
    var filtered = current.filter(predicate);
    return acc.concat(filtered);
  }
  return batchinsightGateway.scanSessions(req, product, environment, firm, exclusiveStart, accumulator, seed, end);
}

function countInteractionsSince(req, product, environment, firm, filter, exclusiveStart, end) {
  exclusiveStart = exclusiveStart || -1;
  var seed = getSeed('unit');
  var accumulator = getExhaustAccumulator(filter, a => 1);
  return batchinsightGateway.scanInteractions(req, product, environment, firm, exclusiveStart, accumulator, seed, end);
}

function sumSessionMinutesSince(req, product, environment, firm, filter, exclusiveStart, end) {
  exclusiveStart = exclusiveStart || -1;
  var seed = getSeed('minute');
  var accumulator = getExhaustAccumulator(filter, a => a.sessionMinutes);
  return batchinsightGateway.scanSessions(req, product, environment, firm, exclusiveStart, accumulator, seed, end);
}

function getSeed(unit) {
  return {
    evaluatedTime: 0,
    value: 0,
    newsTime: 0,
    unit
  }
}

function getExhaustAccumulator(filter, getValue, accumulateValue) {
  accumulateValue = accumulateValue || util.add;
  return (acc, current) => {
    var times = current.map(a => Number(a.time));
    var nextEvaluatedTime = Math.max(...times);
    var predicate = filterService.getPredicate(filter);
    var filtered = current.filter(predicate);
    var filteredValues = filtered.map(getValue);
    var nextValue = filteredValues.reduce(accumulateValue, 0);
    var filteredTimes = filtered.map(a => a.time);
    var nextNewsTime = Math.max(...filteredTimes);
    return {
      evaluatedTime: Math.max(acc.evaluatedTime, nextEvaluatedTime),
      value: acc.value + nextValue,
      newsTime: Math.max(acc.newsTime, nextNewsTime),
      unit: acc.unit
    };
  }
}

function countByX(dataArray, xField) {
  var byXMap = dataArray.reduce((map, nextObj) => {
    const key = nextObj[xField];
    if (key == null || key == undefined) {
      return map;
    }
    if (map[key]) {
      map[key]++;
    } else {
      map[key] = 1;
    }
    return map;
  }, {});
  var byXArray = Object.keys(byXMap).reduce((list, nextKey) => {
    var entry = {
      count: byXMap[nextKey]
    };
    entry[xField] = nextKey;
    list.push(entry);
    return list;
  }, []);
  return byXArray;
}

export default {
  interactionsSince,
  sessionsSince,
  countInteractionsSince,
  sumSessionMinutesSince,
  countByX
};