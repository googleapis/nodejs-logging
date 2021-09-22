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

function main(name, cmekSettings) {
  // [START logging_update_cmek_settings_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource name for the CMEK settings to update.
   *      "projects/[PROJECT_ID]/cmekSettings"
   *      "organizations/[ORGANIZATION_ID]/cmekSettings"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]/cmekSettings"
   *      "folders/[FOLDER_ID]/cmekSettings"
   *  Example: `"organizations/12345/cmekSettings"`.
   *  Note: CMEK for the Logs Router can currently only be configured for GCP
   *  organizations. Once configured, it applies to all projects and folders in
   *  the GCP organization.
   */
  // const name = 'abc123'
  /**
   *  Required. The CMEK settings to update.
   *  See [Enabling CMEK for Logs
   *  Router](https://cloud.google.com/logging/docs/routing/managed-encryption)
   *  for more information.
   */
  // const cmekSettings = ''
  /**
   *  Optional. Field mask identifying which fields from `cmek_settings` should
   *  be updated. A field will be overwritten if and only if it is in the update
   *  mask. Output only fields cannot be updated.
   *  See [FieldMask][google.protobuf.FieldMask] for more information.
   *  Example: `"updateMask=kmsKeyName"`
   */
  // const updateMask = ''

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function updateCmekSettings() {
    // Construct request
    const request = {
      name,
      cmekSettings,
    };

    // Run request
    const response = await loggingClient.updateCmekSettings(request);
    console.log(response);
  }

  updateCmekSettings();
  // [END logging_update_cmek_settings_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
