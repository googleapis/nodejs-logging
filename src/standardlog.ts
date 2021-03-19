// Uses Log methods to do the actual logging

// import {Entry, Log, Logging} from './index';
import {Logging, Log} from '.';
import {Entry, EntryJson, LogEntry} from './entry';

import {ApiResponse, ApiResponseCallback, LogOptions, WriteOptions} from './log';

export enum Severity {
  log,
  info,
  error,
  warn,
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
class StandardLog implements LogSeverityFunctions {
  //  TODO: decide if StandardLog should allow users to have multi logNames
  // formattedName_: string;
  removeCircular_: boolean;
  maxEntrySize?: number;
  logging: Logging;
  logger?: Log;

  constructor(logging: Logging, name: string, opts?: string | LogOptions, stdout?: string) {
    const options = (opts && typeof opts !== 'string') ? opts : {}
    this.removeCircular_ = options.removeCircular === true;
    this.maxEntrySize = options.maxEntrySize;
    this.logging = logging;

    // If exporting to Cloud Logging, StandardLog wraps around Log
    if (!(typeof opts === 'string' || stdout)) {
      console.log("Print to Cloud Logging")
      this.logger = this.logging.log(name);
    }
  }

  log(payload: string | {}, options?: WriteOptions): void;
  log(payload: string | {}, options?: WriteOptions): Promise<ApiResponse>;
  log(payload: string | {}, options: WriteOptions, callback: ApiResponseCallback): void;
  log(payload: string | {}, callback: ApiResponseCallback): void;
  /**
   * Write a log entry with a severity of "DEFAULT".
   *
   * This is a simple wrapper around {@link Log#write} or console.log depending
   * on the user designated log export destination.
   */
  log(
      payload: string | {},
      options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> | void {
    if (this.logger) {
      return this.logger.write(
          this.logging.entry({}, payload),
          options! as WriteOptions
      );
    } else {
      const entry = this.formatJSONLogs_(payload, Severity.log);
      console.log(JSON.stringify(entry));
    }
  }

  info(payload: string | {}, options?: WriteOptions): void;
  info(payload: string | {}, options?: WriteOptions): Promise<ApiResponse>;
  info(payload: string | {}, options: WriteOptions, callback: ApiResponseCallback): void;
  info(payload: string | {}, callback: ApiResponseCallback): void;
  /**
   * Write a log entry with a severity of "INFO".
   *
   * This is a simple wrapper around {@link Log#write} or console.log depending
   * on the user designated log export destination.
   */
  info(
      payload: string | {},
      options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> | void {
    if (this.logger) {
      return this.logger.info(
          this.logging.entry({}, payload),
          options! as WriteOptions
      );
    } else {
      const entry = this.formatJSONLogs_(payload, Severity.info);
      console.log(JSON.stringify(entry));
    }
  }

  error(payload: string | {}, options?: WriteOptions): void;
  error(payload: string | {}, options?: WriteOptions): Promise<ApiResponse>;
  error(payload: string | {}, options: WriteOptions, callback: ApiResponseCallback): void;
  error(payload: string | {}, callback: ApiResponseCallback): void;
  /**
   * Write a log entry with a severity of "ERROR".
   *
   * This is a simple wrapper around {@link Log#write} or console.log depending
   * on the user designated log export destination.
   */
  error(
      payload: string | {},
      options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> | void {
    if (this.logger) {
      return this.logger.error(
          this.logging.entry({}, payload),
          options! as WriteOptions
      );
    } else {
      const entry = this.formatJSONLogs_(payload, Severity.error);
      console.log(JSON.stringify(entry));
    }
  }

  warn(payload: string | {}, options?: WriteOptions): void;
  warn(payload: string | {}, options?: WriteOptions): Promise<ApiResponse>;
  warn(payload: string | {}, options: WriteOptions, callback: ApiResponseCallback): void;
  warn(payload: string | {}, callback: ApiResponseCallback): void;
  /**
   * Write a log entry with a severity of "INFO".
   *
   * This is a simple wrapper around {@link Log#write} or console.log depending
   * on the user designated log export destination.
   */
  warn(
      payload: string | {},
      options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> | void {
    if (this.logger) {
      return this.logger.warning(
          this.logging.entry({}, payload),
          options! as WriteOptions
      );
    } else {
      const entry = this.formatJSONLogs_(payload, Severity.warn);
      console.log(JSON.stringify(entry));
    }
  }

   formatJSONLogs_(payload: string | {}, level: Severity) {
    const severity = ['DEFAULT', 'INFO', 'ERROR', 'WARNING']
    const entry = {
          // Note: the following special fields are extracted from jsonPayload and used to populate logEntry properties
          message: payload,
          severity: severity[level],
          //  TODO: add other special fields once b/181162026 fix propagates
        };
        return entry;
  }
}

export {StandardLog}
