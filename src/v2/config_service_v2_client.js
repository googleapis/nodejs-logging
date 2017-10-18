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

const gapicConfig = require('./config_service_v2_client_config');
const gax = require('google-gax');
const merge = require('lodash.merge');
const path = require('path');

const VERSION = require('../../package.json').version;

/**
 * Service for configuring sinks used to export log entries outside of
 * Stackdriver Logging.
 *
 * @class
 * @memberof v2
 */
class ConfigServiceV2Client {
  /**
   * Construct an instance of ConfigServiceV2Client.
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
        'google/logging/v2/logging_config.proto'
      )
    );

    // This API contains "path templates"; forward-slash-separated
    // identifiers to uniquely identify resources within the API.
    // Create useful helper objects for these.
    this._pathTemplates = {
      projectPathTemplate: new gax.PathTemplate('projects/{project}'),
      sinkPathTemplate: new gax.PathTemplate('projects/{project}/sinks/{sink}'),
      exclusionPathTemplate: new gax.PathTemplate(
        'projects/{project}/exclusions/{exclusion}'
      ),
    };

    // Some of the methods on this service return "paged" results,
    // (e.g. 50 results at a time, with tokens to get subsequent
    // pages). Denote the keys used for pagination and results.
    this._descriptors.page = {
      listSinks: new gax.PageDescriptor('pageToken', 'nextPageToken', 'sinks'),
      listExclusions: new gax.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'exclusions'
      ),
    };

    // Put together the default options sent with requests.
    var defaults = gaxGrpc.constructSettings(
      'google.logging.v2.ConfigServiceV2',
      gapicConfig,
      opts.clientConfig,
      {'x-goog-api-client': clientHeader.join(' ')}
    );

    // Set up a dictionary of "inner API calls"; the core implementation
    // of calling the API is handled in `google-gax`, with this code
    // merely providing the destination and request information.
    this._innerApiCalls = {};

    // Put together the "service stub" for
    // google.logging.v2.ConfigServiceV2.
    var configServiceV2Stub = gaxGrpc.createStub(
      protos.google.logging.v2.ConfigServiceV2,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    var configServiceV2StubMethods = [
      'listSinks',
      'getSink',
      'createSink',
      'updateSink',
      'deleteSink',
      'listExclusions',
      'getExclusion',
      'createExclusion',
      'updateExclusion',
      'deleteExclusion',
    ];
    for (let methodName of configServiceV2StubMethods) {
      this._innerApiCalls[methodName] = gax.createApiCall(
        configServiceV2Stub.then(
          stub =>
            function() {
              var args = Array.prototype.slice.call(arguments, 0);
              return stub[methodName].apply(stub, args);
            }
        ),
        defaults[methodName],
        this._descriptors.page[methodName]
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
   * Lists sinks.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The parent resource whose sinks are to be listed:
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
   *   The second parameter to the callback is Array of [LogSink]{@link google.logging.v2.LogSink}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListSinksResponse]{@link google.logging.v2.ListSinksResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [LogSink]{@link google.logging.v2.LogSink}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [LogSink]{@link google.logging.v2.LogSink} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListSinksResponse]{@link google.logging.v2.ListSinksResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * var formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listSinks({parent: formattedParent})
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
   *     return client.listSinks(nextRequest, options).then(callback);
   *   }
   * }
   * client.listSinks({parent: formattedParent}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listSinks(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.listSinks(request, options, callback);
  }

  /**
   * Equivalent to {@link listSinks}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listSinks} continuously
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
   *   Required. The parent resource whose sinks are to be listed:
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
   *   An object stream which emits an object representing [LogSink]{@link google.logging.v2.LogSink} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedParent = client.projectPath('[PROJECT]');
   * client.listSinksStream({parent: formattedParent})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listSinksStream(request, options) {
    options = options || {};

    return this._descriptors.page.listSinks.createStream(
      this._innerApiCalls.listSinks,
      request,
      options
    );
  }

  /**
   * Gets a sink.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.sinkName
   *   Required. The resource name of the sink:
   *
   *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
   *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
   *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
   *
   *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
   * client.getSink({sinkName: formattedSinkName})
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  getSink(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.getSink(request, options, callback);
  }

  /**
   * Creates a sink that exports specified log entries to a destination.  The
   * export of newly-ingested log entries begins immediately, unless the current
   * time is outside the sink's start and end times or the sink's
   * `writer_identity` is not permitted to write to the destination.  A sink can
   * export log entries only from the resource owning the sink.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The resource in which to create the sink:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   *
   *   Examples: `"projects/my-logging-project"`, `"organizations/123456789"`.
   * @param {Object} request.sink
   *   Required. The new sink, whose `name` parameter is a sink identifier that
   *   is not already in use.
   *
   *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
   * @param {boolean=} request.uniqueWriterIdentity
   *   Optional. Determines the kind of IAM identity returned as `writer_identity`
   *   in the new sink.  If this value is omitted or set to false, and if the
   *   sink's parent is a project, then the value returned as `writer_identity` is
   *   the same group or service account used by Stackdriver Logging before the
   *   addition of writer identities to this API. The sink's destination must be
   *   in the same project as the sink itself.
   *
   *   If this field is set to true, or if the sink is owned by a non-project
   *   resource such as an organization, then the value of `writer_identity` will
   *   be a unique service account used only for exports from the new sink.  For
   *   more information, see `writer_identity` in LogSink.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedParent = client.projectPath('[PROJECT]');
   * var sink = {};
   * var request = {
   *   parent: formattedParent,
   *   sink: sink,
   * };
   * client.createSink(request)
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  createSink(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.createSink(request, options, callback);
  }

  /**
   * Updates a sink.  This method replaces the following fields in the existing
   * sink with values from the new sink: `destination`, `filter`,
   * `output_version_format`, `start_time`, and `end_time`.
   * The updated sink might also have a new `writer_identity`; see the
   * `unique_writer_identity` field.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.sinkName
   *   Required. The full resource name of the sink to update, including the
   *   parent resource and the sink identifier:
   *
   *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
   *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
   *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
   *
   *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
   * @param {Object} request.sink
   *   Required. The updated sink, whose name is the same identifier that appears
   *   as part of `sink_name`.
   *
   *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
   * @param {boolean=} request.uniqueWriterIdentity
   *   Optional. See
   *   [sinks.create](https://cloud.google.com/logging/docs/api/reference/rest/v2/projects.sinks/create)
   *   for a description of this field.  When updating a sink, the effect of this
   *   field on the value of `writer_identity` in the updated sink depends on both
   *   the old and new values of this field:
   *
   *   +   If the old and new values of this field are both false or both true,
   *       then there is no change to the sink's `writer_identity`.
   *   +   If the old value is false and the new value is true, then
   *       `writer_identity` is changed to a unique service account.
   *   +   It is an error if the old value is true and the new value is
   *       set to false or defaulted to false.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogSink]{@link google.logging.v2.LogSink}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
   * var sink = {};
   * var request = {
   *   sinkName: formattedSinkName,
   *   sink: sink,
   * };
   * client.updateSink(request)
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  updateSink(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.updateSink(request, options, callback);
  }

  /**
   * Deletes a sink. If the sink has a unique `writer_identity`, then that
   * service account is also deleted.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.sinkName
   *   Required. The full resource name of the sink to delete, including the
   *   parent resource and the sink identifier:
   *
   *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
   *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
   *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
   *
   *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
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
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
   * client.deleteSink({sinkName: formattedSinkName}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteSink(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.deleteSink(request, options, callback);
  }

  /**
   * Lists all the exclusions in a parent resource.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The parent resource whose exclusions are to be listed.
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
   *   The second parameter to the callback is Array of [LogExclusion]{@link google.logging.v2.LogExclusion}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListExclusionsResponse]{@link google.logging.v2.ListExclusionsResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [LogExclusion]{@link google.logging.v2.LogExclusion}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [LogExclusion]{@link google.logging.v2.LogExclusion} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListExclusionsResponse]{@link google.logging.v2.ListExclusionsResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * var formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listExclusions({parent: formattedParent})
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
   *     return client.listExclusions(nextRequest, options).then(callback);
   *   }
   * }
   * client.listExclusions({parent: formattedParent}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listExclusions(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.listExclusions(request, options, callback);
  }

  /**
   * Equivalent to {@link listExclusions}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listExclusions} continuously
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
   *   Required. The parent resource whose exclusions are to be listed.
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
   *   An object stream which emits an object representing [LogExclusion]{@link google.logging.v2.LogExclusion} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedParent = client.projectPath('[PROJECT]');
   * client.listExclusionsStream({parent: formattedParent})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listExclusionsStream(request, options) {
    options = options || {};

    return this._descriptors.page.listExclusions.createStream(
      this._innerApiCalls.listExclusions,
      request,
      options
    );
  }

  /**
   * Gets the description of an exclusion.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource name of an existing exclusion:
   *
   *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
   *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
   *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
   *
   *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
   * client.getExclusion({name: formattedName})
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  getExclusion(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.getExclusion(request, options, callback);
  }

  /**
   * Creates a new exclusion in a specified parent resource.
   * Only log entries belonging to that resource can be excluded.
   * You can have up to 10 exclusions in a resource.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The parent resource in which to create the exclusion:
   *
   *       "projects/[PROJECT_ID]"
   *       "organizations/[ORGANIZATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]"
   *       "folders/[FOLDER_ID]"
   *
   *   Examples: `"projects/my-logging-project"`, `"organizations/123456789"`.
   * @param {Object} request.exclusion
   *   Required. The new exclusion, whose `name` parameter is an exclusion name
   *   that is not already used in the parent resource.
   *
   *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedParent = client.projectPath('[PROJECT]');
   * var exclusion = {};
   * var request = {
   *   parent: formattedParent,
   *   exclusion: exclusion,
   * };
   * client.createExclusion(request)
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  createExclusion(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.createExclusion(request, options, callback);
  }

  /**
   * Changes one or more properties of an existing exclusion.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource name of the exclusion to update:
   *
   *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
   *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
   *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
   *
   *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
   * @param {Object} request.exclusion
   *   Required. New values for the existing exclusion. Only the fields specified
   *   in `update_mask` are relevant.
   *
   *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
   * @param {Object} request.updateMask
   *   Required. A nonempty list of fields to change in the existing exclusion.
   *   New values for the fields are taken from the corresponding fields in the
   *   LogExclusion included in this request. Fields not mentioned in
   *   `update_mask` are not changed and are ignored in the request.
   *
   *   For example, to change the filter and description of an exclusion,
   *   specify an `update_mask` of `"filter,description"`.
   *
   *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
   * @param {Object=} options
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
   * @param {function(?Error, ?Object)=} callback
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogExclusion]{@link google.logging.v2.LogExclusion}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
   * var exclusion = {};
   * var updateMask = {};
   * var request = {
   *   name: formattedName,
   *   exclusion: exclusion,
   *   updateMask: updateMask,
   * };
   * client.updateExclusion(request)
   *   .then(responses => {
   *     var response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  updateExclusion(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.updateExclusion(request, options, callback);
  }

  /**
   * Deletes an exclusion.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource name of an existing exclusion to delete:
   *
   *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
   *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
   *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
   *
   *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
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
   * var client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
   * client.deleteExclusion({name: formattedName}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteExclusion(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    options = options || {};

    return this._innerApiCalls.deleteExclusion(request, options, callback);
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
   * Return a fully-qualified sink resource name string.
   *
   * @param {String} project
   * @param {String} sink
   * @returns {String}
   */
  sinkPath(project, sink) {
    return this._pathTemplates.sinkPathTemplate.render({
      project: project,
      sink: sink,
    });
  }

  /**
   * Return a fully-qualified exclusion resource name string.
   *
   * @param {String} project
   * @param {String} exclusion
   * @returns {String}
   */
  exclusionPath(project, exclusion) {
    return this._pathTemplates.exclusionPathTemplate.render({
      project: project,
      exclusion: exclusion,
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
   * Parse the sinkName from a sink resource.
   *
   * @param {String} sinkName
   *   A fully-qualified path representing a sink resources.
   * @returns {String} - A string representing the project.
   */
  matchProjectFromSinkName(sinkName) {
    return this._pathTemplates.sinkPathTemplate.match(sinkName).project;
  }

  /**
   * Parse the sinkName from a sink resource.
   *
   * @param {String} sinkName
   *   A fully-qualified path representing a sink resources.
   * @returns {String} - A string representing the sink.
   */
  matchSinkFromSinkName(sinkName) {
    return this._pathTemplates.sinkPathTemplate.match(sinkName).sink;
  }

  /**
   * Parse the exclusionName from a exclusion resource.
   *
   * @param {String} exclusionName
   *   A fully-qualified path representing a exclusion resources.
   * @returns {String} - A string representing the project.
   */
  matchProjectFromExclusionName(exclusionName) {
    return this._pathTemplates.exclusionPathTemplate.match(exclusionName)
      .project;
  }

  /**
   * Parse the exclusionName from a exclusion resource.
   *
   * @param {String} exclusionName
   *   A fully-qualified path representing a exclusion resources.
   * @returns {String} - A string representing the exclusion.
   */
  matchExclusionFromExclusionName(exclusionName) {
    return this._pathTemplates.exclusionPathTemplate.match(exclusionName)
      .exclusion;
  }
}

module.exports = ConfigServiceV2Client;
