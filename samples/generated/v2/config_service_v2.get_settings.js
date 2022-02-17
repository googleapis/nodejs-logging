// Copyright 2022 Google LLC
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

function main(name) {
  // [START logging_v2_generated_ConfigServiceV2_GetSettings_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource for which to retrieve settings.
   *      "projects/[PROJECT_ID]/settings"
   *      "organizations/[ORGANIZATION_ID]/settings"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]/settings"
   *      "folders/[FOLDER_ID]/settings"
   *  For example:
   *    `"organizations/12345/settings"`
   *  Note: Settings for the Log Router can be get for Google Cloud projects,
   *  folders, organizations and billing accounts. Currently it can only be
   *  configured for organizations. Once configured for an organization, it
   *  applies to all projects and folders in the Google Cloud organization.
   */
  // const name = 'abc123'

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function callGetSettings() {
    // Construct request
    const request = {
      name,
    };

    // Run request
    const response = await loggingClient.getSettings(request);
    console.log(response);
  }

  callGetSettings();
  // [END logging_v2_generated_ConfigServiceV2_GetSettings_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
