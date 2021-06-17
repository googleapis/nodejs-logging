/*!
 * Copyright 2015 Google Inc. All Rights Reserved.
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

// eslint-disable-next-line @typescript-eslint/no-var-requires
const EventId = require('eventid');
import * as extend from 'extend';
import {google} from '../protos/protos';
import {objToStruct, structToObj} from './common';
import {makeHttpRequestData, CloudLoggingHttpRequest} from './http-request';
import {CloudTraceContext, getOrInjectContext} from './context';
import * as http from 'http';

const eventId = new EventId();

export const INSERT_ID_KEY = 'logging.googleapis.com/insertId';
export const LABELS_KEY = 'logging.googleapis.com/labels';
export const OPERATION_KEY = 'logging.googleapis.com/operation';
export const SOURCE_LOCATION_KEY = 'logging.googleapis.com/sourceLocation';
export const SPAN_ID_KEY = 'logging.googleapis.com/spanId';
export const TRACE_KEY = 'logging.googleapis.com/trace';
export const TRACE_SAMPLED_KEY = 'logging.googleapis.com/trace_sampled';

// Accepted field types from user supported by this client library.
export type Timestamp = google.protobuf.ITimestamp | Date | string;
export type LogSeverity = google.logging.type.LogSeverity | string;
export type RawHttpRequest = http.IncomingMessage & CloudLoggingHttpRequest;
export type HttpRequest =
  | google.logging.type.IHttpRequest
  | CloudLoggingHttpRequest
  | RawHttpRequest;
export type LogEntry = Omit<
  google.logging.v2.ILogEntry,
  'timestamp' | 'severity' | 'httpRequest'
> & {
  timestamp?: Timestamp | null;
  severity?: LogSeverity | null;
  httpRequest?: HttpRequest | null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Data = any;

// Specific Entry properties that need to be reformatted for submission to the
// LoggingService API.
export interface EntryJson {
  timestamp: Timestamp;
  insertId: number;
  jsonPayload?: google.protobuf.IStruct;
  textPayload?: string;
  httpRequest?: google.logging.type.IHttpRequest;
  trace?: string;
  spanId?: string;
  traceSampled?: boolean;
}

// Specific Entry properties that need to be reformatted for submission to a
// custom transport.
export interface StructuredJson {
  // Universally supported properties
  severity?: LogSeverity;
  message?: string | object | null;
  // log is a legacy property, always clobbered by `message`
  // log?: string;
  httpRequest?: object;
  timestamp?: string;
  [INSERT_ID_KEY]?: string | null;
  [LABELS_KEY]?: object;
  // [OPERATION_KEY]?: object;
  // [SOURCE_LOCATION_KEY]?: string;
  [SPAN_ID_KEY]?: string;
  [TRACE_KEY]?: string;
  [TRACE_SAMPLED_KEY]?: boolean | null;
  // Additional properties supported by Serverless agents
  // timestampSeconds?: string;
  // timestampNanos?: string;
  // time?: string;
  // Properties not supported by all agents (e.g. Cloud Run)
  logName?: string;
  resource?: object;
}

export interface ToJsonOptions {
  removeCircular?: boolean;
}

/**
 * Create an entry object to define new data to insert into a meta.
 *
 * Note, [Cloud Logging Quotas and limits]{@link https://cloud.google.com/logging/quotas}
 * dictates that the maximum log entry size, including all
 * [LogEntry Resource properties]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry},
 * cannot exceed _approximately_ 256 KB.
 *
 * @see [LogEntry JSON representation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry}
 *
 * @class
 *
 * @param {?object} [metadata] See a
 *     [LogEntry
 * Resource](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).
 * @param {object|string} data The data to use as the value for this log
 *     entry.
 *
 *     If providing an object, these value types are supported:
 *     - `String`
 *     - `Number`
 *     - `Boolean`
 *     - `Buffer`
 *     - `Object`
 *     - `Array`
 *
 *     Any other types are stringified with `String(value)`.
 *
 * @example
 * const {Logging} = require('@google-cloud/logging');
 * const logging = new Logging();
 * const syslog = logging.log('syslog');
 *
 * const metadata = {
 *   resource: {
 *     type: 'gce_instance',
 *     labels: {
 *       zone: 'global',
 *       instance_id: '3'
 *     }
 *   }
 * };
 *
 * const entry = sysmeta.entry(metadata, {
 *   delegate: 'my_username'
 * });
 *
 * sysmeta.alert(entry, (err, apiResponse) => {
 *   if (!err) {
 *     // Log entry inserted successfully.
 *   }
 * });
 *
 * //-
 * // You will also receive `Entry` objects when using
 * // Logging#getEntries() and Log#getEntries().
 * //-
 * logging.getEntries((err, entries) => {
 *   if (!err) {
 *     // entries[0].data = The data value from the log entry.
 *   }
 * });
 */
class Entry {
  metadata: LogEntry;
  data: Data;
  constructor(metadata?: LogEntry, data?: Data) {
    /**
     * @name Entry#metadata
     * @type {object}
     * @property {Date} timestamp
     * @property {number} insertId
     */
    this.metadata = extend(
      {
        timestamp: new Date(),
      },
      metadata
    );
    // JavaScript date has a very coarse granularity (millisecond), which makes
    // it quite likely that multiple log entries would have the same timestamp.
    // The Logging API doesn't guarantee to preserve insertion order for entries
    // with the same timestamp. The service does use `insertId` as a secondary
    // ordering for entries with the same timestamp. `insertId` needs to be
    // globally unique (within the project) however.
    //
    // We use a globally unique monotonically increasing EventId as the
    // insertId.
    this.metadata.insertId = this.metadata.insertId || eventId.new();
    /**
     * @name Entry#data
     * @type {object}
     */
    this.data = data;
  }

  /**
   * Serialize an entry to the format the API expects. Read more:
   * https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
   *
   * @param {object} [options] Configuration object.
   * @param projectId
   * @param {boolean} [options.removeCircular] Replace circular references in an
   *     object with a string value, `[Circular]`.
   */
  toJSON(options: ToJsonOptions = {}, projectId = '') {
    const entry = (extend(true, {}, this.metadata) as {}) as EntryJson;
    // Format log message
    if (Object.prototype.toString.call(this.data) === '[object Object]') {
      entry.jsonPayload = objToStruct(this.data, {
        removeCircular: !!options.removeCircular,
        stringify: true,
      });
    } else if (typeof this.data === 'string') {
      entry.textPayload = this.data;
    }
    // Format log timestamp
    if (entry.timestamp instanceof Date) {
      const seconds = entry.timestamp.getTime() / 1000;
      const secondsRounded = Math.floor(seconds);
      entry.timestamp = {
        seconds: secondsRounded,
        nanos: Math.floor((seconds - secondsRounded) * 1e9),
      };
    } else if (typeof entry.timestamp === 'string') {
      // Convert RFC3339 "Zulu" timestamp into a format that can be parsed to Date
      const zuluTime = entry.timestamp;
      const ms = Date.parse(zuluTime.split(/[.,Z]/)[0] + 'Z');
      const reNano = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.(\d{0,9})Z$/;
      const nanoSecs = zuluTime.match(reNano)?.[1];
      entry.timestamp = {
        seconds: ms ? Math.floor(ms / 1000) : 0,
        nanos: nanoSecs ? Number(nanoSecs.padEnd(9, '0')) : 0,
      };
    }
    // Format httpRequest
    const req = this.metadata.httpRequest;
    if (
      req &&
      ('statusCode' in req ||
        'headers' in req ||
        'method' in req ||
        'url' in req)
    ) {
      entry.httpRequest = makeHttpRequestData(req);
    }
    // Format trace and span
    const traceContext = this.extractTraceFromHeaders(projectId);
    if (traceContext) {
      if (!this.metadata.trace && traceContext.trace)
        entry.trace = traceContext.trace;
      if (!this.metadata.spanId && traceContext.spanId)
        entry.spanId = traceContext.spanId;
      if (this.metadata.traceSampled === undefined)
        entry.traceSampled = traceContext.traceSampled;
    }
    return entry;
  }

  /**
   * Serialize an entry to a standard format for any transports, e.g. agents.
   * Read more: https://cloud.google.com/logging/docs/structured-logging
   */
  toStructuredJSON(projectId = '') {
    const entry = extend(true, {}, this.metadata) as {} as StructuredJson;
    const meta = this.metadata;

    if (meta.labels) {
      entry[LABELS_KEY] = Object.assign({}, meta.labels);
      delete meta.labels;
    }
    if (meta.textPayload || meta.jsonPayload) {
      entry.message = meta.textPayload ? meta.textPayload : meta.jsonPayload;
      delete meta.textPayload;
      delete meta.jsonPayload;
    }
    this.data ? entry.message = this.data : null;
    if (meta.insertId) {
      entry[INSERT_ID_KEY] = meta.insertId!;
      delete meta.insertId;
    }
    // TODO parse this
    // meta.httpRequest ? (entry.httpRequest = meta.httpRequest) : null;
    // // TODO parse this
    // meta.timestamp ? (entry.timestamp = 'todo this later') : null;
    // // TODO parse this
    // meta.spanId ? (entry[SPAN_ID_KEY] = meta.spanId) : null;
    // meta.trace ? (entry[TRACE_KEY] = meta.trace) : null;
    // 'traceSampled' in meta
    //   ? (entry[TRACE_SAMPLED_KEY] = meta.traceSampled)
    //   : null;
    console.log('Formatting:');
    console.log(this);
    console.log('Into:');
    console.log(entry);
    return entry;
  }

  /**
   * extractTraceFromHeaders extracts trace and span information from raw HTTP
   * request headers only.
   * @private
   */
  private extractTraceFromHeaders(projectId: string): CloudTraceContext | null {
    const rawReq = this.metadata.httpRequest;
    if (rawReq && 'headers' in rawReq) {
      // TODO: we can just get header from this.metadata.logName.
      return getOrInjectContext(rawReq, projectId, false);
    }
    return null;
  }

  /**
   * Create an Entry object from an API response, such as `entries:list`.
   *
   * @private
   *
   * @param {object} entry An API representation of an entry. See a
   *     [LogEntry](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).
   * @returns {Entry}
   */
  static fromApiResponse_(entry: google.logging.v2.LogEntry) {
    let data = entry[entry.payload!];
    if (entry.payload === 'jsonPayload') {
      data = structToObj(data);
    }
    const serializedEntry = new Entry(entry, data);
    if (entry.timestamp) {
      let ms = Number(entry.timestamp.seconds) * 1000;
      ms += Number(entry.timestamp.nanos) / 1e6;
      serializedEntry.metadata.timestamp = new Date(ms);
    }
    return serializedEntry;
  }
}

/**
 * Reference to the {@link Entry} class.
 * @name module:@google-cloud/logging.Entry
 * @see Entry
 */
export {Entry};
