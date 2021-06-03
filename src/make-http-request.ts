/*!
 * Copyright 2018 Google LLC
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

export function makeHttpRequestData(
  req: ServerRequest,
  res?: http.ServerResponse,
  latencyMilliseconds?: number
): CloudLoggingHttpRequest {
  // TODO: add `protocol` detection here.
  return Object.assign(
    {
      requestUrl: req.originalUrl,
      requestMethod: req.method,
      userAgent: req.headers['user-agent'],
    },
    res ? {status: res.statusCode} : null,
    res
      ? {
          responseSize:
            (res.getHeader && Number(res.getHeader('Content-Length'))) || 0,
        }
      : null,
    latencyMilliseconds
      ? {
          latency: {
            seconds: Math.floor(latencyMilliseconds / 1e3),
            nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6),
          },
        }
      : null
  );
}
