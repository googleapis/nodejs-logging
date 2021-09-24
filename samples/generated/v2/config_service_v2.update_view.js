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

function main(name, view) {
  // [START logging_v2_generated_ConfigServiceV2_UpdateView_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The full resource name of the view to update
   *      "projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]/views/[VIEW_ID]"
   *  Example:
   *    `"projects/my-project-id/locations/my-location/buckets/my-bucket-id/views/my-view-id"`.
   */
  // const name = 'abc123'
  /**
   *  Required. The updated view.
   */
  // const view = ''
  /**
   *  Optional. Field mask that specifies the fields in `view` that need
   *  an update. A field will be overwritten if, and only if, it is
   *  in the update mask. `name` and output only fields cannot be updated.
   *  For a detailed `FieldMask` definition, see
   *  https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.FieldMask
   *  Example: `updateMask=filter`.
   */
  // const updateMask = ''

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function updateView() {
    // Construct request
    const request = {
      name,
      view,
    };

    // Run request
    const response = await loggingClient.updateView(request);
    console.log(response);
  }

  updateView();
  // [END logging_v2_generated_ConfigServiceV2_UpdateView_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
