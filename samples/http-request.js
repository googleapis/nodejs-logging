// Copyright 2019 Google LLC
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

// sample-metadata:
//   title: Log HTTP Request
//   description: Log a message with httpRequest metadata.
//   usage: node http-request my-project-id
async function logHttpRequest(
  projectId = 'YOUR_PROJECT_ID', // Your Google Cloud Platform project ID
  logName = 'my-log', // The name of the log to write to
  requestMethod = 'GET', // GET, POST, PUT, etc.
  requestUrl = 'http://www.google.com',
  status = 200,
  userAgent = 'my-user-agent/1.0.0',
  latencySeconds = 3,
  responseSize = 256 // response size in bytes.
) {
  // [START logging_write_log_entry_advanced]
  // [START logging_http_request]
  /*
  const projectId = 'YOUR_PROJECT_ID'; // Your Google Cloud Platform project ID
  const logName = 'my-log'; // The name of the log to write to
  const requestMethod = 'GET'; // GET, POST, PUT, etc.
  const requestUrl = 'http://www.google.com';
  const status = 200;
  const userAgent = `my-user-agent/1.0.0`;
  const latencySeconds = 3;
  const responseSize = 256; // response size in bytes.
  */

  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging({projectId});

  // Selects the log to write to
  const log = logging.log(logName);

  // The data to write to the log
  const text = 'Hello, world!';

  // The metadata associated with the entry
  const metadata = {
    resource: {type: 'global'},
    httpRequest: {
      requestMethod,
      requestUrl,
      status,
      userAgent,
      latency: {
        seconds: latencySeconds,
      },
      responseSize,
    },
  };

  // Prepares a log entry
  const entry = log.entry(metadata, text);

  // Writes the log entry
  async function writeLog() {
    await log.write(entry);
    console.log(`Logged: ${text}`);
  }
  writeLog();
  // [END logging_http_request]
  // [END logging_write_log_entry_advanced]
}

const args = process.argv.slice(2);
logHttpRequest(...args).catch(console.error);
