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
  getCloudTraceContext,
  getTraceContext,
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
    it('should infer header values with caution', () => {
      const req = {
        method: 'GET',
        url: 'http://google.com/',
        headers: {
          'user-agent': '',
          referer: undefined,
        },
      } as http.IncomingMessage;
      const cloudReq = makeHttpRequestData(req);
      assert.strictEqual(cloudReq.protocol, 'http:');
      assert.strictEqual(cloudReq.requestUrl, 'http://google.com/');
      assert.strictEqual(cloudReq.requestMethod, 'GET');
      assert.strictEqual(cloudReq.userAgent, undefined);
      assert.strictEqual(cloudReq.referer, undefined);
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

describe('get trace and span from http-request', () => {
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

  describe('getTraceContext', () => {
    it('should return an empty trace string when extraction fails and inject is false', () => {
      const req = {
        method: 'GET',
      } as http.IncomingMessage;
      const context = getTraceContext(req, 'myProj');
      assert.strictEqual(context.trace, '');
      assert.strictEqual(context.spanId, undefined);
      assert.strictEqual(context.traceSampled, undefined);
    });

    it('should return a formatted Google Cloud trace context first', () => {
      const req = {
        headers: {['x-cloud-trace-context']: '1/2;o=1'},
      } as unknown as http.IncomingMessage;
      const projectId = 'myProj';
      const context = getTraceContext(req, projectId);
      assert.strictEqual(context.trace, `projects/${projectId}/traces/1`);
      assert.strictEqual(context.spanId, '2');
      assert.strictEqual(context.traceSampled, true);
    });

    it('should return a formatted W3C trace context next', () => {
      const req = {headers: {}} as http.IncomingMessage;
      // This should generate a span and trace if not available.
      const context = getTraceContext(req, 'myProj', true);
      assert.match(context.trace, /^projects\/myProj\/traces\/*/);
      assert.match(context.spanId!, /^\d*/);
      assert.strictEqual(context.traceSampled, undefined);
    });
  });

  describe('makeHeaderWrapper', () => {
    const HEADER_NAME = 'Content-Type';
    const HEADER_VALUE = 'application/🎂';

    it('should correctly get request headers', () => {
      const req = {headers: {[HEADER_NAME]: HEADER_VALUE}};
      const wrapper = makeHeaderWrapper(req as unknown as http.IncomingMessage);
      assert.strictEqual(wrapper!.getHeader(HEADER_NAME), HEADER_VALUE);
    });

    it('should correctly set request headers', () => {
      const req = {headers: {} as http.IncomingHttpHeaders};
      const wrapper = makeHeaderWrapper(req as unknown as http.IncomingMessage);
      wrapper!.setHeader(HEADER_NAME, HEADER_VALUE);
      assert.strictEqual(req.headers[HEADER_NAME], HEADER_VALUE);
    });

    it('should return null if header property is not in http request', () => {
      const req = {
        method: 'GET',
      } as http.IncomingMessage;
      const wrapper = makeHeaderWrapper(req as unknown as http.IncomingMessage);
      assert.strictEqual(wrapper, null);
    });
  });

  describe('getCloudTraceContext', () => {
    it('should extract trace & span from X-Cloud-Trace-Context', () => {
      const tests = [
        {
          header: '105445aa7843bc8bf206b120001000/000000001;o=1',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '000000001',
            traceSampled: true,
          },
        },
        // TraceSampled is false
        {
          header: '105445aa7843bc8bf206b120001000/000000001;o=0',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '000000001',
            traceSampled: false,
          },
        },
        {
          // No span
          header: '105445aa7843bc8bf206b120001000;o=1',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: undefined,
            traceSampled: true,
          },
        },
        {
          // No trace
          header: '/105445aa7843bc8bf206b120001000;o=0',
          expected: {
            trace: undefined,
            spanId: '105445aa7843bc8bf206b120001000',
            traceSampled: false,
          },
        },
        {
          // No traceSampled
          header: '105445aa7843bc8bf206b120001000/0',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '0',
            traceSampled: false,
          },
        },
        {
          // No input
          header: '',
          expected: {
            trace: undefined,
            spanId: undefined,
            traceSampled: false,
          },
        },
      ];
      for (const test of tests) {
        const req = {
          method: 'GET',
        } as unknown as http.IncomingMessage;
        req.headers = {
          'x-cloud-trace-context': test.header,
        };

        const wrapper = makeHeaderWrapper(req);
        const context = getCloudTraceContext(wrapper!);
        if (context) {
          assert.strictEqual(
            context.trace,
            test.expected.trace,
            `From ${test.header}; Expected trace: ${test.expected.trace}; Got: ${context.trace}`
          );
          assert.strictEqual(
            context.spanId,
            test.expected.spanId,
            `From ${test.header}; Expected spanId: ${test.expected.spanId}; Got: ${context.spanId}`
          );
          assert.strictEqual(
            context.traceSampled,
            test.expected.traceSampled,
            `From ${test.header}; Expected traceSampled: ${test.expected.traceSampled}; Got: ${context.traceSampled}`
          );
        } else {
          assert(false);
        }
      }
    });
  });

  describe('getOrInjectTraceParent', () => {
    beforeEach(() => {
      fakeContext.extract = FAKE_CONTEXT.extract;
      fakeContext.generate = FAKE_CONTEXT.generate;
      fakeContext.inject = FAKE_CONTEXT.inject;
    });

    it('should return a W3C extracted trace context', () => {
      const FAKE_SPAN_CONTEXT = '👾';
      fakeContext.extract = () => FAKE_SPAN_CONTEXT;
      fakeContext.generate = () => assert.fail('should not be called');
      fakeContext.inject = () => assert.fail('should not be called');

      const ret = getOrInjectTraceParent({});
      assert.strictEqual(ret, FAKE_SPAN_CONTEXT);
    });

    it('should not generate a new context if extract returns falsy', () => {
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

    it('should generate a new context if extract returns falsy and inject is true', () => {
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
  });
});
