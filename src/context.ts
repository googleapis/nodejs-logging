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

/*
 * This file contains helper functions, used in both middleware and
 * non-middleware scenarios, to extract trace, span and traceSampled properties
 * from available HTTP header context.
 *
 * Specifically:
 * - If header context `traceparent` is available from OpenTelemetry (via W3
 * context propagation protocol), we extract trace and spanId.
 * - If header context `X-Cloud-Trace-Context` is available from the user or
 * Cloud Trace, we extract trace, spanId, and traceSampled fields.
 * - In the middleware scenario, we autoinject a `traceparent` context if one is
 * not available.
 */

import * as http from 'http';
import * as w3cContext from '@opencensus/propagation-stackdriver';

export interface CloudTraceContext {
  trace: string;
  spanId?: string;
  traceSampled?: boolean;
}

/**
 * HeaderWrapper: wraps getHeader and setHeader operations.
 */
export type HeaderWrapper = w3cContext.HeaderGetter & w3cContext.HeaderSetter;

/**
 * makeHeaderWrapper returns a wrapper with set and get header functionality,
 * returning null if the incoming request object doesn't contain the 'header'
 * propery.
 * @param req
 */
export function makeHeaderWrapper(
  req: http.IncomingMessage
): HeaderWrapper | null {
  if (!req.headers) return null;
  const wrapper = {
    setHeader(name: string, value: string) {
      req.headers[name] = value;
    },
    getHeader(name: string) {
      return req.headers[name];
    },
  };
  return wrapper;
}

/**
 * getTraceContext returns a CloudTraceContext with as many available trace and
 * span properties as possible. It examines HTTP headers for trace context.
 * Optionally, it can inject a W3C compliant trace context when no context is
 * available from headers.
 */
export function getTraceContext(
  req: http.IncomingMessage,
  projectId: string,
  inject?: boolean
): CloudTraceContext {
  const context: CloudTraceContext = {
    trace: '',
    spanId: undefined,
    traceSampled: undefined,
  };
  const wrapper = makeHeaderWrapper(req);
  if (wrapper) {
    // Detect 'X-Cloud-Trace-Context' header.
    const cloudContext = getCloudTraceContext(wrapper);
    if (cloudContext) {
      context.trace = `projects/${projectId}/traces/${cloudContext.trace}`;
      context.spanId = cloudContext.spanId;
      context.traceSampled = cloudContext.traceSampled;
    } else {
      // Detect 'traceparent' header, optionally injecting one if not available.
      const parentContext = getOrInjectTraceParent(wrapper, inject);
      if (parentContext) {
        context.trace = `projects/${projectId}/traces/${parentContext.traceId}`;
        context.spanId = parentContext.spanId;
      }
    }
  }
  return context;
}

/**
 * getCloudTraceContext looks for the HTTP header 'X-Cloud-Trace-Context'
 * per Cloud Trace specifications. `traceSampled` is false by default.
 * @param headerWrapper
 */
export function getCloudTraceContext(
  headerWrapper: HeaderWrapper
): CloudTraceContext | null {
  // Infer trace & span if not user specified already
  const regex = /([a-f\d]+)?(\/?([a-f\d]+))?(;?o=(\d))?/;
  const match = headerWrapper
    .getHeader('x-cloud-trace-context')
    ?.toString()
    .match(regex);
  if (match) {
    return {
      trace: match[1],
      spanId: match[3],
      traceSampled: match[5] === '1',
    };
  } else {
    return null;
  }
}

/**
 * getCloudTraceContext looks for the HTTP header 'traceparent'
 * per W3C specifications for OpenTelemetry and OpenCensus
 * Read more about W3C protocol: https://www.w3.org/TR/trace-context/
 *
 * Optional: Inject a W3C compliant context with trace and span in the header,
 * if not available.
 *
 * @param headerWrapper
 * @param inject
 */
export function getOrInjectTraceParent(
  headerWrapper: HeaderWrapper,
  inject?: boolean
): w3cContext.SpanContext | null {
  let spanContext = w3cContext.extract(headerWrapper);
  if (spanContext) return spanContext;
  if (inject) {
    // We were the first actor to detect lack of context. Establish context.
    spanContext = w3cContext.generate();
    w3cContext.inject(headerWrapper, spanContext);
  }
  return spanContext;
}
