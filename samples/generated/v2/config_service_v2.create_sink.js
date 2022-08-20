// Copyright 2022 Google LLC
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
//
// ** This file is automatically generated by gapic-generator-typescript. **
// ** https://github.com/googleapis/gapic-generator-typescript **
// ** All changes to this file may be overwritten. **

'use strict';

function main(parent, sink) {
  // [START logging_v2_generated_ConfigServiceV2_CreateSink_async]
  /**
   * This snippet has been automatically generated and should be regarded as a code template only.
   * It will require modifications to work.
   * It may require correct/in-range values for request initialization.
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource in which to create the sink:
   *      "projects/[PROJECT_ID]"
   *      "organizations/[ORGANIZATION_ID]"
   *      "billingAccounts/[BILLING_ACCOUNT_ID]"
   *      "folders/[FOLDER_ID]"
   *  For examples:
   *    `"projects/my-project"`
   *    `"organizations/123456789"`
   */
  // const parent = 'abc123'
  /**
   *  Required. The new sink, whose `name` parameter is a sink identifier that
   *  is not already in use.
   */
  // const sink = {}
  /**
   *  Optional. Determines the kind of IAM identity returned as `writer_identity`
   *  in the new sink. If this value is omitted or set to false, and if the
   *  sink's parent is a project, then the value returned as `writer_identity` is
   *  the same group or service account used by Cloud Logging before the addition
   *  of writer identities to this API. The sink's destination must be in the
   *  same project as the sink itself.
   *  If this field is set to true, or if the sink is owned by a non-project
   *  resource such as an organization, then the value of `writer_identity` will
   *  be a unique service account used only for exports from the new sink. For
   *  more information, see `writer_identity` in LogSink google.logging.v2.LogSink.
   */
  // const uniqueWriterIdentity = true

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function callCreateSink() {
    // Construct request
    const request = {
      parent,
      sink,
    };

    // Run request
    const response = await loggingClient.createSink(request);
    console.log(response);
  }

  callCreateSink();
  // [END logging_v2_generated_ConfigServiceV2_CreateSink_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
