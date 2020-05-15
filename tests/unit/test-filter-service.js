import assert from 'assert';

import filterService from '../../src/filterservice';

describe('filterService', function () {
  describe('#meetsRequirements()', function () {
    it('passes when matches string literal', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'firmCode',
        value: 'TW7ZN'
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('fails when does not match', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'firmCode',
        value: 'TEKX4'
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = false;
      assert.equal(actual, expected);
    });    

    it('fails when fails any requirement', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'firmCode',
        value: 'TW7ZN'
      }, {
        property: 'username',
        value: 'asharma'
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = false;
      assert.equal(actual, expected);
    });

    it('passes when matches all requirements', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'firmCode',
        value: 'TW7ZN'
      }, {
        property: 'username',
        value: 'rzachariah'
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('passes when matches reg exp', function () {
      var item = {
        username: 'rzachariah_TW7ZN',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'username',
        value: /^.*_TW7ZN$/
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('fails when reg exp does not match', function () {
      var item = {
        username: 'rzachariah_TEXK4',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var requirements = [{
        property: 'username',
        value: /^.*_TW7ZN$/
      }];
      var actual = filterService.meetsRequirements(item, requirements)
      var expected = false;
      assert.equal(actual, expected);
    });

  });

  describe('#excluded()', function () {

    it('returns true when matches string literal', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var exclusions = [{
        property: 'username',
        value: 'rzachariah'
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('returns true when any exclusion matches', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var exclusions = [{
        property: 'firmCode',
        value: 'TEXK4'
      }, {
        property: 'username',
        value: 'rzachariah'
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('returns false when all exclusions fail', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var exclusions = [{
        property: 'firmCode',
        value: 'TEXK4'
      }, {
        property: 'username',
        value: 'jsmith'
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = false;
      assert.equal(actual, expected);
    });

    it('returns true when matches reg exp', function () {
      var item = {
        username: 'rzachariah_TW7ZN',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var exclusions = [{
        property: 'username',
        value: /^.*_TW7ZN$/
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('returns true when matches reg exp string', function () {
      var item = {
        username: 'rzachariah_TW7ZN',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var firm = 'TW7ZN';
      var exclusions = [{
        property: 'username',
        value: `_${firm}$`
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('returns true when matches reg exp string, ignoring case', function () {
      var item = {
        username: 'rzachariah_tw7zn',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var firm = 'TW7ZN';
      var exclusions = [{
        property: 'username',
        value: new RegExp(`_${firm}$`, 'gi')
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = true;
      assert.equal(actual, expected);
    });

    it('returns false when does not match reg exp', function () {
      var item = {
        username: 'rzachariah',
        firmCode: 'TW7ZN',
        environment: 'Castle',
      };
      var exclusions = [{
        property: 'username',
        value: /^.*_TW7ZN$/
      }];
      var actual = filterService.excluded(item, exclusions)
      var expected = false;
      assert.equal(actual, expected);
    });

  })
});