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

function main(resourceNames) {
  // [START logging_v2_generated_LoggingServiceV2_TailLogEntries_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. Name of a parent resource from which to retrieve log entries:
   *  *  `projects/[PROJECT_ID]`
   *  *  `organizations/[ORGANIZATION_ID]`
   *  *  `billingAccounts/[BILLING_ACCOUNT_ID]`
   *  *  `folders/[FOLDER_ID]`
   *  May alternatively be one or more views:
   *   * `projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]`
   *   * `organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]`
   *   * `billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]`
   *   * `folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]`
   */
  // const resourceNames = 'abc123'
  /**
   *  Optional. A filter that chooses which log entries to return.  See Advanced
   *  Logs Filters (https://cloud.google.com/logging/docs/view/advanced_filters).
   *  Only log entries that match the filter are returned.  An empty filter
   *  matches all log entries in the resources listed in `resource_names`.
   *  Referencing a parent resource that is not in `resource_names` will cause
   *  the filter to return no results. The maximum length of the filter is 20000
   *  characters.
   */
  // const filter = 'abc123'
  /**
   *  Optional. The amount of time to buffer log entries at the server before
   *  being returned to prevent out of order results due to late arriving log
   *  entries. Valid values are between 0-60000 milliseconds. Defaults to 2000
   *  milliseconds.
   */
  // const bufferWindow = {}

  // Imports the Logging library
  const {LoggingServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new LoggingServiceV2Client();

  async function callTailLogEntries() {
    // Construct request
    const request = {
      resourceNames,
    };

    // Run request
    const stream = await loggingClient.tailLogEntries();
    stream.on('data', response => {
      console.log(response);
    });
    stream.on('error', err => {
      throw err;
    });
    stream.on('end', () => {
      /* API call completed */
    });
    stream.write(request);
    stream.end();
  }

  callTailLogEntries();
  // [END logging_v2_generated_LoggingServiceV2_TailLogEntries_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
