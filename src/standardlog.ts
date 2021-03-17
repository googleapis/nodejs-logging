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
  formattedName_: string;
  removeCircular_: boolean;
  maxEntrySize?: number;
  logging: Logging;
  name: string;
  stdout: boolean; // tracks if logs should export to stdout

  constructor(logging: Logging, name: string, opts?: boolean | LogOptions, stdout?: boolean) {
    const options = (opts && typeof opts !== 'boolean') ? opts : {}
    console.log(options);

    if (stdout || (typeof opts === 'boolean' && opts)) {
      console.log("print to STDOUT");
      this.stdout = true;
    } else {
      console.log("Print to Cloud Logging")
      this.stdout = false;
    }
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

  log(payload: string | {}, options?: WriteOptions): Promise<ApiResponse>;
  log(payload: string | {}, options: WriteOptions, callback: ApiResponseCallback): void;
  log(payload: string | {}, callback: ApiResponseCallback): void;
  /**
   * TODO: rewrite the comments
   * Write a log entry with a severity of "DEFAULT".
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
  log(
      payload: string | {},
      options?: WriteOptions | ApiResponseCallback
  ): Promise<ApiResponse> | void {

    if (this.stdout) {
      return console.log("Success: printing to console.log");
    } else {
      //TODO is there a better way of calling this...
      return this.logging.log('logname').write(
          this.logging.entry({}, payload),
          options! as WriteOptions
      );
    }

  }




  info() {
  }
  error() {

  }
  warn(){

  }

}

export {StandardLog}
