// Copyright 2017, Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const gapicConfig = require('./logging_service_v2_client_config');
const gax = require('google-gax');
const merge = require('lodash.merge');
const path = require('path');
const protobuf = require('protobufjs');

const VERSION = require('../../package.json').version;

/**
 * Service for ingesting and querying logs.
 *
 * @class
 * @memberof v2
 */
class LoggingServiceV2Client {
  /**
   * Construct an instance of LoggingServiceV2Client.
   *
   * @param {object=} options - The configuration object. See the subsequent
   *   parameters for more details.
   * @param {object=} options.credentials - Credentials object.
   * @param {string=} options.credentials.client_email
   * @param {string=} options.credentials.private_key
   * @param {string=} options.email - Account email address. Required when
   *   usaing a .pem or .p12 keyFilename.
   * @param {string=} options.keyFilename - Full path to the a .json, .pem, or
   *     .p12 key downloaded from the Google Developers Console. If you provide
   *     a path to a JSON file, the projectId option above is not necessary.
   *     NOTE: .pem and .p12 require you to specify options.email as well.
   * @param {number=} options.port - The port on which to connect to
   *     the remote host.
   * @param {string=} options.projectId - The project ID from the Google
   *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
   *     the environment variable GCLOUD_PROJECT for your project ID. If your
   *     app is running in an environment which supports
   *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
   *     your project ID will be detected automatically.
   * @param {function=} options.promise - Custom promise module to use instead
   *     of native Promises.
   * @param {string=} options.servicePath - The domain name of the
   *     API remote host.
   */
  constructor(opts) {
    this._descriptors = {};

    // Ensure that options include the service address and port.
    opts = Object.assign(
      {
        clientConfig: {},
        port: this.constructor.port,
        servicePath: this.constructor.servicePath,
      },
      opts
    );

    // Create a `gaxGrpc` object, with any grpc-specific options
    // sent to the client.
    opts.scopes = this.constructor.scopes;
    var gaxGrpc = gax.grpc(opts);

    // Save the auth object to the client, for use by other methods.
    this.auth = gaxGrpc.auth;

    // Determine the client header string.
    var clientHeader = [
      `gl-node/${process.version.node}`,
      `grpc/${gaxGrpc.grpcVersion}`,
      `gax/${gax.version}`,
      `gapic/${VERSION}`,
    ];
    if (opts.libName && opts.libVersion) {
      clientHeader.push(`${opts.libName}/${opts.libVersion}`);
    }

    // Load the applicable protos.
    var protos = merge(
      {},
      gaxGrpc.loadProto(
        path.join(__dirname, '..', '..', 'protos'),
        'google/logging/v2/logging.proto'
      )
    );

    // This API contains "path templates"; forward-slash-separated
    // identifiers to uniquely identify resources within the API.
    // Create useful helper objects for these.
    this._pathTemplates = {
      projectPathTemplate: new gax.PathTemplate('projects/{project}'),
      logPathTemplate: new gax.PathTemplate('projects/{project}/logs/{log}'),
    };

    // Some of the methods on this service return "paged" results,
    // (e.g. 50 results at a time, with tokens to get subsequent
    // pages). Denote the keys used for pagination and results.
    this._descriptors.page = {
      listLogEntries: new gax.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'entries'
      ),
      listMonitoredResourceDescriptors: new gax.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'resourceDescriptors'
      ),
      listLogs: new gax.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'logNames'
      ),
    };
    var protoFilesRoot = new gax.grpc.GoogleProtoFilesRoot();
    protoFilesRoot = protobuf.loadSync(
      path.join(
        __dirname,
        '..',
        '..',
        'protos',
        'google/logging/v2/logging.proto'
      ),
      protoFilesRoot
    );

    // Some methods on this API support automatically batching
    // requests; denote this.
    this._descriptors.batching = {
      writeLogEntries: new gax.BundleDescriptor(
        'entries',
        ['logName', 'resource', 'labels'],
        null,
        gax.createByteLengthFunction(
          protoFilesRoot.lookup('google.logging.v2.LogEntry')
        )
      ),
    };

    // Put together the default options sent with requests.
    var defaults = gaxGrpc.constructSettings(
      'google.logging.v2.LoggingServiceV2',
      gapicConfig,
      opts.clientConfig,
      {'x-goog-api-client': clientHeader.join(' ')}
    );

    // Set up a dictionary of "inner API calls"; the core implementation
    // of calling the API is handled in `google-gax`, with this code
    // merely providing the destination and request information.
    this._innerApiCalls = {};

    // Put together the "service stub" for
    // google.logging.v2.LoggingServiceV2.
    var loggingServiceV2Stub = gaxGrpc.createStub(
      protos.google.logging.v2.LoggingServiceV2,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    var loggingServiceV2StubMethods = [
      'deleteLog',
      'writeLogEntries',
      'listLogEntries',
      'listMonitoredResourceDescriptors',
      'listLogs',
    ];
    for (let methodName of loggingServiceV2StubMethods) {
      this._innerApiCalls[methodName] = gax.createApiCall(
        loggingServiceV2Stub.then(
          stub =>
            function() {
              var args = Array.prototype.slice.call(arguments, 0);
              return stub[methodName].apply(stub, args);
            }
        ),
        defaults[methodName],
        this._descriptors.page[methodName] ||
          this._descriptors.batching[methodName]
      );
    }
  }

  /**
   * The DNS address for this API service.
   */
  static get servicePath() {
    return 'logging.googleapis.com';
  }

  /**
   * The port for this API service.
   */
  static get port() {
    return 443;
  }

  /**
   * The scopes needed to make gRPC calls for every method defined
   * in this service.
   */
  static get scopes() {
    return [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloud-platform.read-only',
      'https://www.googleapis.com/auth/logging.admin',
      'https://www.googleapis.com/auth/logging.read',
      'https://www.googleapis.com/auth/logging.write',
    ];
  }

  /**
   * Return the project ID used by this class.
   * @param {function(Error, string)} callback - the callback to
   *   be called with the current project Id.
   */
  getProjectId(callback) {
    return this.auth.getProjectId(callback);
  }

  // -------------------
  // -- Service calls --
  // -------------------

  /**
   * Deletes all the log entries in a log.
   * The log reappears if it receives new entries.
   * Log entries written shortly before the delete operation might not be
   * deleted.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.logName
   *   Required. The resource name of the log to delete:
   *
   *       "projects/[PROJECT_ID]/logs/[LOG_ID]"
   *       "organizations/[ORGANIZATION_ID]/logs/[LOG_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/logs/[LOG_ID]"
   *       "folders/[FOLDER_ID]/logs/[LOG_ID]"
   *
   *   `[LOG_ID]` must be URL-encoded. For example,
   *   `"projects/my-project-id/logs/syslog"`,
   *   `"organizations/1234567890/logs/cloudresourcemanager.googleapis.com%2Factivity"`.
   *   For more information about log names, see
   *   LogEntry.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error)=} callback
   *   The function which will be called with the result of the API call.
   * @returns {Promise} - The promise which resolves when API call finishes.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedLogName = client.logPath('[PROJECT]', '[LOG]');
   * client.deleteLog({logName: formattedLogName}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteLog(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.deleteLog(request, options, callback);
  }

  /**
   * ## Log entry resources
   *
   * Writes log entries to Stackdriver Logging. This API method is the
   * only way to send log entries to Stackdriver Logging. This method
   * is used, directly or indirectly, by the Stackdriver Logging agent
   * (fluentd) and all logging libraries configured to use Stackdriver
   * Logging.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {Object[]} request.entries
   *   Required. The log entries to send to Stackdriver Logging. The order of log
   *   entries in this list does not matter. Values supplied in this method's
   *   `log_name`, `resource`, and `labels` fields are copied into those log
   *   entries in this list that do not include values for their corresponding
   *   fields. For more information, see the LogEntry type.
   *
   *   If the `timestamp` or `insert_id` fields are missing in log entries, then
   *   this method supplies the current time or a unique identifier, respectively.
   *   The supplied values are chosen so that, among the log entries that did not
   *   supply their own values, the entries earlier in the list will sort before
   *   the entries later in the list. See the `entries.list` method.
   *
   *   Log entries with timestamps that are more than the
   *   [logs retention period](https://cloud.google.com/logging/quota-policy) in the past or more than
   *   24 hours in the future might be discarded. Discarding does not return
   *   an error.
   *
   *   To improve throughput and to avoid exceeding the
   *   [quota limit](https://cloud.google.com/logging/quota-policy) for calls to `entries.write`,
   *   you should try to include several log entries in this list,
   *   rather than calling this method for each individual log entry.
   *
   *   This object should have the same structure as [LogEntry]{@link google.logging.v2.LogEntry}
   * @param {string=} request.logName
   *   Optional. A default log resource name that is assigned to all log entries
   *   in `entries` that do not specify a value for `log_name`:
   *
   *       "projects/[PROJECT_ID]/logs/[LOG_ID]"
   *       "organizations/[ORGANIZATION_ID]/logs/[LOG_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/logs/[LOG_ID]"
   *       "folders/[FOLDER_ID]/logs/[LOG_ID]"
   *
   *   `[LOG_ID]` must be URL-encoded. For example,
   *   `"projects/my-project-id/logs/syslog"` or
   *   `"organizations/1234567890/logs/cloudresourcemanager.googleapis.com%2Factivity"`.
   *   For more information about log names, see
   *   LogEntry.
   * @param {Object=} request.resource
   *   Optional. A default monitored resource object that is assigned to all log
   *   entries in `entries` that do not specify a value for `resource`. Example:
   *
   *       { "type": "gce_instance",
   *         "labels": {
   *           "zone": "us-central1-a", "instance_id": "00000000000000000000" }}
   *
   *   See LogEntry.
   *
   *   This object should have the same structure as [MonitoredResource]{@link google.api.MonitoredResource}
   * @param {Object.<string, string>=} request.labels
   *   Optional. Default labels that are added to the `labels` field of all log
   *   entries in `entries`. If a log entry already has a label with the same key
   *   as a label in this parameter, then the log entry's label is not changed.
   *   See LogEntry.
   * @param {boolean=} request.partialSuccess
   *   Optional. Whether valid entries should be written even if some other
   *   entries fail due to INVALID_ARGUMENT or PERMISSION_DENIED errors. If any
   *   entry is not written, then the response status is the error associated
   *   with one of the failed entries and the response includes error details
   *   keyed by the entries' zero-based index in the `entries.write` method.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [WriteLogEntriesResponse]{@link google.logging.v2.WriteLogEntriesResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [WriteLogEntriesResponse]{@link google.logging.v2.WriteLogEntriesResponse}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var entries = [];
   * client.writeLogEntries({entries: entries})
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  writeLogEntries(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.writeLogEntries(request, options, callback);
  }

  /**
   * Lists log entries.  Use this method to retrieve log entries from
   * Stackdriver Logging.  For ways to export log entries, see
   * [Exporting Logs](https://cloud.google.com/logging/docs/export).
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string[]} request.resourceNames
   *   Required. Names of one or more parent resources from which to
   *   retrieve log entries:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   *
   *   Projects listed in the `project_ids` field are added to this list.
   * @param {string[]} request.projectIds
   *   Deprecated. Use `resource_names` instead.  One or more project identifiers
   *   or project numbers from which to retrieve log entries.  Example:
   *   `"my-project-1A"`. If present, these project identifiers are converted to
   *   resource name format and added to the list of resources in
   *   `resource_names`.
   * @param {string=} request.filter
   *   Optional. A filter that chooses which log entries to return.  See [Advanced
   *   Logs Filters](https://cloud.google.com/logging/docs/view/advanced_filters).  Only log entries that
   *   match the filter are returned.  An empty filter matches all log entries in
   *   the resources listed in `resource_names`. Referencing a parent resource
   *   that is not listed in `resource_names` will cause the filter to return no
   *   results.
   *   The maximum length of the filter is 20000 characters.
   * @param {string=} request.orderBy
   *   Optional. How the results should be sorted.  Presently, the only permitted
   *   values are `"timestamp asc"` (default) and `"timestamp desc"`. The first
   *   option returns entries in order of increasing values of
   *   `LogEntry.timestamp` (oldest first), and the second option returns entries
   *   in order of decreasing timestamps (newest first).  Entries with equal
   *   timestamps are returned in order of their `insert_id` values.
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is Array of [LogEntry]{@link google.logging.v2.LogEntry}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListLogEntriesResponse]{@link google.logging.v2.ListLogEntriesResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [LogEntry]{@link google.logging.v2.LogEntry}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [LogEntry]{@link google.logging.v2.LogEntry} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListLogEntriesResponse]{@link google.logging.v2.ListLogEntriesResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * var resourceNames = [];
   *
   * client.listLogEntries({resourceNames: resourceNames})
   *   .then(responses => {
   *     var resources = responses[0];
   *     for (let i = 0; i < resources.length; i += 1) {
   *       // doThingsWith(resources[i])
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   * var resourceNames = [];
   *
   *
   * var options = {autoPaginate: false};
   * var callback = responses => {
   *   // The actual resources in a response.
   *   var resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   var nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // var rawResponse = responses[2];
   *   for (let i = 0; i < resources.length; i += 1) {
   *     // doThingsWith(resources[i]);
   *   }
   *   if (nextRequest) {
   *     // Fetch the next page.
   *     return client.listLogEntries(nextRequest, options).then(callback);
   *   }
   * }
   * client.listLogEntries({resourceNames: resourceNames}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listLogEntries(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.listLogEntries(request, options, callback);
  }

  /**
   * Equivalent to {@link listLogEntries}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listLogEntries} continuously
   * and invokes the callback registered for 'data' event for each element in the
   * responses.
   *
   * The returned object has 'end' method when no more elements are required.
   *
   * autoPaginate option will be ignored.
   *
   * @see {@link https://nodejs.org/api/stream.html}
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string[]} request.resourceNames
   *   Required. Names of one or more parent resources from which to
   *   retrieve log entries:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   *
   *   Projects listed in the `project_ids` field are added to this list.
   * @param {string[]} request.projectIds
   *   Deprecated. Use `resource_names` instead.  One or more project identifiers
   *   or project numbers from which to retrieve log entries.  Example:
   *   `"my-project-1A"`. If present, these project identifiers are converted to
   *   resource name format and added to the list of resources in
   *   `resource_names`.
   * @param {string=} request.filter
   *   Optional. A filter that chooses which log entries to return.  See [Advanced
   *   Logs Filters](https://cloud.google.com/logging/docs/view/advanced_filters).  Only log entries that
   *   match the filter are returned.  An empty filter matches all log entries in
   *   the resources listed in `resource_names`. Referencing a parent resource
   *   that is not listed in `resource_names` will cause the filter to return no
   *   results.
   *   The maximum length of the filter is 20000 characters.
   * @param {string=} request.orderBy
   *   Optional. How the results should be sorted.  Presently, the only permitted
   *   values are `"timestamp asc"` (default) and `"timestamp desc"`. The first
   *   option returns entries in order of increasing values of
   *   `LogEntry.timestamp` (oldest first), and the second option returns entries
   *   in order of decreasing timestamps (newest first).  Entries with equal
   *   timestamps are returned in order of their `insert_id` values.
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @returns {Stream}
   *   An object stream which emits an object representing [LogEntry]{@link google.logging.v2.LogEntry} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var resourceNames = [];
   * client.listLogEntriesStream({resourceNames: resourceNames})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listLogEntriesStream(request, options) {
    options = options || {};

    return this._descriptors.page.listLogEntries.createStream(
      this._innerApiCalls.listLogEntries,
      request,
      options
    );
  }

  /**
   * Lists the descriptors for monitored resource types used by Stackdriver
   * Logging.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is Array of [MonitoredResourceDescriptor]{@link google.api.MonitoredResourceDescriptor}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListMonitoredResourceDescriptorsResponse]{@link google.logging.v2.ListMonitoredResourceDescriptorsResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [MonitoredResourceDescriptor]{@link google.api.MonitoredResourceDescriptor}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [MonitoredResourceDescriptor]{@link google.api.MonitoredResourceDescriptor} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListMonitoredResourceDescriptorsResponse]{@link google.logging.v2.ListMonitoredResourceDescriptorsResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * client.listMonitoredResourceDescriptors({})
   *   .then(responses => {
   *     var resources = responses[0];
   *     for (let i = 0; i < resources.length; i += 1) {
   *       // doThingsWith(resources[i])
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   *
   * var options = {autoPaginate: false};
   * var callback = responses => {
   *   // The actual resources in a response.
   *   var resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   var nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // var rawResponse = responses[2];
   *   for (let i = 0; i < resources.length; i += 1) {
   *     // doThingsWith(resources[i]);
   *   }
   *   if (nextRequest) {
   *     // Fetch the next page.
   *     return client.listMonitoredResourceDescriptors(nextRequest, options).then(callback);
   *   }
   * }
   * client.listMonitoredResourceDescriptors({}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listMonitoredResourceDescriptors(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.listMonitoredResourceDescriptors(
      request,
      options,
      callback
    );
  }

  /**
   * Equivalent to {@link listMonitoredResourceDescriptors}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listMonitoredResourceDescriptors} continuously
   * and invokes the callback registered for 'data' event for each element in the
   * responses.
   *
   * The returned object has 'end' method when no more elements are required.
   *
   * autoPaginate option will be ignored.
   *
   * @see {@link https://nodejs.org/api/stream.html}
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @returns {Stream}
   *   An object stream which emits an object representing [MonitoredResourceDescriptor]{@link google.api.MonitoredResourceDescriptor} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   *
   * client.listMonitoredResourceDescriptorsStream({})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listMonitoredResourceDescriptorsStream(request, options) {
    options = options || {};

    return this._descriptors.page.listMonitoredResourceDescriptors.createStream(
      this._innerApiCalls.listMonitoredResourceDescriptors,
      request,
      options
    );
  }

  /**
   * Lists the logs in projects, organizations, folders, or billing accounts.
   * Only logs that have entries are listed.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The resource name that owns the logs:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is Array of string.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListLogsResponse]{@link google.logging.v2.ListLogsResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of string.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of string in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListLogsResponse]{@link google.logging.v2.ListLogsResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * var formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listLogs({parent: formattedParent})
   *   .then(responses => {
   *     var resources = responses[0];
   *     for (let i = 0; i < resources.length; i += 1) {
   *       // doThingsWith(resources[i])
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   * var formattedParent = client.projectPath('[PROJECT]');
   *
   *
   * var options = {autoPaginate: false};
   * var callback = responses => {
   *   // The actual resources in a response.
   *   var resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   var nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // var rawResponse = responses[2];
   *   for (let i = 0; i < resources.length; i += 1) {
   *     // doThingsWith(resources[i]);
   *   }
   *   if (nextRequest) {
   *     // Fetch the next page.
   *     return client.listLogs(nextRequest, options).then(callback);
   *   }
   * }
   * client.listLogs({parent: formattedParent}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listLogs(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.listLogs(request, options, callback);
  }

  /**
   * Equivalent to {@link listLogs}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listLogs} continuously
   * and invokes the callback registered for 'data' event for each element in the
   * responses.
   *
   * The returned object has 'end' method when no more elements are required.
   *
   * autoPaginate option will be ignored.
   *
   * @see {@link https://nodejs.org/api/stream.html}
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The resource name that owns the logs:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   * @param {number=} request.pageSize
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @returns {Stream}
   *   An object stream which emits a string on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.LoggingServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedParent = client.projectPath('[PROJECT]');
   * client.listLogsStream({parent: formattedParent})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listLogsStream(request, options) {
    options = options || {};

    return this._descriptors.page.listLogs.createStream(
      this._innerApiCalls.listLogs,
      request,
      options
    );
  }

  // --------------------
  // -- Path templates --
  // --------------------

  /**
   * Return a fully-qualified project resource name string.
   *
   * @param {String} project
   * @returns {String}
   */
  projectPath(project) {
    return this._pathTemplates.projectPathTemplate.render({
      project: project,
    });
  }

  /**
   * Return a fully-qualified log resource name string.
   *
   * @param {String} project
   * @param {String} log
   * @returns {String}
   */
  logPath(project, log) {
    return this._pathTemplates.logPathTemplate.render({
      project: project,
      log: log,
    });
  }

  /**
   * Parse the projectName from a project resource.
   *
   * @param {String} projectName
   *   A fully-qualified path representing a project resources.
   * @returns {String} - A string representing the project.
   */
  matchProjectFromProjectName(projectName) {
    return this._pathTemplates.projectPathTemplate.match(projectName).project;
  }

  /**
   * Parse the logName from a log resource.
   *
   * @param {String} logName
   *   A fully-qualified path representing a log resources.
   * @returns {String} - A string representing the project.
   */
  matchProjectFromLogName(logName) {
    return this._pathTemplates.logPathTemplate.match(logName).project;
  }

  /**
   * Parse the logName from a log resource.
   *
   * @param {String} logName
   *   A fully-qualified path representing a log resources.
   * @returns {String} - A string representing the log.
   */
  matchLogFromLogName(logName) {
    return this._pathTemplates.logPathTemplate.match(logName).log;
  }
}

module.exports = LoggingServiceV2Client;
