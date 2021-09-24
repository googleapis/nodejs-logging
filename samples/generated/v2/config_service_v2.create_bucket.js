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

function main(parent, bucketId, bucket) {
  // [START logging_v2_generated_ConfigServiceV2_CreateBucket_async]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  /**
   *  Required. The resource in which to create the bucket:
   *      "projects/[PROJECT_ID]/locations/[LOCATION_ID]"
   *  Example: `"projects/my-logging-project/locations/global"`
   */
  // const parent = 'abc123'
  /**
   *  Required. A client-assigned identifier such as `"my-bucket"`. Identifiers are
   *  limited to 100 characters and can include only letters, digits,
   *  underscores, hyphens, and periods.
   */
  // const bucketId = 'abc123'
  /**
   *  Required. The new bucket. The region specified in the new bucket must be compliant
   *  with any Location Restriction Org Policy. The name field in the bucket is
   *  ignored.
   */
  // const bucket = ''

  // Imports the Logging library
  const {ConfigServiceV2Client} = require('@google-cloud/logging').v2;

  // Instantiates a client
  const loggingClient = new ConfigServiceV2Client();

  async function createBucket() {
    // Construct request
    const request = {
      parent,
      bucketId,
      bucket,
    };

    // Run request
    const response = await loggingClient.createBucket(request);
    console.log(response);
  }

  createBucket();
  // [END logging_v2_generated_ConfigServiceV2_CreateBucket_async]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
