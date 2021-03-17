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
  logger?: Log;
  name: string;

  constructor(logging: Logging, name: string, opts?: boolean | LogOptions, stdout?: boolean) {
    const options = (opts && typeof opts !== 'boolean') ? opts : {}
    console.log(options);

    this.formattedName_ = Log.formatName_(logging.projectId, name);
    this.removeCircular_ = options.removeCircular === true;
    this.maxEntrySize = options.maxEntrySize;
    this.logging = logging;
    /**
     * @name Log#name
     * @type {string}
     */
    this.name = this.formattedName_.split('/').pop()!;

    // If writing to Cloud Logging, instantiate
    if (stdout || (typeof opts === 'boolean' && opts)) {
      console.log("print to STDOUT");
      // this.stdout = true;
    } else {
      console.log("Print to Cloud Logging")
      // this.stdout = false;
      this.logger = this.logging.log(name);
    }
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

    // If writing to cloud logging
    if (this.logger) {
      // write() is the step that adds resource & other decorations
      return this.logger.write(
          // TODO put back the resource stuff.
          this.logging.entry({}, payload), // for other severity levels this is easy
          options! as WriteOptions
      );
    } else {
      // If writing to stdout
      // TODO implement the correct entry format...
      // per https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
      // https://cloud.google.com/functions/docs/monitoring/logging#writing_structured_logs
      // 1. log entry basic fields? I have to populate for user
      // 2. resource detection? trace log corr? Hope this gets populated by logging agent in functions env

      // let logentry = this.logging.entry({}, payload);

      // I assume the trace log and other stdout metadata gets added by the agent?
      const entry =
          {
            severity: 'DEFAULT',
            message: payload, // TODO: test what if payload is an obj.
            component: 'arbitrary-property'
          }

      return console.log(JSON.stringify(entry));
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
