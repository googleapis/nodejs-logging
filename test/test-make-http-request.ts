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
import {describe, it} from 'mocha';
import {ServerResponse} from 'http';
import {makeHttpRequestData, ServerRequest} from '../src/make-http-request';

describe('make-http-request', () => {
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
    } as ServerRequest;
    const cloudReq = makeHttpRequestData(req);
    assert.strictEqual(cloudReq.protocol, 'http:');
    assert.strictEqual(cloudReq.requestUrl, 'http://google.com/');
    assert.strictEqual(cloudReq.requestMethod, 'GET');
    assert.strictEqual(cloudReq.userAgent, 'some-agent');
    assert.strictEqual(cloudReq.referer, 'some-referer');
    assert.strictEqual(cloudReq.status, undefined);
  });

  //TODO : do this
  it('should infer as many response values as possible', () => {
    const req = {
      method: 'GET',
      url: 'http://google.com/',
      headers: {
        'user-agent': 'some-agent',
        referer: 'some-referer',
      },
    } as ServerRequest;
    const cloudReq = makeHttpRequestData(req);
    assert.strictEqual(cloudReq.protocol, 'http:');
    assert.strictEqual(cloudReq.requestUrl, 'http://google.com/');
    assert.strictEqual(cloudReq.requestMethod, 'GET');
    assert.strictEqual(cloudReq.userAgent, 'some-agent');
    assert.strictEqual(cloudReq.referer, 'some-referer');
    assert.strictEqual(cloudReq.status, undefined);
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
