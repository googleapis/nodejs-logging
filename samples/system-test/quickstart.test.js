/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const proxyquire = require(`proxyquire`).noPreserveCache();
const sinon = require(`sinon`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const {Logging} = proxyquire(`@google-cloud/logging`, {});
const logging = new Logging();

const logName = `nodejs-docs-samples-test-${uuid.v4()}`;

after(async () => {
  try {
    await logging.log(logName).delete();
  } catch (err) {} // ignore error
});

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it(`should log an entry`, done => {
  const expectedlogName = `my-log`;

  const logMock = {
    entry: sinon.stub().returns({}),
    write: _entry => {
      assert.deepStrictEqual(_entry, {});

      const log = logging.log(logName);
      const text = `Hello, world!`;
      const entry = log.entry({resource: {type: `global`}}, text);

      return log.write(entry).then(results => {
        setTimeout(() => {
          try {
            assert(console.log.calledOnce);
            assert.deepStrictEqual(console.log.firstCall.args, [
              `Logged: ${text}`,
            ]);
            done();
          } catch (err) {
            done(err);
          }
        }, 200);

        return results;
      });
    },
  };
  const loggingMock = {
    log: _logName => {
      assert.strictEqual(_logName, expectedlogName);
      return logMock;
    },
  };
  proxyquire(`../quickstart`, {
    '@google-cloud/logging': {
      Logging: sinon.stub().returns(loggingMock),
    },
  });
});
