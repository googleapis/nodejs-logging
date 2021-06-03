/*!
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as http from 'http';

import {CloudLoggingHttpRequest} from './http-request';

export interface ServerRequest
  extends CloudLoggingHttpRequest,
    http.IncomingMessage {
  originalUrl: string;
}

/**
 * makeHttpRequestData turns raw incoming HTTPRequests into structured
 * HTTPRequest objects interpreted by Cloud Logging. See more:
 * https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#httprequest
 *
 * @param req
 * @param res
 * @param latencyMilliseconds
 */
export function makeHttpRequestData(
  req: ServerRequest,
  res?: http.ServerResponse,
  latencyMilliseconds?: number
): CloudLoggingHttpRequest {
  let requestUrl, requestMethod, userAgent, status, responseSize, latency;
  req.url ? requestUrl = req.url : null;
  req.originalUrl ? requestUrl = req.originalUrl : requestUrl;
  req.method ? requestMethod = req.method : null;
  if (req.headers && req.headers['user-agent']) {
    userAgent = req.headers['user-agent'];
  }
  if (res) {
    res.statusCode ? status = res.statusCode : null;
    res.hasHeader('Content-Length')
      ? responseSize = Number(res.getHeader('Content-Length'))
      : null;
  }
  if (latencyMilliseconds) {
    latency = {
      seconds: Math.floor(latencyMilliseconds / 1e3),
      nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6),
    };
  }

  return Object.assign(
    {},
    requestUrl ? {requestUrl} : null,
    requestMethod ? {requestMethod} : null,
    userAgent ? {userAgent} : null,
    responseSize ? {responseSize} : null,
    status ? {status} : null,
    latency ? {latency} : null
  );
}
