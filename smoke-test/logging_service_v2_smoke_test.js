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

describe('LoggingServiceV2SmokeTest', () => {
  if (!process.env.SMOKE_TEST_PROJECT) {
    throw new Error("Usage: SMOKE_TEST_PROJECT=<project_id> node #{$0}");
  }
  var projectId = process.env.SMOKE_TEST_PROJECT;

  it('successfully makes a call to the service', done => {
    const logging = require('../src');

    var client = new logging.v2.LoggingServiceV2Client({
      // optional auth parameters.
    });

    var formattedLogName = client.logPath(projectId, "test-" + Date.now().toString());
    var resource = {};
    var labels = {};
    var entries = [];
    var request = {
      logName: formattedLogName,
      resource: resource,
      labels: labels,
      entries: entries,
    };
    client.writeLogEntries(request)
      .then(responses => {
        var response = responses[0];
        console.log(response);
      })
      .then(done)
      .catch(done);
  });
});
