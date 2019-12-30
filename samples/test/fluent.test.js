// Copyright 2017 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const proxyquire = require('proxyquire');
const request = require('supertest');
const {assert} = require('chai');
const {describe, it} = require('mocha');

describe('fluent', () => {
  it('should log error', done => {
    let loggerCalled = false;

    const structuredLogger = {
      emit: name => {
        loggerCalled = true;
        assert.strictEqual(name, 'errors');
      },
    };

    const app = proxyquire('../fluent', {
      'fluent-logger': {
        createFluentSender: (name, options) => {
          assert.strictEqual(name, 'myapp');
          assert.deepStrictEqual(options, {
            host: 'localhost',
            port: 24224,
            timeout: 3.0,
          });
          return structuredLogger;
        },
      },
    });

    request(app)
      .get('/')
      .expect(500)
      .expect(() => {
        assert(loggerCalled, 'structuredLogger.emit should have been called');
      })
      .end(done);
  });
});
