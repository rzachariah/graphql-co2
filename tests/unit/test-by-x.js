import assert from 'assert';

import 'regenerator-runtime/runtime';
import aggregationService from '../../src/aggregationservice';
import sessionDetailResponse from './time-usage/sessiondetail';
//import expected from './time-usage/expected';

describe('aggregationService', function () {
  describe('#countByX()', function () {
    it('returns empty array with empty input', function () {
      var actual = aggregationService.countByX([], 'x');
      assert.ok(Array.isArray(actual));
      assert.ok(actual.length === 0);
    });

    it('returns singleton array with singleton input', function () {
      var actual = aggregationService.countByX([{x: 'foo', y: 3}], 'x');
      assert.ok(Array.isArray(actual));
      assert.equal(actual.length, 1);
      assert.deepEqual(actual, [{ x: 'foo', count: 1}]);
    });

    it('adds samples with same xField value', function () {
      var actual = aggregationService.countByX([{x: 'foo', y: 3}, {x: 'foo', y: 4}], 'x');
      assert.ok(Array.isArray(actual));
      assert.equal(actual.length, 1);
      assert.deepEqual(actual, [{ x: 'foo', count: 2}]);
    });    
    
    it('separates samples with different xField values', function () {
      var actual = aggregationService.countByX([{x: 'foo', y: 3}, {x: 'foo', y: 4}, , {x: 'bar', y: 4}], 'x');
      assert.ok(Array.isArray(actual));
      assert.equal(actual.length, 2);
      assert.deepEqual(actual, [{ x: 'foo', count: 2}, {x: 'bar', count: 1}]);
    });

    it('skips entries without xField values', function () {
      var actual = aggregationService.countByX([{z: 'foo', y: 3}, {x: 'foo', y: 4}, , {x: 'bar', y: 4}], 'x');
      assert.ok(Array.isArray(actual));
      assert.equal(actual.length, 2);
      assert.deepEqual(actual, [{ x: 'foo', count: 1}, {x: 'bar', count: 1}]);
    });

    it('counts sessionDetail byHash', function () {
      const sessionDetail = sessionDetailResponse.data.sessionDetail;
      var actual = aggregationService.countByX(sessionDetail, 'hash');
      assert.ok(Array.isArray(actual));
      assert.ok(actual.length > 0);
      actual.forEach(x => assert.ok(typeof x['hash'] == 'string'));
      actual.forEach(x => assert.ok(typeof x.count == 'number'));
    });    
    
  })
  
});