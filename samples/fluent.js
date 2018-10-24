/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

const express = require("express");
const app = express();

app.get("*", (req, res, next) => {
  return next("oops");
});

// [START fluent]
const structuredLogger = require("fluent-logger").createFluentSender("myapp", {
  host: "localhost",
  port: 24224,
  timeout: 3.0
});

const report = (err, req) => {
  const payload = {
    serviceContext: {
      service: "myapp"
    },
    message: err.stack,
    context: {
      httpRequest: {
        url: req.originalUrl,
        method: req.method,
        referrer: req.header("Referer"),
        userAgent: req.header("User-Agent"),
        remoteIp: req.ip,
        responseStatusCode: 500
      }
    }
  };
  structuredLogger.emit("errors", payload);
};

// Handle errors (the following uses the Express framework)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  report(err, req);
  res.status(500).send(err.response || "Something broke!");
});
// [END fluent]

module.exports = app;
