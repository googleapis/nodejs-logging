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

const {assert} = require('chai');
const uuid = require('uuid');
const {Logging} = require('@google-cloud/logging');
const execa = require('execa');

const logging = new Logging();
const logName = `nodejs-docs-samples-test-${uuid.v4()}`;
const projectId = process.env.GCLOUD_PROJECT;
const cmd = 'node quickstart';

describe('quickstart', () => {
  after(async () => {
    await logging
      .log(logName)
      .delete()
      .catch(console.warn);
  });

  it('should log an entry', async () => {
    const {stdout} = await execa.shell(`${cmd} ${projectId} ${logName}`);
    assert.match(stdout, /Logged: Hello, world!/);
  });
});
