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

import onFinished = require('on-finished');
import {getOrInjectContext, makeHeaderWrapper} from '../context';
// Types-only import.
import {Request, Response, NextFunction} from 'express';
import {makeHttpRequestData} from './make-http-request';

const CHILD_LOG_NAME_SUFFIX = 'applog';

export interface AnnotatedRequestType<LoggerType> extends Request {
  log: LoggerType;
}

export function makeMiddleware<LoggerType>(
    projectId: string,
    emitRequestLog: (httpRequest: HttpRequest, trace: string) => void,
    makeChildLogger: (childSuffix: string, trace: string) => LoggerType) {
  return (req: Request, res: Response, next: NextFunction) => {
    // TODO(ofrobots): use high-resolution timer.
    const requestStartMs = Date.now();

    const wrapper = makeHeaderWrapper(req);

    const spanContext = getOrInjectContext(wrapper);
    const trace = `projects/${projectId}/traces/${spanContext.traceId}`;

    // Install a child logger on the request object.
    (req as AnnotatedRequestType<LoggerType>).log =
        makeChildLogger(CHILD_LOG_NAME_SUFFIX, trace);

    // Emit a 'Request Log' on the parent logger.
    onFinished(res, () => {
      const latencyMs = Date.now() - requestStartMs;
      const httpRequest = makeHttpRequestData(req, res, latencyMs);
      emitRequestLog(httpRequest, trace);
    });

    next();
  };
}
