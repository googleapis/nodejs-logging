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
 * This file contains http helper functions, used in both middleware and
 * non-middleware scenarios, to extract or inject useful LogEntry data to/fro
 * HTTP headers.
 *
 * Example:
 * - If header context is available from OpenCensus or OpenTelemetry (via W3
 * context propagation protocol), extract a log trace field.
 * - If context is available from X-Cloud-Trace-Context header, extract trace,
 * spanId, and traceSampled fields.
 */

import * as w3cContext from '@opencensus/propagation-stackdriver';
import * as http from 'http';
export interface CloudLoggingHttpRequest {
  requestMethod?: string;
  requestUrl?: string;
  requestSize?: number;
  status?: number;
  responseSize?: number;
  userAgent?: string;
  remoteIp?: string;
  serverIp?: string;
  referer?: string;
  latency?: {seconds: number; nanos: number};
  cacheLookup?: boolean;
  cacheHit?: boolean;
  cacheValidatedWithOriginServer?: boolean;
  cacheFillBytes?: number;
  protocol?: string;
}

/**
 * Abstraction of http.IncomingMessage used by middleware implementation.
 */
export interface ServerRequest extends http.IncomingMessage {
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
  req: ServerRequest | http.IncomingMessage,
  res?: http.ServerResponse,
  latencyMilliseconds?: number
): CloudLoggingHttpRequest {
  let requestUrl,
    protocol,
    requestMethod,
    userAgent,
    referer,
    status,
    responseSize,
    latency;
  // Format request properties
  if (req.url) {
    requestUrl = req.url;
    const url = new URL(requestUrl);
    protocol = url.protocol;
  }
  // OriginalURL overwrites inferred url
  if ('originalUrl' in req && req.originalUrl) {
    requestUrl = req.originalUrl;
    const url = new URL(requestUrl);
    protocol = url.protocol;
  }
  req.method ? (requestMethod = req.method) : null;
  if (req.headers && req.headers['user-agent']) {
    req.headers['user-agent'] ? (userAgent = req.headers['user-agent']) : null;
    req.headers['referer'] ? (referer = req.headers['referer']) : null;
  }
  // Format response properties
  if (res) {
    res.statusCode ? (status = res.statusCode) : null;
    responseSize =
      (res.getHeader && Number(res.getHeader('Content-Length'))) || 0;
  }
  // Format latency
  if (latencyMilliseconds) {
    latency = {
      seconds: Math.floor(latencyMilliseconds / 1e3),
      nanos: Math.floor((latencyMilliseconds % 1e3) * 1e6),
    };
  }
  // Only include the property if its value exists
  return Object.assign(
    {},
    requestUrl ? {requestUrl} : null,
    protocol ? {protocol} : null,
    requestMethod ? {requestMethod} : null,
    userAgent ? {userAgent} : null,
    referer ? {referer} : null,
    responseSize ? {responseSize} : null,
    status ? {status} : null,
    latency ? {latency} : null
  );
}

/**
 * HeaderWrapper: TODO
 */
export type HeaderWrapper = w3cContext.HeaderGetter & w3cContext.HeaderSetter;

/**
 * makeHeaderWrapper TODO
 * @param req
 */
export function makeHeaderWrapper(req: http.IncomingMessage): HeaderWrapper {
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

export interface CloudTraceContext {
  trace: string;
  spanId?: string;
  traceSampled?: boolean;
}

/**
 * getTraceContext returns available trace contexts by examining the HTTP
 * headers for various protocols. Optionally, it can inject trace context
 * according ot the W3C protocol.
 */
export function getTraceContext(
  req: http.IncomingMessage,
  projectId: string,
  inject?: boolean
): CloudTraceContext {
  const context: CloudTraceContext = {trace: ''};
  const wrapper = makeHeaderWrapper(req);
  // Detect 'X-Cloud-Trace-Context' header.
  const cloudContext = getCloudTraceContext(wrapper);
  console.log('Getting Cloud Trace Context');
  if (cloudContext) {
    context.trace = `projects/${projectId}/traces/${cloudContext.trace}`;
    context.spanId = cloudContext.spanId;
    context.traceSampled = cloudContext.traceSampled;
  } else {
    // Detect 'traceparent' header, injecting one if not available.
    const parentContext = getOrInjectTraceParent(wrapper, inject);
    console.log(parentContext);
    console.log('Getting W3C Trace Parent Context');
    if (parentContext) {
      context.trace = `projects/${projectId}/traces/${parentContext.traceId}`;
      context.spanId = parentContext.spanId;
    }
  }
  console.log('getTraceContext returns:');
  console.log('context');
  return context;
}

/**
 * getCloudTraceContext looks for the HTTP header 'X-Cloud-Trace-Context'
 * per Cloud Trace specifications
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
