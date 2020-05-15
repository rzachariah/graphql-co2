import assert from 'assert';

import 'regenerator-runtime/runtime';
import statsLibrary from '../../src/statslibrary';
import queryLibrary from './stats-library/querylibrary-fake';

describe('statsLibrary', function () {
  describe('#periodMetrics()', function () {
    it('parses clientSessions', async function () {
      var week = 7 * 24 * 60 * 60 * 1000;
      const log = () => {};
      const req = {
        log
      };
      var items = await statsLibrary.periodMetrics(req, queryLibrary, 'clientSessions', week, 'minutes');
      assert.ok(items.length > 0);
    });
  })

  describe('#periodStats()', function () {
    it('parses clientSessions', async function () {
      var week = 7 * 24 * 60 * 60 * 1000;
      const log = () => {};
      const req = {
        log
      };
      var items = await statsLibrary.periodStats(req, queryLibrary, 'clientSessions', week, 'minutes');
      assert.ok(items.length > 0);
      assert.equal(41, items.length);
      assert.equal(10568, items[40].total);
      assert.deepEqual({ start: 1499801537246, startUTC: "Tue, 11 Jul 2017 19:32:17 GMT", period: 43, total: 10568, count: 156 }, items[40]);
    });
  })

  describe('#weekStart()', function () {
    it('gets weekStart from a currentmillis', function () {
      var actual = statsLibrary.weekStart(1499801537246);
      var actualAsDate = new Date(actual);
      assert.equal(1499558400000, actual);
      assert.equal(0, actualAsDate.getDay());
      assert.equal(0, actualAsDate.getHours());
      assert.equal("Sun, 09 Jul 2017 00:00:00 GMT", actualAsDate.toUTCString());
    });

    it('handles month boundary', function () {
      var actual = statsLibrary.weekStart(1509579082000);
      var actualAsDate = new Date(actual);
      assert.equal(1509235200000, actual);
      assert.equal(0, actualAsDate.getDay());
      assert.equal(0, actualAsDate.getHours());
      assert.equal("Sun, 29 Oct 2017 00:00:00 GMT", actualAsDate.toUTCString());
    });
  })
  
});