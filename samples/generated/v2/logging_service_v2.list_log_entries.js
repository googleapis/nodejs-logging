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
  // [START logging_list_log_entries_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. Names of one or more parent resources from which to
   *  retrieve log entries:
   *      "projects/[PROJECT_ID]"
   *      "organizations/[ORGANIZATION_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]"
   *      "folders/[FOLDER_ID]"
   *  May alternatively be one or more views
   *    projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    organization/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *    folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]
   *  Projects listed in the `project_ids` field are added to this list.
   */
  // const resourceNames = 'abc123'
  /**
   *  Optional. A filter that chooses which log entries to return.  See [Advanced
   *  Logs Queries](https://cloud.google.com/logging/docs/view/advanced-queries).
   *  Only log entries that match the filter are returned.  An empty filter
   *  matches all log entries in the resources listed in `resource_names`.
   *  Referencing a parent resource that is not listed in `resource_names` will
   *  cause the filter to return no results. The maximum length of the filter is
   *  20000 characters.
   */
  // const filter = 'abc123'
  /**
   *  Optional. How the results should be sorted.  Presently, the only permitted
   *  values are `"timestamp asc"` (default) and `"timestamp desc"`. The first
   *  option returns entries in order of increasing values of
   *  `LogEntry.timestamp` (oldest first), and the second option returns entries
   *  in order of decreasing timestamps (newest first).  Entries with equal
   *  timestamps are returned in order of their `insert_id` values.
   */
  // const orderBy = 'abc123'
  /**
   *  Optional. The maximum number of results to return from this request.
   *  Default is 50. If the value is negative or exceeds 1000,
   *  the request is rejected. The presence of `next_page_token` in the
   *  response indicates that more results might be available.
   */
  // const pageSize = 1234
  /**
   *  Optional. If present, then retrieve the next batch of results from the
   *  preceding call to this method.  `page_token` must be the value of
   *  `next_page_token` from the previous response.  The values of other method
   *  parameters should be identical to those in the previous call.
   */
  // const pageToken = 'abc123'

  // Imports the Logging library
  const {LoggingServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new LoggingServiceV2Client();

  async function listLogEntries() {
    // Construct request
    const request = {
      resourceNames,
    };

    // Run request
    const iterable = await loggingClient.listLogEntriesAsync(request);
    for await (const response of iterable) {
      console.log(response);
    }
  }

  listLogEntries();
  // [END logging_list_log_entries_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
