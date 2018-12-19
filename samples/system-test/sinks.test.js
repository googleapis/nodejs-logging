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

const {Logging} = new require('@google-cloud/logging');
const {Storage} = new require('@google-cloud/storage');
const {assert} = require('chai');
const execa = require('execa');
const uuid = require(`uuid`);
const assertRejects = require('assert-rejects');

const exec = async cmd => (await execa.shell(cmd)).stdout;
const cmd = 'node sinks.js';
const bucketName = `nodejs-logging-sinks-test-${uuid.v4()}`;
const sinkName = `nodejs-logging-sinks-test-${uuid.v4()}`;
const filter = 'severity > WARNING';
const logging = new Logging();
const storage = new Storage();

describe('sinks', () => {
  before(async () => {
    await storage.createBucket(bucketName);
  });

  after(async () => {
    await logging
      .sink(sinkName)
      .delete()
      .catch(console.warn);
    await storage
      .bucket(bucketName)
      .delete()
      .catch(console.warn);
  });

  it(`should create a sink`, async () => {
    const output = await exec(
      `${cmd} create ${sinkName} ${bucketName} "${filter}"`
    );
    assert.strictEqual(output, `Created sink ${sinkName} to ${bucketName}`);
    const [metadata] = await logging.sink(sinkName).getMetadata();
    assert.strictEqual(metadata.name, sinkName);
    assert.match(metadata.destination, new RegExp(bucketName));
    assert.strictEqual(metadata.filter, filter);
  });

  it(`should get a sink`, async () => {
    const output = await exec(`${cmd} get ${sinkName}`);
    assert.match(output, new RegExp(sinkName));
  });

  it(`should list sinks`, async () => {
    const output = await exec(`${cmd} list`);
    assert.match(output, /Sinks:/);
    assert.match(output, new RegExp(sinkName));
  });

  it(`should update a sink`, async () => {
    const newFilter = 'severity >= WARNING';
    const output = await exec(`${cmd} update ${sinkName} "${newFilter}"`);
    assert.match(output, new RegExp(`Sink ${sinkName} updated.`));
    const [metadata] = await logging.sink(sinkName).getMetadata();
    assert.strictEqual(metadata.name, sinkName);
    assert.match(metadata.destination, new RegExp(bucketName));
    assert.strictEqual(metadata.filter, newFilter);
  });

  it(`should delete a sink`, async () => {
    const output = await exec(`${cmd} delete ${sinkName}`);
    assert.strictEqual(output, `Sink ${sinkName} deleted.`);
    await assertRejects(logging.sink(sinkName).getMetadata());
  });
});
