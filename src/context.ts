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
import * as uuid from 'uuid';
import * as crypto from 'crypto';
/** Header that carries span context across Google infrastructure. */
export const X_CLOUD_HEADER = 'x-cloud-trace-context';
/** Header that carries span context across W3C compliant infrastructure. */
export const TRACE_PARENT_HEADER = 'traceparent';
const SPAN_ID_RANDOM_BYTES = 8;
const spanIdBuffer = Buffer.alloc(SPAN_ID_RANDOM_BYTES);
const randomFillSync = crypto.randomFillSync;
const randomBytes = crypto.randomBytes;
const spanRandomBuffer = randomFillSync
  ? () => randomFillSync(spanIdBuffer)
  : () => randomBytes(SPAN_ID_RANDOM_BYTES);

/**
 * An transport and environment neutral API for getting request headers.
 */
export interface HeaderWrapper {
  getHeader(name: string): string | string[] | undefined;
  setHeader(name: string, value: string): void;
}

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
 * CloudTraceContext: Cloud Logging compliant trace context.
 */
export interface CloudTraceContext {
  trace: string;
  spanId?: string;
  traceSampled?: boolean;
}

/**
 * getTraceContext returns a CloudTraceContext with as many available trace and
 * span properties as possible. It examines HTTP headers for trace context.
 * Optionally, it can inject a Google compliant trace context when no context is
 * available from headers.
 */
export function getTraceContext(
  req: http.IncomingMessage,
  projectId: string,
  inject?: boolean
): CloudTraceContext {
  const defaultContext = toCloudTraceContext({}, projectId);
  const wrapper = makeHeaderWrapper(req);
  if (wrapper) {
    // Detect 'traceparent' header.
    const traceContext = getContextFromTraceParent(wrapper, projectId);
    if (traceContext) return traceContext;
    // Detect 'X-Cloud-Trace-Context' header.
    const cloudContext = getContextFromXCloudTrace(wrapper, projectId);
    if (cloudContext) return cloudContext;
    if (!cloudContext && inject) {
      wrapper.setHeader(X_CLOUD_HEADER, makeCloudTraceHeader());
      return getContextFromXCloudTrace(wrapper, projectId)!;
    }
  }
  return defaultContext;
}

/**
 * makeCloudTraceHeader generates valid X-Cloud-Trace-Context headers
 */
function makeCloudTraceHeader(): string {
  const trace = uuid.v4().replace(/-/g, '');
  const spanId = spanRandomBuffer().toString('hex');
  const traceSampled = true;
  return `${trace}/${spanId};o=${traceSampled}`;
}

/**
 * toCloudTraceContext converts any context format to cloudTraceContext format.
 * @param context
 */
function toCloudTraceContext(
  anyContext: any,
  projectId: string
): CloudTraceContext {
  const context: CloudTraceContext = {
    trace: '',
  };
  if (anyContext?.trace) {
    context.trace = `projects/${projectId}/traces/${anyContext.trace}`;
  }
  if (anyContext?.spanId) {
    context.spanId = anyContext.spanId;
  }
  if (anyContext?.traceSampled) {
    context.traceSampled = anyContext.traceSampled;
  }
  return context;
}

export function getContextFromXCloudTrace(
  headerWrapper: HeaderWrapper,
  projectId: string,
): CloudTraceContext | null {
  const context = parseXCloudTraceHeader(headerWrapper);
  if (!context) return null;
  const formatted = toCloudTraceContext(context, projectId);
  return formatted;
}

/**
 * getOrInjectTraceParent looks for the HTTP header 'traceparent'
 * per W3C specifications for OpenTelemetry and OpenCensus
 * Read more about W3C protocol: https://www.w3.org/TR/trace-context/
 *
 * Optional: Inject a W3C compliant context with trace and span in the header,
 * if not available.
 *
 * @param headerWrapper
 * @param inject
 */
export function getContextFromTraceParent(
  headerWrapper: HeaderWrapper,
  projectId: string,
  inject?: boolean
): CloudTraceContext | null {
  const context = parseTraceParentHeader(headerWrapper);
  if (!context) return null;
  return toCloudTraceContext(context, projectId);
}

/**
 * parseXCloudTraceHeader looks for trace context in `X-Cloud-Trace-Context`
 * header
 * @param headerWrapper
 */
export function parseXCloudTraceHeader(
  headerWrapper: HeaderWrapper
): CloudTraceContext | null {
  const regex = /([a-f\d]+)?(\/?([a-f\d]+))?(;?o=(\d))?/;
  const match = headerWrapper
    .getHeader(X_CLOUD_HEADER)
    ?.toString()
    .match(regex);
  if (!match) return null;
  return {
    trace: match[1],
    spanId: match[3],
    traceSampled: match[5] === '1',
  };
}

/**
 * parseTraceParentHeader is a custom implementation of the `parseTraceParent`
 * function in @opentelemetry-core/trace.
 * For more information see {@link https://www.w3.org/TR/trace-context/}
 */
export function parseTraceParentHeader(
  headerWrapper: HeaderWrapper
): CloudTraceContext | null {
  const VERSION_PART = '(?!ff)[\\da-f]{2}';
  const TRACE_ID_PART = '(?![0]{32})[\\da-f]{32}';
  const PARENT_ID_PART = '(?![0]{16})[\\da-f]{16}';
  const FLAGS_PART = '[\\da-f]{2}';
  const TRACE_PARENT_REGEX = new RegExp(
    `^\\s?(${VERSION_PART})-(${TRACE_ID_PART})-(${PARENT_ID_PART})-(${FLAGS_PART})(-.*)?\\s?$`
  );
  const match = headerWrapper
    .getHeader(TRACE_PARENT_HEADER)
    ?.toString()
    .match(TRACE_PARENT_REGEX);
  if (!match) return null;
  // According to the specification the implementation should be compatible
  // with future versions. If there are more parts, we only reject it if it's using version 00
  // See https://www.w3.org/TR/trace-context/#versioning-of-traceparent
  if (match[1] === '00' && match[5]) return null;
  return {
    trace: match[2],
    spanId: match[3],
    traceSampled: parseInt(match[4], 16) == 1,
  };
}
