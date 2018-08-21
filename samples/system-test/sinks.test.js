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

const logging = new (require('@google-cloud/logging'))();
const path = require(`path`);
const storage = new (require('@google-cloud/storage'))();
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);
const assertRejects = require('assert-rejects');

const cwd = path.join(__dirname, `..`);
const cmd = `node sinks.js`;

const bucketName = `nodejs-logging-sinks-test-${uuid.v4()}`;
const sinkName = `nodejs-logging-sinks-test-${uuid.v4()}`;
const filter = `severity > WARNING`;

before(tools.checkCredentials);
before(async () => {
  await storage.createBucket(bucketName);
});

after(async () => {
  try {
    await logging.sink(sinkName).delete();
  } catch (err) {} // ignore error
  try {
    await storage.bucket(bucketName).delete();
  } catch (err) {} // ignore error
});

it(`should create a sink`, async () => {
  const output = await tools.runAsync(
    `${cmd} create ${sinkName} ${bucketName} "${filter}"`,
    cwd
  );
  assert.strictEqual(output, `Created sink ${sinkName} to ${bucketName}`);
  const [metadata] = await logging.sink(sinkName).getMetadata();
  assert.strictEqual(metadata.name, sinkName);
  assert.strictEqual(metadata.destination.includes(bucketName), true);
  assert.strictEqual(metadata.filter, filter);
});

it(`should get a sink`, async () => {
  const output = await tools.runAsync(`${cmd} get ${sinkName}`, cwd);
  assert.strictEqual(output.includes(sinkName), true);
});

it(`should list sinks`, async () => {
  await tools
    .tryTest(async assert => {
      const output = await tools.runAsync(`${cmd} list`, cwd);
      assert(output.includes(`Sinks:`));
      assert(output.includes(sinkName));
    })
    .start();
});

it(`should update a sink`, async () => {
  const newFilter = 'severity >= WARNING';
  const output = await tools.runAsync(
    `${cmd} update ${sinkName} "${newFilter}"`,
    cwd
  );
  assert(output.indexOf(`Sink ${sinkName} updated.`) > -1);
  const [metadata] = await logging.sink(sinkName).getMetadata();
  assert.strictEqual(metadata.name, sinkName);
  assert.strictEqual(metadata.destination.includes(bucketName), true);
  assert.strictEqual(metadata.filter, newFilter);
});

it(`should delete a sink`, async () => {
  const output = await tools.runAsync(`${cmd} delete ${sinkName}`, cwd);
  assert.strictEqual(output, `Sink ${sinkName} deleted.`);
  await assertRejects(logging.sink(sinkName).getMetadata());
});
