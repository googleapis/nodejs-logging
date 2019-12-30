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

const {Logging} = new require('@google-cloud/logging');
const {Storage} = new require('@google-cloud/storage');
const {assert} = require('chai');
const {describe, it, before, after} = require('mocha');
assert.rejects = require('assert').rejects;
const cp = require('child_process');
const uuid = require(`uuid`);

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

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
    const output = execSync(
      `${cmd} create ${sinkName} ${bucketName} "${filter}"`
    );
    assert.include(output, `Created sink ${sinkName} to ${bucketName}`);
    const [metadata] = await logging.sink(sinkName).getMetadata();
    assert.include(metadata.name, sinkName);
    assert.include(metadata.destination, bucketName);
    assert.include(metadata.filter, filter);
  });

  it(`should get a sink`, () => {
    const output = execSync(`${cmd} get ${sinkName}`);
    assert.include(output, sinkName);
  });

  it(`should list sinks`, () => {
    const output = execSync(`${cmd} list`);
    assert.include(output, 'Sinks:');
    assert.include(output, sinkName);
  });

  it(`should update a sink`, async () => {
    const newFilter = 'severity >= WARNING';
    const output = execSync(`${cmd} update ${sinkName} "${newFilter}"`);
    assert.include(output, `Sink ${sinkName} updated.`);
    const [metadata] = await logging.sink(sinkName).getMetadata();
    assert.include(metadata.name, sinkName);
    assert.include(metadata.destination, bucketName);
    assert.include(metadata.filter, newFilter);
  });

  it(`should delete a sink`, async () => {
    const output = execSync(`${cmd} delete ${sinkName}`);
    assert.include(output, `Sink ${sinkName} deleted.`);
    await assert.rejects(logging.sink(sinkName).getMetadata());
  });
});
