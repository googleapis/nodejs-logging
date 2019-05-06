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
import * as http from 'http';
import * as proxyquire from 'proxyquire';
import {makeHeaderWrapper} from '../../src/middleware/context';

const FAKE_CONTEXT = {
  extract: (headerWrapper: {}) => {},
  generate: () => {},
  inject: (headerWrapper: {}, spanContext: {}) => {},
};

const fakeContext = Object.assign({}, FAKE_CONTEXT);

const {getOrInjectContext} = proxyquire('../../src/middleware/context', {
  '@opencensus/propagation-stackdriver': fakeContext,
});

describe('middleware/context', () => {
  describe('makeHeaderWrapper', () => {
    const HEADER_NAME = 'Content-Type';
    const HEADER_VALUE = 'application/🎂';

    it('should correctly get request headers', () => {
      const req = {headers: {[HEADER_NAME]: HEADER_VALUE}};
      const wrapper = makeHeaderWrapper(
        (req as unknown) as http.IncomingMessage
      );
      assert.strictEqual(wrapper.getHeader(HEADER_NAME), HEADER_VALUE);
    });

    it('should correctly set request headers', () => {
      const req = {headers: {} as http.IncomingHttpHeaders};
      const wrapper = makeHeaderWrapper(
        (req as unknown) as http.IncomingMessage
      );
      wrapper.setHeader(HEADER_NAME, HEADER_VALUE);
      assert.strictEqual(req.headers[HEADER_NAME], HEADER_VALUE);
    });
  });

  describe('getOrInjectContext', () => {
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

      const ret = getOrInjectContext({});
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

      const ret = getOrInjectContext({});
      assert.strictEqual(ret, FAKE_SPAN_CONTEXT);
      assert.ok(injectWasCalled);
    });
  });
});
