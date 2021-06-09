/*!
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as assert from 'assert';
import {describe, it, beforeEach} from 'mocha';
import {ServerResponse} from 'http';
import {
  makeHttpRequestData,
  ServerRequest,
  makeHeaderWrapper,
} from '../src/http-request';
import * as http from 'http';
import * as proxyquire from 'proxyquire';

describe('format raw http request to structured http-request', () => {
  describe('makeHttpRequestData', () => {
    it('should prioritize originalUrl if provided', () => {
      const req = {
        method: 'GET',
        url: 'http://wrongemail.com/',
        originalUrl: 'http://google.com/',
      } as ServerRequest;
      const cloudReq = makeHttpRequestData(req);
      assert.strictEqual(cloudReq.protocol, 'http:');
      assert.strictEqual(cloudReq.requestUrl, 'http://google.com/');
      assert.strictEqual(cloudReq.requestMethod, 'GET');
    });

    it('should infer as many request values as possible', () => {
      const req = {
        method: 'GET',
        url: 'http://google.com/',
        headers: {
          'user-agent': 'some-agent',
          referer: 'some-referer',
        },
      } as http.IncomingMessage;
      const cloudReq = makeHttpRequestData(req);
      assert.strictEqual(cloudReq.protocol, 'http:');
      assert.strictEqual(cloudReq.requestUrl, 'http://google.com/');
      assert.strictEqual(cloudReq.requestMethod, 'GET');
      assert.strictEqual(cloudReq.userAgent, 'some-agent');
      assert.strictEqual(cloudReq.referer, 'some-referer');
      assert.strictEqual(cloudReq.status, undefined);
    });

    it('should infer as many response values as possible', () => {
      const RESPONSE_SIZE = 2048;
      const req = {} as ServerRequest;
      const res = {
        statusCode: 200,
        headers: {
          'Content-Length': RESPONSE_SIZE,
        },
      } as unknown as http.ServerResponse;
      res.getHeader = function () {
        return 2048;
      };
      const cloudReq = makeHttpRequestData(req, res);
      assert.strictEqual(cloudReq.status, 200);
      assert.strictEqual(cloudReq.responseSize, RESPONSE_SIZE);
    });

    it('should convert latency to proto Duration', () => {
      const fakeRequest = {headers: {}};
      const fakeResponse = {};

      const h1 = makeHttpRequestData(
        fakeRequest as ServerRequest,
        fakeResponse as ServerResponse,
        1003
      );
      assert.deepStrictEqual(h1.latency, {seconds: 1, nanos: 3e6});

      const h2 = makeHttpRequestData(
        fakeRequest as ServerRequest,
        fakeResponse as ServerResponse,
        9003.1
      );
      assert.deepStrictEqual(h2.latency, {seconds: 9, nanos: 3.1e6});

      // Make sure we nanos is uint32.
      const h3 = makeHttpRequestData(
        fakeRequest as ServerRequest,
        fakeResponse as ServerResponse,
        1.0000000001
      );
      assert.deepStrictEqual(h3.latency, {seconds: 0, nanos: 1e6});
    });
  });
});

describe.only('get trace and span from http-request', () => {
  const FAKE_CONTEXT = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extract: (headerWrapper: {}) => {},
    generate: () => {},
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    inject: (headerWrapper: {}, spanContext: {}) => {},
  };

  const fakeContext = Object.assign({}, FAKE_CONTEXT);

  const {getOrInjectTraceParent} = proxyquire('../src/http-request', {
    '@opencensus/propagation-stackdriver': fakeContext,
  });

  describe('makeHeaderWrapper', () => {
    const HEADER_NAME = 'Content-Type';
    const HEADER_VALUE = 'application/🎂';

    it('should correctly get request headers', () => {
      const req = {headers: {[HEADER_NAME]: HEADER_VALUE}};
      const wrapper = makeHeaderWrapper(req as unknown as http.IncomingMessage);
      assert.strictEqual(wrapper.getHeader(HEADER_NAME), HEADER_VALUE);
    });

    it('should correctly set request headers', () => {
      const req = {headers: {} as http.IncomingHttpHeaders};
      const wrapper = makeHeaderWrapper(req as unknown as http.IncomingMessage);
      wrapper.setHeader(HEADER_NAME, HEADER_VALUE);
      assert.strictEqual(req.headers[HEADER_NAME], HEADER_VALUE);
    });
  });

  describe('getTraceContext', () => {

  });

  describe('getCloudTraceContext', () => {
    // it('should extract trace & span from X-Cloud-Trace-Context', () => {
    //   const tests = [
    //     {
    //       header: '105445aa7843bc8bf206b120001000/000000001;o=1',
    //       expected: {
    //         trace: 'projects/myProj/traces/105445aa7843bc8bf206b120001000',
    //         spanId: '000000001',
    //         traceSampled: true,
    //       },
    //     },
    //     // TraceSampled is false
    //     {
    //       header: '105445aa7843bc8bf206b120001000/000000001;o=0',
    //       expected: {
    //         trace: 'projects/myProj/traces/105445aa7843bc8bf206b120001000',
    //         spanId: '000000001',
    //         traceSampled: false,
    //       },
    //     },
    //     {
    //       // No span
    //       header: '105445aa7843bc8bf206b120001000;o=1',
    //       expected: {
    //         trace: 'projects/myProj/traces/105445aa7843bc8bf206b120001000',
    //         spanId: undefined,
    //         traceSampled: true,
    //       },
    //     },
    //     {
    //       // No trace
    //       header: '/105445aa7843bc8bf206b120001000;o=0',
    //       expected: {
    //         trace: 'projects/myProj/traces/undefined',
    //         spanId: '105445aa7843bc8bf206b120001000',
    //         traceSampled: false,
    //       },
    //     },
    //     {
    //       // No traceSampled
    //       header: '105445aa7843bc8bf206b120001000/0',
    //       expected: {
    //         trace: 'projects/myProj/traces/105445aa7843bc8bf206b120001000',
    //         spanId: '0',
    //         traceSampled: undefined,
    //       },
    //     },
    //     {
    //       // No input
    //       header: '',
    //       expected: {
    //         trace: undefined,
    //         spanId: undefined,
    //         traceSampled: undefined,
    //       },
    //     },
    //   ];
    //   for (const test of tests) {
    //     const req = {
    //       method: 'GET',
    //     } as unknown as http.IncomingMessage;
    //     // Mock raw http headers with lowercased keys.
    //     req.headers = {
    //       'x-cloud-trace-context': test.header,
    //     };
    //     delete entry.metadata.trace;
    //     delete entry.metadata.spanId;
    //     delete entry.metadata.traceSampled;
    //     entry.metadata.httpRequest = req;
    //     const json = entry.toJSON({}, 'myProj');
    //     assert.strictEqual(json.trace, test.expected.trace);
    //     assert.strictEqual(json.spanId, test.expected.spanId);
    //     assert.strictEqual(json.traceSampled, test.expected.traceSampled);
    //   }
    // });
  });

  describe('getOrInjectTraceParent', () => {
    beforeEach(() => {
      fakeContext.extract = FAKE_CONTEXT.extract;
      fakeContext.generate = FAKE_CONTEXT.generate;
      fakeContext.inject = FAKE_CONTEXT.inject;
    });

    it('should return extracted context identically', () => {
      const FAKE_SPAN_CONTEXT = '👾';
      fakeContext.extract = () => FAKE_SPAN_CONTEXT;
      fakeContext.generate = () => assert.fail('should not be called');
      fakeContext.inject = () => assert.fail('should not be called');

      const ret = getOrInjectTraceParent({});
      assert.strictEqual(ret, FAKE_SPAN_CONTEXT);
    });

    it('should generate a new context if extract returns falsy', () => {
      let injectWasCalled = false;
      const FAKE_SPAN_CONTEXT = '👾';
      fakeContext.extract = () => false;
      fakeContext.generate = () => FAKE_SPAN_CONTEXT;
      fakeContext.inject = (_, spanContext) => {
        injectWasCalled = true;
        assert.strictEqual(spanContext, FAKE_SPAN_CONTEXT);
      };

      const ret = getOrInjectTraceParent({}, true);
      assert.strictEqual(ret, FAKE_SPAN_CONTEXT);
      assert.ok(injectWasCalled);
    });

    it('should not generate a new context if extract returns falsy and inject param is false', () => {
      let injectWasCalled = false;
      const FAKE_SPAN_CONTEXT = '👾';
      fakeContext.extract = () => false;
      fakeContext.generate = () => FAKE_SPAN_CONTEXT;
      fakeContext.inject = (_, spanContext) => {
        injectWasCalled = true;
        assert.strictEqual(spanContext, FAKE_SPAN_CONTEXT);
      };

      const ret = getOrInjectTraceParent({}, false);
      assert.strictEqual(ret, false);
      assert.ok(!injectWasCalled);
    });
  });
});
