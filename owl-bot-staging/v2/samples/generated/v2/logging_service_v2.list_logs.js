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
  // [START logging_v2_generated_LoggingServiceV2_ListLogs_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource name that owns the logs:
   *      "projects/[PROJECT_ID]"
   *      "organizations/[ORGANIZATION_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]"
   *      "folders/[FOLDER_ID]"
   */
  // const parent = 'abc123'
  /**
   *  Optional. The maximum number of results to return from this request.
   *  Non-positive values are ignored.  The presence of `nextPageToken` in the
   *  response indicates that more results might be available.
   */
  // const pageSize = 1234
  /**
   *  Optional. If present, then retrieve the next batch of results from the
   *  preceding call to this method.  `pageToken` must be the value of
   *  `nextPageToken` from the previous response.  The values of other method
   *  parameters should be identical to those in the previous call.
   */
  // const pageToken = 'abc123'
  /**
   *  Optional. The resource name that owns the logs:
   *    projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    organization/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *  To support legacy queries, it could also be:
   *      "projects/[PROJECT_ID]"
   *      "organizations/[ORGANIZATION_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]"
   *      "folders/[FOLDER_ID]"
   */
  // const resourceNames = 'abc123'

  // Imports the Logging library
  const {LoggingServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new LoggingServiceV2Client();

  async function listLogs() {
    // Construct request
    const request = {
      parent,
    };

    // Run request
    const iterable = await loggingClient.listLogsAsync(request);
    for await (const response of iterable) {
        console.log(response);
    }
  }

  listLogs();
  // [END logging_v2_generated_LoggingServiceV2_ListLogs_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
