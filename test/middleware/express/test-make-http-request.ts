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
// Types-only import.
import {Request, Response} from 'express';
import {makeHttpRequestData} from '../../../src/middleware/express/make-http-request';

describe('middleware/express/make-http-request', () => {
  it('should convert latency to proto Duration', () => {
    const fakeRequest = {headers: {}};
    const fakeResponse = {};

    const h1 = makeHttpRequestData(
        fakeRequest as Request, fakeResponse as Response, 1003);
    assert.deepStrictEqual(h1.latency, {seconds: 1, nanos: 3e6});

    const h2 = makeHttpRequestData(
        fakeRequest as Request, fakeResponse as Response, 9003.1);
    assert.deepStrictEqual(h2.latency, {seconds: 9, nanos: 3.1e6});

    // Make sure we nanos is uint32.
    const h3 = makeHttpRequestData(
        fakeRequest as Request, fakeResponse as Response, 1.0000000001);
    assert.deepStrictEqual(h3.latency, {seconds: 0, nanos: 1e6});
  });
});
