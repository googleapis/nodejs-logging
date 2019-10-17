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

import arrify = require('arrify');
import {DeleteCallback} from '@google-cloud/common';
import {callbackifyAll} from '@google-cloud/promisify';
import * as dotProp from 'dot-prop';
import * as extend from 'extend';
import {CallOptions} from 'google-gax';
import {Response} from 'teeny-request';

import {google} from '../proto/logging';

import {GetEntriesCallback, GetEntriesResponse, Logging} from '.';
import {Entry, EntryJson, LogEntry} from './entry';
import {getDefaultResource} from './metadata';

const snakeCaseKeys = require('snakecase-keys');

export interface GetEntriesRequest {
  autoPaginate?: boolean;
  filter?: string;
  gaxOptions?: CallOptions;
  log?: string;
  maxApiCalls?: number;
  maxResults?: number;
  orderBy?: string;
  pageSize?: number;
  pageToken?: string;
  resourceNames?: string[] | string;
}

export interface LogOptions {
  removeCircular?: boolean;
  maxEntrySize?: number; // see: https://cloud.google.com/logging/quotas
}

export type ApiResponse = [Response];
export interface ApiResponseCallback {
  (err: Error | null, apiResponse?: Response): void;
}

export type MonitoredResource = google.api.IMonitoredResource;
export interface WriteOptions {
  gaxOptions?: CallOptions;
  labels?: {[index: string]: string};
  resource?: MonitoredResource;
}

export enum Severity {
  emergency,
  alert,
  critical,
  error,
  warning,
  notice,
  info,
  debug,
}

export type SeverityNames = keyof typeof Severity;

// Mapped types are only supported in type aliases and not in interfaces and
// classes.
type LogSeverityFunctions = {
  // FIXME: the following can be made more precise.
  [P in SeverityNames]: Function;
};

/**
 * A log is a named collection of entries, each entry representing a timestamped
 * event. Logs can be produced by Google Cloud Platform services, by third-party
 * services, or by your applications. For example, the log `apache-access` is
 * produced by the Apache Web Server, but the log
 * `compute.googleapis.com/activity_log` is produced by Google Compute Engine.
 *
 * @see [Introduction to Logs]{@link https://cloud.google.com/logging/docs/basic-concepts#logs}
 *
 * @class
 *
 * @param {Logging} logging {@link Logging} instance.
 * @param {string} name Name of the log.
 * @param {object} [options] Configuration object.
 * @param {boolean} [options.removeCircular] Replace circular references in
 *     logged objects with a string value, `[Circular]`. (Default: false)
 *
 * @example
 * const {Logging} = require('@google-cloud/logging');
 * const logging = new Logging();
 * const log = logging.log('syslog');
 */
class Log implements LogSeverityFunctions {
  formattedName_: string;
  removeCircular_: boolean;
  maxEntrySize?: number;
  logging: Logging;
  name: string;
  constructor(logging: Logging, name: string, options?: LogOptions) {
    options = options || {};
    this.formattedName_ = Log.formatName_(logging.projectId, name);
    this.removeCircular_ = options.removeCircular === true;
    this.maxEntrySize = options.maxEntrySize;
    this.logging = logging;
    /**
     * @name Log#name
     * @type {string}
     */
    this.name = this.formattedName_.split('/').pop()!;
  }

  /**
   * Write a log entry with a severity of "ALERT".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.alert(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.alert(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  alert(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  alert(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  alert(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  alert(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'ALERT'),
      options! as WriteOptions
    );
  }

  /**
   * Write a log entry with a severity of "CRITICAL".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.critical(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.critical(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  critical(
    entry: Entry | Entry[],
    options?: WriteOptions
  ): Promise<ApiResponse>;
  critical(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  critical(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  critical(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'CRITICAL'),
      options! as WriteOptions
    );
  }

  /**
   * Write a log entry with a severity of "DEBUG".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.debug(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.debug(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  debug(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  debug(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  debug(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  debug(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'DEBUG'),
      options! as WriteOptions
    );
  }

  /**
   * @typedef {array} DeleteLogResponse
   * @property {object} 0 The full API response.
   */
  /**
   * @callback DeleteLogCallback
   * @param {?Error} err Request error, if any.
   * @param {object} apiResponse The full API response.
   */
  /**
   * Delete the log.
   *
   * @see [projects.logs.delete API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.logs/delete}
   *
   * @param {object} [gaxOptions] Request configuration options, outlined
   *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
   * @param {DeleteLogCallback} [callback] Callback function.
   * @returns {Promise<DeleteLogResponse>}
   *
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * log.delete((err, apiResponse) => {
   *   if (!err) {
   *     // The log was deleted.
   *   }
   * });
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.delete().then(data => {
   *   const apiResponse = data[0];
   * });
   *
   * @example <caption>include:samples/logs.js</caption>
   * region_tag:logging_delete_log
   * Another example:
   */
  delete(gaxOptions?: CallOptions): Promise<ApiResponse>;
  delete(gaxOptions: CallOptions, callback: DeleteCallback): void;
  delete(callback: DeleteCallback): void;
  async delete(
    gaxOptions?: CallOptions | DeleteCallback
  ): Promise<ApiResponse> {
    const projectId = await this.logging.auth.getProjectId();
    this.formattedName_ = Log.formatName_(projectId, this.name);
    const reqOpts = {
      logName: this.formattedName_,
    };
    return this.logging.loggingService.deleteLog(
      reqOpts,
      gaxOptions! as CallOptions
    );
  }

  /**
   * Write a log entry with a severity of "EMERGENCY".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.emergency(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.emergency(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  emergency(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  emergency(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  emergency(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'EMERGENCY'),
      options as WriteOptions
    );
  }

  /**
   * Create an entry object for this log.
   *
   * Note that using this method will not itself make any API requests. You will
   * use the object returned in other API calls, such as
   * {@link Log#write}.
   *
   * @see [LogEntry JSON representation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry}
   *
   * @param {?object} metadata See a
   *     [LogEntry
   * Resource](https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry).
   * @param {object|string} data The data to use as the value for this log
   *     entry.
   * @returns {Entry}
   *
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
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
   * const entry = log.entry(metadata, {
   *   delegate: 'my_username'
   * });
   *
   * entry.toJSON();
   * // {
   * //   logName: 'projects/grape-spaceship-123/logs/syslog',
   * //   resource: {
   * //     type: 'gce_instance',
   * //     labels: {
   * //       zone: 'global',
   * //       instance_id: '3'
   * //     }
   * //   },
   * //   jsonPayload: {
   * //     delegate: 'my_username'
   * //   }
   * // }
   */
  entry(metadata?: LogEntry): Entry;
  entry(data?: string | {}): Entry;
  entry(metadata?: LogEntry, data?: string | {}): Entry;
  entry(metadataOrData?: LogEntry | string | {}, data?: string | {}) {
    let metadata: LogEntry;
    if (!data) {
      data = metadataOrData as string | {};
      metadata = {};
    } else {
      metadata = metadataOrData as LogEntry;
    }
    return this.logging.entry(metadata, data);
  }

  /**
   * Write a log entry with a severity of "ERROR".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.error(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.error(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  error(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  error(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  error(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  error(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'ERROR'),
      options! as WriteOptions
    );
  }

  /**
   * This method is a wrapper around {module:logging#getEntries}, but with a
   * filter specified to only return entries from this log.
   *
   * @see [entries.list API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/entries/list}
   *
   * @param {GetEntriesRequest} [query] Query object for listing entries.
   * @param {GetEntriesCallback} [callback] Callback function.
   * @returns {Promise<GetEntriesResponse>}
   *
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * log.getEntries((err, entries) => {
   *   // `entries` is an array of Stackdriver Logging entry objects.
   *   // See the `data` property to read the data from the entry.
   * });
   *
   * //-
   * // To control how many API requests are made and page through the results
   * // manually, set `autoPaginate` to `false`.
   * //-
   * function callback(err, entries, nextQuery, apiResponse) {
   *   if (nextQuery) {
   *     // More results exist.
   *     log.getEntries(nextQuery, callback);
   *   }
   * }
   *
   * log.getEntries({
   *   autoPaginate: false
   * }, callback);
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.getEntries().then(data => {
   *   const entries = data[0];
   * });
   */
  getEntries(options?: GetEntriesRequest): Promise<GetEntriesResponse>;
  getEntries(callback: GetEntriesCallback): void;
  getEntries(options: GetEntriesRequest, callback: GetEntriesCallback): void;
  async getEntries(
    opts?: GetEntriesRequest | GetEntriesCallback
  ): Promise<GetEntriesResponse> {
    const options = extend({}, opts as GetEntriesRequest);
    const projectId = await this.logging.auth.getProjectId();
    this.formattedName_ = Log.formatName_(projectId, this.name);
    if (options.filter) {
      options.filter = `(${options.filter}) AND logName="${this.formattedName_}"`;
    } else {
      options.filter = `logName="${this.formattedName_}"`;
    }
    return this.logging.getEntries(options);
  }

  /**
   * This method is a wrapper around {module:logging#getEntriesStream}, but with
   * a filter specified to only return {module:logging/entry} objects from this
   * log.
   *
   * @method Log#getEntriesStream
   * @param {GetEntriesRequest} [query] Query object for listing entries.
   * @returns {ReadableStream} A readable stream that emits {@link Entry}
   *     instances.
   *
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * log.getEntriesStream()
   *   .on('error', console.error)
   *   .on('data', entry => {
   *     // `entry` is a Stackdriver Logging entry object.
   *     // See the `data` property to read the data from the entry.
   *   })
   *   .on('end', function() {
   *     // All entries retrieved.
   *   });
   *
   * //-
   * // If you anticipate many results, you can end a stream early to prevent
   * // unnecessary processing and API requests.
   * //-
   * log.getEntriesStream()
   *   .on('data', function(entry) {
   *     this.end();
   *   });
   */
  getEntriesStream(options: GetEntriesRequest) {
    options = extend(
      {
        log: this.name,
      },
      options
    );
    return this.logging.getEntriesStream(options);
  }

  /**
   * Write a log entry with a severity of "INFO".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.info(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.info(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  info(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  info(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  info(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  info(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'INFO'),
      options! as WriteOptions
    );
  }

  /**
   * Write a log entry with a severity of "NOTICE".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.notice(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.notice(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  notice(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  notice(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  notice(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  notice(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'NOTICE'),
      options! as WriteOptions
    );
  }

  /**
   * Write a log entry with a severity of "WARNING".
   *
   * This is a simple wrapper around {@link Log#write}. All arguments are
   * the same as documented there.
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   * @example
   * const {Logging} = require('@google-cloud/logging');
   * const logging = new Logging();
   * const log = logging.log('my-log');
   *
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.warning(entry, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.warning(entry).then(data => {
   *   const apiResponse = data[0];
   * });
   */
  warning(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  warning(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  warning(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  warning(
    entry: Entry | Entry[],
    options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    return this.write(
      Log.assignSeverityToEntries_(entry, 'WARNING'),
      options as WriteOptions
    );
  }

  /**
   * @typedef {array} LogWriteResponse
   * @property {object} 0 The full API response.
   */
  /**
   * @callback LogWriteCallback
   * @param {?Error} err Request error, if any.
   * @param {object} apiResponse The full API response.
   */
  /**
   * Write options.
   *
   * @typedef {object} WriteOptions
   * @property {object} gaxOptions Request configuration options, outlined here:
   *     https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
   * @property {object[]} labels Labels to set on the log.
   * @property {object} resource A default monitored resource for entries where
   *     one isn't specified.
   */
  /**
   * Write log entries to Stackdriver Logging.
   *
   * @see [entries.write API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/entries/write}
   *
   * @param {Entry|Entry[]} entry A log entry, or array of entries, to write.
   * @param {?WriteOptions} [options] Write options
   * @param {LogWriteCallback} [callback] Callback function.
   * @returns {Promise<LogWriteResponse>}
   *
   * @example
   * const entry = log.entry('gce_instance', {
   *   instance: 'my_instance'
   * });
   *
   * log.write(entry, (err, apiResponse) => {
   *   if (!err) {
   *     // The log entry was written.
   *   }
   * });
   *
   * //-
   * // You may also pass multiple log entries to write.
   * //-
   * const secondEntry = log.entry('compute.googleapis.com', {
   *   user: 'my_username'
   * });
   *
   * log.write([
   *   entry,
   *   secondEntry
   * ], (err, apiResponse) => {
   *   if (!err) {
   *     // The log entries were written.
   *   }
   * });
   *
   * //-
   * // To save some steps, you can also pass in plain values as your entries.
   * // Note, however, that you must provide a configuration object to specify
   * // the resource.
   * //-
   * const entries = [
   *   {
   *     user: 'my_username'
   *   },
   *   {
   *     home: process.env.HOME
   *   }
   * ];
   *
   * const options = {
   *   resource: 'compute.googleapis.com'
   * };
   *
   * log.write(entries, options, (err, apiResponse) => {});
   *
   * //-
   * // If the callback is omitted, we'll return a Promise.
   * //-
   * log.write(entries).then(data => {
   *   const apiResponse = data[0];
   * });
   *
   * @example <caption>include:samples/logs.js</caption>
   * region_tag:logging_write_log_entry
   * Another example:
   *
   * @example <caption>include:samples/logs.js</caption>
   * region_tag:logging_write_log_entry_advanced
   * Another example:
   */
  write(entry: Entry | Entry[], options?: WriteOptions): Promise<ApiResponse>;
  write(
    entry: Entry | Entry[],
    options: WriteOptions,
    callback: ApiResponseCallback
  ): void;
  write(entry: Entry | Entry[], callback: ApiResponseCallback): void;
  async write(
    entry: Entry | Entry[],
    opts?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> {
    const options = opts ? (opts as WriteOptions) : {};
    const self = this;

    if (options.resource) {
      if (options.resource.labels) {
        options.resource.labels = snakeCaseKeys(options.resource.labels);
      }
      return writeWithResource(options.resource);
    } else if (this.logging.detectedResource) {
      return writeWithResource(this.logging.detectedResource);
    } else {
      const resource = await getDefaultResource(this.logging.auth);
      this.logging.detectedResource = resource;
      return writeWithResource(resource);
    }
    async function writeWithResource(resource: {} | null) {
      let decoratedEntries;
      try {
        decoratedEntries = self.decorateEntries_(arrify(entry) as Entry[]);
      } catch (err) {
        // Ignore errors (the API will speak up if it has an issue).
      }
      self.truncateEntries(decoratedEntries);
      const projectId = await self.logging.auth.getProjectId();
      self.formattedName_ = Log.formatName_(projectId, self.name);
      const reqOpts = extend(
        {
          logName: self.formattedName_,
          entries: decoratedEntries,
          resource,
        },
        options
      );
      delete reqOpts.gaxOptions;
      return self.logging.loggingService.writeLogEntries(
        reqOpts,
        options.gaxOptions
      );
    }
  }

  /**
   * All entries are passed through here in order to get them serialized.
   *
   * @private
   *
   * @param {object[]} entries - Entry objects.
   * @returns {object[]} Serialized entries.
   * @throws if there is an error during serialization.
   */
  decorateEntries_(entries: Entry[]): EntryJson[] {
    return entries.map(entry => {
      if (!(entry instanceof Entry)) {
        entry = this.entry(entry);
      }
      return entry.toJSON({
        removeCircular: this.removeCircular_,
      });
    });
  }

  /**
   * Truncate log entries at maxEntrySize, so that error is not thrown, see:
   * https://cloud.google.com/logging/quotas
   *
   * @private
   *
   * @param {object|string} the JSON log entry.
   * @returns {object|string} truncated JSON log entry.
   */
  private truncateEntries(entries: EntryJson[]) {
    return entries.forEach(entry => {
      if (this.maxEntrySize === undefined) return;

      const payloadSize = JSON.stringify(entry).length;
      if (payloadSize < this.maxEntrySize) return;

      let delta = payloadSize - this.maxEntrySize;
      if (entry.textPayload) {
        entry.textPayload = entry.textPayload.slice(
          0,
          Math.max(entry.textPayload.length - delta, 0)
        );
      } else {
        const fieldsToTruncate = [
          // Winston:
          'jsonPayload.fields.metadata.structValue.fields.stack.stringValue',
          // Bunyan:
          'jsonPayload.fields.msg.stringValue',
          'jsonPayload.fields.err.structValue.fields.stack.stringValue',
          'jsonPayload.fields.err.structValue.fields.message.stringValue',
          // All:
          'jsonPayload.fields.message.stringValue',
        ];
        for (const field of fieldsToTruncate) {
          const msg: string = dotProp.get(entry, field, '');
          if (msg !== '') {
            dotProp.set(
              entry,
              field,
              msg.slice(0, Math.max(msg.length - delta, 0))
            );
            delta -= Math.min(msg.length, delta);
          }
        }
      }
    });
  }

  /**
   * Return an array of log entries with the desired severity assigned.
   *
   * @private
   *
   * @param {object|object[]} entries - Log entries.
   * @param {string} severity - The desired severity level.
   */
  static assignSeverityToEntries_(
    entries: Entry | Entry[],
    severity: string
  ): Entry[] {
    return (arrify(entries) as Entry[]).map(entry => {
      const metadata = extend(true, {}, entry.metadata, {
        severity,
      });
      return extend(new Entry(), entry, {
        metadata,
      });
    });
  }

  /**
   * Format the name of a log. A log's full name is in the format of
   * 'projects/{projectId}/logs/{logName}'.
   *
   * @private
   *
   * @returns {string}
   */
  static formatName_(projectId: string, name: string) {
    const path = 'projects/' + projectId + '/logs/';
    name = name.replace(path, '');
    if (decodeURIComponent(name) === name) {
      // The name has not been encoded yet.
      name = encodeURIComponent(name);
    }
    return path + name;
  }
}

/*! Developer Documentation
 *
 * All async methods (except for streams) will call a callback in the event
 * that a callback is provided .
 */
callbackifyAll(Log, {exclude: ['entry', 'getEntriesStream']});

/**
 * Reference to the {@link Log} class.
 * @name module:@google-cloud/logging.Log
 * @see Log
 */
export {Log};
