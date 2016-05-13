/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern!object',
  'intern/chai!assert',
  'intern/dojo/node!crypto',
  'intern/dojo/node!../../server/lib/flow-metrics',
  'intern/dojo/node!sinon'
], function (registerSuite, assert, crypto, flowMetrics, sinon) {

  var suite = {
    name: 'flow-metrics'
  };

  var mockConfig, mockRequest, mockDateNow, mockRandomBytes;

  suite.beforeEach = function () {
    sinon.stub(Date, 'now', function () {
      return mockDateNow;
    });
    sinon.stub(crypto, 'randomBytes', function (size) {
      if (mockRandomBytes) {
        return new Buffer(mockRandomBytes);
      } else {
        var b = new Buffer(size);
        b.fill(0);
        return b;
      }
    });
    mockConfig = {
      flow_id_key: 'test hmac key', //eslint-disable-line camelcase
      get: sinon.spy(function (name) {
        return this[name];
      })
    };
    mockRequest = {
      headers: {
        'user-agent': 'test user agent'
      }
    };
    mockDateNow = 0;
    mockRandomBytes = null;
  };

  suite.afterEach = function () {
    mockConfig = null;
    mockRequest = null;
    mockDateNow = 0;
    mockRandomBytes = null;
    crypto.randomBytes.restore();
    Date.now.restore();
  };

  suite['returns current timestamp for flowBeginTime'] = function () {
    mockDateNow = 42;
    var flowEventData = flowMetrics(mockConfig, mockRequest);
    assert.equal(flowEventData.flowBeginTime, 42);
  };

  suite['correctly generates a known test vector'] = function () {
    mockDateNow = 1451566800000;
    mockRequest.headers['user-agent'] = 'Firefox';
    mockConfig.flow_id_key = 'S3CR37'; //eslint-disable-line camelcase
    mockRandomBytes = 'MozillaFirefox!!';
    // Want to cross-check the test vector here?
    // The following python code was used to generate it:
    //
    //   import hashlib, hmac, binascii
    //   print binascii.hexlify('MozillaFirefox!!')
    //   print hmac.new('S3CR37', '\n'.join((
    //      binascii.hexlify('MozillaFirefox!!'),
    //      hex(1451566800000)[2:],
    //      'Firefox'
    //   )), hashlib.sha256).hexdigest()[:32]
    //
    var expectedSalt = '4d6f7a696c6c6146697265666f782121';
    var expectedHmac = 'c89d56556d22039fbbf54d34e0baf206';

    var flowEventData = flowMetrics(mockConfig, mockRequest);

    assert.equal(flowEventData.flowBeginTime, 1451566800000);
    assert.equal(flowEventData.flowId, expectedSalt + expectedHmac);
  };

  suite['generates different flowIds for different keys'] = function () {
    mockConfig.flow_id_key = 'key1'; //eslint-disable-line camelcase
    var flowEventData1 = flowMetrics(mockConfig, mockRequest);

    mockConfig.flow_id_key = 'key2'; //eslint-disable-line camelcase
    var flowEventData2 = flowMetrics(mockConfig, mockRequest);

    assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
    assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
  };

  suite['generates different flowIds for different user agents'] = function () {
    mockRequest.headers['user-agent'] = 'Firefox';
    var flowEventData1 = flowMetrics(mockConfig, mockRequest);

    mockRequest.headers['user-agent'] = 'Chrome';
    var flowEventData2 = flowMetrics(mockConfig, mockRequest);

    assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
    assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
  };

  suite['generates different flowIds for different random salts'] = function () {
    mockRandomBytes = 'MozillaFirefox!!';
    var flowEventData1 = flowMetrics(mockConfig, mockRequest);

    mockRandomBytes = 'AllHailSeaMonkey';
    var flowEventData2 = flowMetrics(mockConfig, mockRequest);

    assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
    assert.equal(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
  };

  suite['generates different flowIds for different timestamps'] = function () {
    mockDateNow = +(new Date(2016, 0, 1));
    var flowEventData1 = flowMetrics(mockConfig, mockRequest);

    mockDateNow = +(new Date(2016, 1, 29));
    var flowEventData2 = flowMetrics(mockConfig, mockRequest);

    assert.notEqual(flowEventData1.flowId, flowEventData2.flowId);
    assert.notEqual(flowEventData1.flowBeginTime, flowEventData2.flowBeginTime);
  };

  registerSuite(suite);
});

