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

function main(name, exclusion, updateMask) {
  // [START logging_update_exclusion_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource name of the exclusion to update:
   *      "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
   *      "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
   *      "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
   *  Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
   */
  // const name = 'abc123'
  /**
   *  Required. New values for the existing exclusion. Only the fields specified in
   *  `update_mask` are relevant.
   */
  // const exclusion = ''
  /**
   *  Required. A non-empty list of fields to change in the existing exclusion. New values
   *  for the fields are taken from the corresponding fields in the
   *  [LogExclusion][google.logging.v2.LogExclusion] included in this request. Fields not mentioned in
   *  `update_mask` are not changed and are ignored in the request.
   *  For example, to change the filter and description of an exclusion,
   *  specify an `update_mask` of `"filter,description"`.
   */
  // const updateMask = ''

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function updateExclusion() {
    // Construct request
    const request = {
      name,
      exclusion,
      updateMask,
    };

    // Run request
    const response = await loggingClient.updateExclusion(request);
    console.log(response);
  }

  updateExclusion();
  // [END logging_update_exclusion_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
