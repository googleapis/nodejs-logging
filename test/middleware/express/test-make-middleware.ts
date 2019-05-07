/*!
 * Copyright 2018 Google LLC
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
import * as EventEmitter from 'events';
import * as proxyquire from 'proxyquire';

const FAKE_PROJECT_ID = 'project-🦄';

function makeFakeRequest() {
  return {headers: {'content-type': 'application/🍰'}};
}

function makeFakeResponse() {
  const ee = new EventEmitter();
  // tslint:disable-next-line:no-any
  (ee as any).getHeader = (name: string) => {};
  return ee;
}

let getOrInjectContextValue: {} | undefined;
const FAKE_CONTEXT = {
  getOrInjectContext: () => {
    return getOrInjectContextValue;
  },
};

describe('middleware/express/make-middleware', () => {
  describe('makeMiddleware', () => {
    const {makeMiddleware} = proxyquire(
      '../../../src/middleware/express/make-middleware',
      {'../context': FAKE_CONTEXT}
    );

    it('should return a function accepting 3 arguments', () => {
      const middleware = makeMiddleware(FAKE_PROJECT_ID, () => {});
      assert.ok(typeof middleware === 'function');
      assert.ok(middleware.length === 3);
    });

    describe('middleware', () => {
      const FAKE_SPAN_CONTEXT = {traceId: 'traceId-🥑'};

      beforeEach(() => {
        getOrInjectContextValue = undefined;
      });

      it('should call the next middleware synchronously', () => {
        getOrInjectContextValue = FAKE_SPAN_CONTEXT;
        const fakeRequest = makeFakeRequest();
        const fakeResponse = makeFakeResponse();
        let called = false;

        const middleware = makeMiddleware(FAKE_PROJECT_ID, () => {});

        middleware(fakeRequest, fakeResponse, () => {
          called = true;
        });
        assert.ok(called);
      });

      it('should call makeChildLogger with correct trace context', () => {
        const FAKE_CHILD_LOGGER = {log: '🍌'};
        getOrInjectContextValue = FAKE_SPAN_CONTEXT;
        const fakeRequest = makeFakeRequest();
        const fakeResponse = makeFakeResponse();

        function makeChild(trace: {}) {
          assert.strictEqual(
            trace,
            `projects/${FAKE_PROJECT_ID}/traces/${FAKE_SPAN_CONTEXT.traceId}`
          );
          return FAKE_CHILD_LOGGER;
        }

        const middleware = makeMiddleware(FAKE_PROJECT_ID, makeChild);
        middleware(fakeRequest, fakeResponse, () => {});

        // Should annotate the request with the child logger.
        // tslint:disable-next-line:no-any
        assert.strictEqual((fakeRequest as any).log, FAKE_CHILD_LOGGER);
      });

      it('should emit a request log when response is finished', done => {
        getOrInjectContextValue = FAKE_SPAN_CONTEXT;
        const fakeRequest = makeFakeRequest();
        const fakeResponse = makeFakeResponse();
        let emitRequestLogCalled = false;

        function emitRequestLog(httpRequest: {}, trace: {}) {
          assert.strictEqual(
            trace,
            `projects/${FAKE_PROJECT_ID}/traces/${FAKE_SPAN_CONTEXT.traceId}`
          );
          // TODO: check httpRequest properties.
          emitRequestLogCalled = true;
        }

        const middleware = makeMiddleware(
          FAKE_PROJECT_ID,
          () => {},
          emitRequestLog
        );
        middleware(fakeRequest, fakeResponse, () => {});

        setTimeout(() => {
          fakeResponse.emit('finished');
          assert.strictEqual(emitRequestLogCalled, true);
          done();
        }, 10);
      });
    });
  });
});
