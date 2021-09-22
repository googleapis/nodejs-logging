// Copyright 2021 Google LLC
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

function main(parent) {
  // [START logging_list_log_metrics_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The name of the project containing the metrics:
   *      "projects/[PROJECT_ID]"
   */
  // const parent = 'abc123'
  /**
   *  Optional. If present, then retrieve the next batch of results from the
   *  preceding call to this method. `pageToken` must be the value of
   *  `nextPageToken` from the previous response. The values of other method
   *  parameters should be identical to those in the previous call.
   */
  // const pageToken = 'abc123'
  /**
   *  Optional. The maximum number of results to return from this request.
   *  Non-positive values are ignored. The presence of `nextPageToken` in the
   *  response indicates that more results might be available.
   */
  // const pageSize = 1234

  // Imports the Logging library
  const {MetricsServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new MetricsServiceV2Client();

  async function listLogMetrics() {
    // Construct request
    const request = {
      parent,
    };

    // Run request
    const iterable = await loggingClient.listLogMetricsAsync(request);
    for await (const response of iterable) {
        console.log(response);
    }
  }

  listLogMetrics();
  // [END logging_list_log_metrics_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
