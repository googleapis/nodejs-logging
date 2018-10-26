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

// Types-only import.
import {Request, Response} from 'express';

import {StackdriverHttpRequest} from '../../http-request';

export function makeHttpRequestData(
    req: Request, res: Response,
    latencyMilliseconds: number): StackdriverHttpRequest {
  return {
    status: res.statusCode,
    requestUrl: req.url,
    requestMethod: req.method,
    userAgent: req.headers['user-agent'],
    responseSize:
        (res.getHeader && Number(res.getHeader('Content-Length'))) || 0,
    latency: {
      seconds: Math.floor(latencyMilliseconds / 1e3),
      nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6)
    }
  };
}
