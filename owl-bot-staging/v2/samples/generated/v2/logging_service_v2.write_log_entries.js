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

function main(entries) {
  // [START logging_v2_generated_LoggingServiceV2_WriteLogEntries_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Optional. A default log resource name that is assigned to all log entries
   *  in `entries` that do not specify a value for `log_name`:
   *      "projects/[PROJECT_ID]/logs/[LOG_ID]"
   *      "organizations/[ORGANIZATION_ID]/logs/[LOG_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]/logs/[LOG_ID]"
   *      "folders/[FOLDER_ID]/logs/[LOG_ID]"
   *  `[LOG_ID]` must be URL-encoded. For example:
   *      "projects/my-project-id/logs/syslog"
   *      "organizations/1234567890/logs/cloudresourcemanager.googleapis.com%2Factivity"
   *  The permission `logging.logEntries.create` is needed on each project,
   *  organization, billing account, or folder that is receiving new log
   *  entries, whether the resource is specified in `logName` or in an
   *  individual log entry.
   */
  // const logName = 'abc123'
  /**
   *  Optional. A default monitored resource object that is assigned to all log
   *  entries in `entries` that do not specify a value for `resource`. Example:
   *      { "type": "gce_instance",
   *        "labels": {
   *          "zone": "us-central1-a", "instance_id": "00000000000000000000" }}
   *  See LogEntry google.logging.v2.LogEntry.
   */
  // const resource = {}
  /**
   *  Optional. Default labels that are added to the `labels` field of all log
   *  entries in `entries`. If a log entry already has a label with the same key
   *  as a label in this parameter, then the log entry's label is not changed.
   *  See LogEntry google.logging.v2.LogEntry.
   */
  // const labels = 1234
  /**
   *  Required. The log entries to send to Logging. The order of log
   *  entries in this list does not matter. Values supplied in this method's
   *  `log_name`, `resource`, and `labels` fields are copied into those log
   *  entries in this list that do not include values for their corresponding
   *  fields. For more information, see the
   *  LogEntry google.logging.v2.LogEntry  type.
   *  If the `timestamp` or `insert_id` fields are missing in log entries, then
   *  this method supplies the current time or a unique identifier, respectively.
   *  The supplied values are chosen so that, among the log entries that did not
   *  supply their own values, the entries earlier in the list will sort before
   *  the entries later in the list. See the `entries.list` method.
   *  Log entries with timestamps that are more than the
   *  logs retention period (https://cloud.google.com/logging/quota-policy) in
   *  the past or more than 24 hours in the future will not be available when
   *  calling `entries.list`. However, those log entries can still be exported
   *  with
   *  LogSinks (https://cloud.google.com/logging/docs/api/tasks/exporting-logs).
   *  To improve throughput and to avoid exceeding the
   *  quota limit (https://cloud.google.com/logging/quota-policy) for calls to
   *  `entries.write`, you should try to include several log entries in this
   *  list, rather than calling this method for each individual log entry.
   */
  // const entries = 1234
  /**
   *  Optional. Whether valid entries should be written even if some other
   *  entries fail due to INVALID_ARGUMENT or PERMISSION_DENIED errors. If any
   *  entry is not written, then the response status is the error associated
   *  with one of the failed entries and the response includes error details
   *  keyed by the entries' zero-based index in the `entries.write` method.
   */
  // const partialSuccess = true
  /**
   *  Optional. If true, the request should expect normal response, but the
   *  entries won't be persisted nor exported. Useful for checking whether the
   *  logging API endpoints are working properly before sending valuable data.
   */
  // const dryRun = true

  // Imports the Logging library
  const {LoggingServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new LoggingServiceV2Client();

  async function callWriteLogEntries() {
    // Construct request
    const request = {
      entries,
    };

    // Run request
    const response = await loggingClient.writeLogEntries(request);
    console.log(response);
  }

  callWriteLogEntries();
  // [END logging_v2_generated_LoggingServiceV2_WriteLogEntries_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));