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

function main(name, settings) {
  // [START logging_v2_generated_ConfigServiceV2_UpdateSettings_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource name for the settings to update.
   *      "organizations/[ORGANIZATION_ID]/settings"
   *  For example:
   *    `"organizations/12345/settings"`
   *  Note: Settings for the Log Router can currently only be configured for
   *  Google Cloud organizations. Once configured, it applies to all projects and
   *  folders in the Google Cloud organization.
   */
  // const name = 'abc123'
  /**
   *  Required. The settings to update.
   *  See Enabling CMEK for Log
   *  Router (https://cloud.google.com/logging/docs/routing/managed-encryption)
   *  for more information.
   */
  // const settings = {}
  /**
   *  Optional. Field mask identifying which fields from `settings` should
   *  be updated. A field will be overwritten if and only if it is in the update
   *  mask. Output only fields cannot be updated.
   *  See FieldMask google.protobuf.FieldMask  for more information.
   *  For example: `"updateMask=kmsKeyName"`
   */
  // const updateMask = {}

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function callUpdateSettings() {
    // Construct request
    const request = {
      name,
      settings,
    };

    // Run request
    const response = await loggingClient.updateSettings(request);
    console.log(response);
  }

  callUpdateSettings();
  // [END logging_v2_generated_ConfigServiceV2_UpdateSettings_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
