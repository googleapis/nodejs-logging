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

/**
 * This is a helper library for synchronously writing logs to a transport.
 */

import arrify = require('arrify');
import {Logging} from '.';
import {Entry, LABELS_KEY, LogEntry, StructuredJson} from './entry';
import {Writable} from 'stream';
import {
  LogSeverityFunctions,
  assignSeverityToEntries,
  snakecaseKeys,
  formatLogName,
  WriteOptions,
} from './utils/log-common';

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
 * @param {number} [options.maxEntrySize] A max entry size
 * @param {boolean|Writable} [options.transport] Override the write to API stream with a
 *     custom log stream, like stdout/stderr, rather than loggingService API.
 *     Recommended for Cloud Functions and other Serverless GCP service
 *     environments (Default: false)
 *
 * @example
 * const {Logging} = require('@google-cloud/logging');
 * const logging = new Logging();
 * const log = logging.log('syslog');
 */
class LogSync implements LogSeverityFunctions {
  formattedName_: string;
  logging: Logging;
  name: string;
  transport: Writable;

  // not projectId, formattedname is expected
  constructor(logging: Logging, name: string, transport?: Writable) {
    this.formattedName_ = formatLogName(logging.projectId, name);
    this.logging = logging;
    /**
     * @name Log#name
     * @type {string}
     */
    this.name = this.formattedName_.split('/').pop()!;
    // Default to writing to stdout
    this.transport = transport || process.stdout;
  }

  // TODO (nicolezhu) change all comments.
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
  alert(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'ALERT'),
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
  critical(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'CRITICAL'),
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
  debug(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'DEBUG'),
      options! as WriteOptions
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
  emergency(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'EMERGENCY'),
      options as WriteOptions
    );
  }

  entry(metadata?: LogEntry): Entry;
  entry(data?: string | {}): Entry;
  entry(metadata?: LogEntry, data?: string | {}): Entry;
  /**
   * Create an entry object for this log.
   *
   * Using this method will not itself make any API requests. You will use
   * the object returned in other API calls, such as
   * {@link Log#write}.
   *
   * Note, [Cloud Logging Quotas and limits]{@link https://cloud.google.com/logging/quotas}
   * dictates that the maximum log entry size, including all
   * [LogEntry Resource properties]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry},
   * cannot exceed _approximately_ 256 KB.
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
  entry(metadataOrData?: LogEntry | string | {}, data?: string | {}) {
    let metadata: LogEntry;
    if (!data && metadataOrData?.hasOwnProperty('httpRequest')) {
      // If user logs entry(metadata.httpRequest)
      metadata = metadataOrData as LogEntry;
      data = {};
    } else if (!data) {
      // If user logs entry(message)
      data = metadataOrData as string | {};
      metadata = {};
    } else {
      // If user logs entry(metadata, message)
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
  error(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'ERROR'),
      options! as WriteOptions
    );
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
  info(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'INFO'),
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
  notice(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'NOTICE'),
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
  warning(entry: Entry | Entry[], options?: WriteOptions) {
    this.write(
      assignSeverityToEntries(entry, 'WARNING'),
      options as WriteOptions
    );
  }

  /**
   * Write options.
   *
   * @typedef {object} WriteOptions
   * @property {boolean} [dryRun] If true, the request should expect normal
   *     response, but the entries won't be persisted nor exported.
   * @property {object} gaxOptions Request configuration options, outlined here:
   *     https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
   * @property {object[]} labels Labels to set on the log.
   * @property {boolean} [partialSuccess] Whether valid entries should be
   *     written even if some other entries fail due to INVALID_ARGUMENT
   *     or PERMISSION_DENIED errors.
   * @property {object} resource A default monitored resource for entries where
   *     one isn't specified.
   */
  /**
   * Write log entries to Cloud Logging.
   *
   * Note, [Cloud Logging Quotas and limits]{@link https://cloud.google.com/logging/quotas}
   * dictates that the maximum cumulative size of all entries per write,
   * including all [LogEntry Resource properties]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry},
   * cannot exceed _approximately_ 10 MB.
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
  write(entry: Entry | Entry[], opts?: WriteOptions) {
    const options = opts ? (opts as WriteOptions) : {};
    // We expect projectId and resource to be set before this fn is called...
    let structuredEntries: StructuredJson[];
    this.formattedName_ = formatLogName(this.logging.projectId, this.name);
    try {
      structuredEntries = (arrify(entry) as Entry[]).map(entry => {
        if (!(entry instanceof Entry)) {
          entry = this.entry(entry);
        }
        return entry.toStructuredJSON(this.formattedName_);
      });
      for (const entry of structuredEntries) {
        entry.logName = this.formattedName_;
        entry.resource =
          snakecaseKeys(options.resource?.labels) ||
          entry.resource ||
          this.logging.detectedResource;
        entry[LABELS_KEY] = options.labels || entry[LABELS_KEY];
        this.transport.write(JSON.stringify(entry) + '\n');
      }
    } catch (err) {
      // Ignore errors (client libraries do not panic).
    }
  }
}

/**
 * Reference to the {@link Log} class.
 * @name module:@google-cloud/logging.Log
 * @see Log
 */
export {LogSync};
