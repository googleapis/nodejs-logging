// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {describe, it} = require('mocha');

describe('LoggingServiceV2SmokeTest', () => {
  if (!process.env.GCLOUD_PROJECT) {
    throw new Error('Usage: GCLOUD_PROJECT=<project_id> node #{$0}');
  }
  const projectId = process.env.GCLOUD_PROJECT;

  it('successfully makes a call to the service', done => {
    const logging = require('../src');

    const client = new logging.v2.LoggingServiceV2Client({
      // optional auth parameters.
    });

    const formattedLogName = client.logPath(
      projectId,
      'test-' + Date.now().toString()
    );
    const resource = {};
    const labels = {};
    const entries = [];
    const request = {
      logName: formattedLogName,
      resource: resource,
      labels: labels,
      entries: entries,
    };
    client
      .writeLogEntries(request)
      .then(done)
      .catch(done);
  });
});
