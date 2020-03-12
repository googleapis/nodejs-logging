// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const gapicConfig = require('./config_service_v2_client_config.json');
const gax = require('google-gax');
const path = require('path');

const VERSION = require('../../../package.json').version;

/**
 * Service for configuring sinks used to route log entries.
 *
 * @class
 * @memberof v2
 */
class ConfigServiceV2Client {
  /**
   * Construct an instance of ConfigServiceV2Client.
   *
   * @param {object} [options] - The configuration object. See the subsequent
   *   parameters for more details.
   * @param {object} [options.credentials] - Credentials object.
   * @param {string} [options.credentials.client_email]
   * @param {string} [options.credentials.private_key]
   * @param {string} [options.email] - Account email address. Required when
   *     using a .pem or .p12 keyFilename.
   * @param {string} [options.keyFilename] - Full path to the a .json, .pem, or
   *     .p12 key downloaded from the Google Developers Console. If you provide
   *     a path to a JSON file, the projectId option below is not necessary.
   *     NOTE: .pem and .p12 require you to specify options.email as well.
   * @param {number} [options.port] - The port on which to connect to
   *     the remote host.
   * @param {string} [options.projectId] - The project ID from the Google
   *     Developer's Console, e.g. 'grape-spaceship-123'. We will also check
   *     the environment variable GCLOUD_PROJECT for your project ID. If your
   *     app is running in an environment which supports
   *     {@link https://developers.google.com/identity/protocols/application-default-credentials Application Default Credentials},
   *     your project ID will be detected automatically.
   * @param {function} [options.promise] - Custom promise module to use instead
   *     of native Promises.
   * @param {string} [options.apiEndpoint] - The domain name of the
   *     API remote host.
   */
  constructor(opts) {
    opts = opts || {};
    this._descriptors = {};

    if (global.isBrowser) {
      // If we're in browser, we use gRPC fallback.
      opts.fallback = true;
    }

    // If we are in browser, we are already using fallback because of the
    // "browser" field in package.json.
    // But if we were explicitly requested to use fallback, let's do it now.
    const gaxModule = !global.isBrowser && opts.fallback ? gax.fallback : gax;

    const servicePath =
      opts.servicePath || opts.apiEndpoint || this.constructor.servicePath;

    // Ensure that options include the service address and port.
    opts = Object.assign(
      {
        clientConfig: {},
        port: this.constructor.port,
        servicePath,
      },
      opts
    );

    // Create a `gaxGrpc` object, with any grpc-specific options
    // sent to the client.
    opts.scopes = this.constructor.scopes;
    const gaxGrpc = new gaxModule.GrpcClient(opts);

    // Save the auth object to the client, for use by other methods.
    this.auth = gaxGrpc.auth;

    // Determine the client header string.
    const clientHeader = [];

    if (typeof process !== 'undefined' && 'versions' in process) {
      clientHeader.push(`gl-node/${process.versions.node}`);
    }
    clientHeader.push(`gax/${gaxModule.version}`);
    if (opts.fallback) {
      clientHeader.push(`gl-web/${gaxModule.version}`);
    } else {
      clientHeader.push(`grpc/${gaxGrpc.grpcVersion}`);
    }
    clientHeader.push(`gapic/${VERSION}`);
    if (opts.libName && opts.libVersion) {
      clientHeader.push(`${opts.libName}/${opts.libVersion}`);
    }

    // Load the applicable protos.
    // For Node.js, pass the path to JSON proto file.
    // For browsers, pass the JSON content.

    const nodejsProtoPath = path.join(
      __dirname,
      '..',
      '..',
      'protos',
      'protos.json'
    );
    const protos = gaxGrpc.loadProto(
      opts.fallback ? require('../../protos/protos.json') : nodejsProtoPath
    );

    // This API contains "path templates"; forward-slash-separated
    // identifiers to uniquely identify resources within the API.
    // Create useful helper objects for these.
    this._pathTemplates = {
      billingAccountPathTemplate: new gaxModule.PathTemplate(
        'billingAccounts/{billing_account}'
      ),
      folderPathTemplate: new gaxModule.PathTemplate('folders/{folder}'),
      organizationPathTemplate: new gaxModule.PathTemplate(
        'organizations/{organization}'
      ),
      projectPathTemplate: new gaxModule.PathTemplate('projects/{project}'),
    };

    // Some of the methods on this service return "paged" results,
    // (e.g. 50 results at a time, with tokens to get subsequent
    // pages). Denote the keys used for pagination and results.
    this._descriptors.page = {
      listBuckets: new gaxModule.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'buckets'
      ),
      listSinks: new gaxModule.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'sinks'
      ),
      listExclusions: new gaxModule.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'exclusions'
      ),
    };

    // Put together the default options sent with requests.
    const defaults = gaxGrpc.constructSettings(
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
    const configServiceV2Stub = gaxGrpc.createStub(
      opts.fallback
        ? protos.lookupService('google.logging.v2.ConfigServiceV2')
        : protos.google.logging.v2.ConfigServiceV2,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    const configServiceV2StubMethods = [
      'listBuckets',
      'getBucket',
      'updateBucket',
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
      'getCmekSettings',
      'updateCmekSettings',
    ];
    for (const methodName of configServiceV2StubMethods) {
      const innerCallPromise = configServiceV2Stub.then(
        stub => (...args) => {
          return stub[methodName].apply(stub, args);
        },
        err => () => {
          throw err;
        }
      );
      this._innerApiCalls[methodName] = gaxModule.createApiCall(
        innerCallPromise,
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
   * The DNS address for this API service - same as servicePath(),
   * exists for compatibility reasons.
   */
  static get apiEndpoint() {
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
   * Lists buckets (Beta).
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The parent resource whose buckets are to be listed:
   *
   *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]"
   *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]"
   *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]"
   *
   *   Note: The locations portion of the resource must be specified, but
   *   supplying the character `-` in place of [LOCATION_ID] will return all
   *   buckets.
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is Array of [LogBucket]{@link google.logging.v2.LogBucket}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListBucketsResponse]{@link google.logging.v2.ListBucketsResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [LogBucket]{@link google.logging.v2.LogBucket}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [LogBucket]{@link google.logging.v2.LogBucket} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListBucketsResponse]{@link google.logging.v2.ListBucketsResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * const parent = '';
   *
   * client.listBuckets({parent: parent})
   *   .then(responses => {
   *     const resources = responses[0];
   *     for (const resource of resources) {
   *       // doThingsWith(resource)
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   * const parent = '';
   *
   *
   * const options = {autoPaginate: false};
   * const callback = responses => {
   *   // The actual resources in a response.
   *   const resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   const nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // const rawResponse = responses[2];
   *   for (const resource of resources) {
   *     // doThingsWith(resource);
   *   }
   *   if (nextRequest) {
   *     // Fetch the next page.
   *     return client.listBuckets(nextRequest, options).then(callback);
   *   }
   * }
   * client.listBuckets({parent: parent}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listBuckets(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      parent: request.parent,
    });

    return this._innerApiCalls.listBuckets(request, options, callback);
  }

  /**
   * Equivalent to {@link listBuckets}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listBuckets} continuously
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
   *   Required. The parent resource whose buckets are to be listed:
   *
   *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]"
   *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]"
   *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]"
   *
   *   Note: The locations portion of the resource must be specified, but
   *   supplying the character `-` in place of [LOCATION_ID] will return all
   *   buckets.
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @returns {Stream}
   *   An object stream which emits an object representing [LogBucket]{@link google.logging.v2.LogBucket} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const parent = '';
   * client.listBucketsStream({parent: parent})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listBucketsStream(request, options) {
    options = options || {};

    return this._descriptors.page.listBuckets.createStream(
      this._innerApiCalls.listBuckets,
      request,
      options
    );
  }

  /**
   * Gets a bucket (Beta).
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource name of the bucket:
   *
   *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *
   *   Example:
   *   `"projects/my-project-id/locations/my-location/buckets/my-bucket-id"`.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogBucket]{@link google.logging.v2.LogBucket}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogBucket]{@link google.logging.v2.LogBucket}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * client.getBucket({name: name})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  getBucket(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

    return this._innerApiCalls.getBucket(request, options, callback);
  }

  /**
   * Updates a bucket. This method replaces the following fields in the
   * existing bucket with values from the new bucket: `retention_period`
   *
   * If the retention period is decreased and the bucket is locked,
   * FAILED_PRECONDITION will be returned.
   *
   * If the bucket has a LifecycleState of DELETE_REQUESTED, FAILED_PRECONDITION
   * will be returned.
   *
   * A buckets region may not be modified after it is created.
   * This method is in Beta.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The full resource name of the bucket to update.
   *
   *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
   *
   *   Example:
   *   `"projects/my-project-id/locations/my-location/buckets/my-bucket-id"`. Also
   *   requires permission "resourcemanager.projects.updateLiens" to set the
   *   locked property
   * @param {Object} request.bucket
   *   Required. The updated bucket.
   *
   *   This object should have the same structure as [LogBucket]{@link google.logging.v2.LogBucket}
   * @param {Object} request.updateMask
   *   Required. Field mask that specifies the fields in `bucket` that need an update. A
   *   bucket field will be overwritten if, and only if, it is in the update
   *   mask. `name` and output only fields cannot be updated.
   *
   *   For a detailed `FieldMask` definition, see
   *   https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.FieldMask
   *
   *   Example: `updateMask=retention_days`.
   *
   *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogBucket]{@link google.logging.v2.LogBucket}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogBucket]{@link google.logging.v2.LogBucket}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * const bucket = {};
   * const updateMask = {};
   * const request = {
   *   name: name,
   *   bucket: bucket,
   *   updateMask: updateMask,
   * };
   * client.updateBucket(request)
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  updateBucket(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

    return this._innerApiCalls.updateBucket(request, options, callback);
  }

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
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * const formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listSinks({parent: formattedParent})
   *   .then(responses => {
   *     const resources = responses[0];
   *     for (const resource of resources) {
   *       // doThingsWith(resource)
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   * const formattedParent = client.projectPath('[PROJECT]');
   *
   *
   * const options = {autoPaginate: false};
   * const callback = responses => {
   *   // The actual resources in a response.
   *   const resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   const nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // const rawResponse = responses[2];
   *   for (const resource of resources) {
   *     // doThingsWith(resource);
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      parent: request.parent,
    });

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
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @returns {Stream}
   *   An object stream which emits an object representing [LogSink]{@link google.logging.v2.LogSink} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
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
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const sinkName = '';
   * client.getSink({sinkName: sinkName})
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      sink_name: request.sinkName,
    });

    return this._innerApiCalls.getSink(request, options, callback);
  }

  /**
   * Creates a sink that exports specified log entries to a destination. The
   * export of newly-ingested log entries begins immediately, unless the sink's
   * `writer_identity` is not permitted to write to the destination. A sink can
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
   * @param {boolean} [request.uniqueWriterIdentity]
   *   Optional. Determines the kind of IAM identity returned as `writer_identity`
   *   in the new sink. If this value is omitted or set to false, and if the
   *   sink's parent is a project, then the value returned as `writer_identity` is
   *   the same group or service account used by Logging before the addition of
   *   writer identities to this API. The sink's destination must be in the same
   *   project as the sink itself.
   *
   *   If this field is set to true, or if the sink is owned by a non-project
   *   resource such as an organization, then the value of `writer_identity` will
   *   be a unique service account used only for exports from the new sink. For
   *   more information, see `writer_identity` in LogSink.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
   * const sink = {};
   * const request = {
   *   parent: formattedParent,
   *   sink: sink,
   * };
   * client.createSink(request)
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      parent: request.parent,
    });

    return this._innerApiCalls.createSink(request, options, callback);
  }

  /**
   * Updates a sink. This method replaces the following fields in the existing
   * sink with values from the new sink: `destination`, and `filter`.
   *
   * The updated sink might also have a new `writer_identity`; see the
   * `unique_writer_identity` field.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.sinkName
   *   Required. The full resource name of the sink to update, including the parent
   *   resource and the sink identifier:
   *
   *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
   *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
   *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
   *
   *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
   * @param {Object} request.sink
   *   Required. The updated sink, whose name is the same identifier that appears as part
   *   of `sink_name`.
   *
   *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
   * @param {boolean} [request.uniqueWriterIdentity]
   *   Optional. See sinks.create
   *   for a description of this field. When updating a sink, the effect of this
   *   field on the value of `writer_identity` in the updated sink depends on both
   *   the old and new values of this field:
   *
   *   +   If the old and new values of this field are both false or both true,
   *       then there is no change to the sink's `writer_identity`.
   *   +   If the old value is false and the new value is true, then
   *       `writer_identity` is changed to a unique service account.
   *   +   It is an error if the old value is true and the new value is
   *       set to false or defaulted to false.
   * @param {Object} [request.updateMask]
   *   Optional. Field mask that specifies the fields in `sink` that need
   *   an update. A sink field will be overwritten if, and only if, it is
   *   in the update mask. `name` and output only fields cannot be updated.
   *
   *   An empty updateMask is temporarily treated as using the following mask
   *   for backwards compatibility purposes:
   *     destination,filter,includeChildren
   *   At some point in the future, behavior will be removed and specifying an
   *   empty updateMask will be an error.
   *
   *   For a detailed `FieldMask` definition, see
   *   https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.FieldMask
   *
   *   Example: `updateMask=filter`.
   *
   *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const sinkName = '';
   * const sink = {};
   * const request = {
   *   sinkName: sinkName,
   *   sink: sink,
   * };
   * client.updateSink(request)
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      sink_name: request.sinkName,
    });

    return this._innerApiCalls.updateSink(request, options, callback);
  }

  /**
   * Deletes a sink. If the sink has a unique `writer_identity`, then that
   * service account is also deleted.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.sinkName
   *   Required. The full resource name of the sink to delete, including the parent
   *   resource and the sink identifier:
   *
   *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
   *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
   *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
   *
   *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error)} [callback]
   *   The function which will be called with the result of the API call.
   * @returns {Promise} - The promise which resolves when API call finishes.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const sinkName = '';
   * client.deleteSink({sinkName: sinkName}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteSink(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      sink_name: request.sinkName,
    });

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
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Array, ?Object, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * const formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listExclusions({parent: formattedParent})
   *   .then(responses => {
   *     const resources = responses[0];
   *     for (const resource of resources) {
   *       // doThingsWith(resource)
   *     }
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   *
   * // Or obtain the paged response.
   * const formattedParent = client.projectPath('[PROJECT]');
   *
   *
   * const options = {autoPaginate: false};
   * const callback = responses => {
   *   // The actual resources in a response.
   *   const resources = responses[0];
   *   // The next request if the response shows that there are more responses.
   *   const nextRequest = responses[1];
   *   // The actual response object, if necessary.
   *   // const rawResponse = responses[2];
   *   for (const resource of resources) {
   *     // doThingsWith(resource);
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      parent: request.parent,
    });

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
   * @param {number} [request.pageSize]
   *   The maximum number of resources contained in the underlying API
   *   response. If page streaming is performed per-resource, this
   *   parameter does not affect the return value. If page streaming is
   *   performed per-page, this determines the maximum number of
   *   resources in a page.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @returns {Stream}
   *   An object stream which emits an object representing [LogExclusion]{@link google.logging.v2.LogExclusion} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
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
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * client.getExclusion({name: name})
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

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
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
   * const exclusion = {};
   * const request = {
   *   parent: formattedParent,
   *   exclusion: exclusion,
   * };
   * client.createExclusion(request)
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      parent: request.parent,
    });

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
   *   Required. New values for the existing exclusion. Only the fields specified in
   *   `update_mask` are relevant.
   *
   *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
   * @param {Object} request.updateMask
   *   Required. A non-empty list of fields to change in the existing exclusion. New values
   *   for the fields are taken from the corresponding fields in the
   *   LogExclusion included in this request. Fields not mentioned in
   *   `update_mask` are not changed and are ignored in the request.
   *
   *   For example, to change the filter and description of an exclusion,
   *   specify an `update_mask` of `"filter,description"`.
   *
   *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
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
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * const exclusion = {};
   * const updateMask = {};
   * const request = {
   *   name: name,
   *   exclusion: exclusion,
   *   updateMask: updateMask,
   * };
   * client.updateExclusion(request)
   *   .then(responses => {
   *     const response = responses[0];
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
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

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
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error)} [callback]
   *   The function which will be called with the result of the API call.
   * @returns {Promise} - The promise which resolves when API call finishes.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * client.deleteExclusion({name: name}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteExclusion(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

    return this._innerApiCalls.deleteExclusion(request, options, callback);
  }

  /**
   * Gets the Logs Router CMEK settings for the given resource.
   *
   * Note: CMEK for the Logs Router can currently only be configured for GCP
   * organizations. Once configured, it applies to all projects and folders in
   * the GCP organization.
   *
   * See [Enabling CMEK for Logs
   * Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource for which to retrieve CMEK settings.
   *
   *       "projects/[PROJECT_ID]/cmekSettings"
   *       "organizations/[ORGANIZATION_ID]/cmekSettings"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/cmekSettings"
   *       "folders/[FOLDER_ID]/cmekSettings"
   *
   *   Example: `"organizations/12345/cmekSettings"`.
   *
   *   Note: CMEK for the Logs Router can currently only be configured for GCP
   *   organizations. Once configured, it applies to all projects and folders in
   *   the GCP organization.
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [CmekSettings]{@link google.logging.v2.CmekSettings}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [CmekSettings]{@link google.logging.v2.CmekSettings}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * client.getCmekSettings({name: name})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  getCmekSettings(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

    return this._innerApiCalls.getCmekSettings(request, options, callback);
  }

  /**
   * Updates the Logs Router CMEK settings for the given resource.
   *
   * Note: CMEK for the Logs Router can currently only be configured for GCP
   * organizations. Once configured, it applies to all projects and folders in
   * the GCP organization.
   *
   * UpdateCmekSettings
   * will fail if 1) `kms_key_name` is invalid, or 2) the associated service
   * account does not have the required
   * `roles/cloudkms.cryptoKeyEncrypterDecrypter` role assigned for the key, or
   * 3) access to the key is disabled.
   *
   * See [Enabling CMEK for Logs
   * Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.name
   *   Required. The resource name for the CMEK settings to update.
   *
   *       "projects/[PROJECT_ID]/cmekSettings"
   *       "organizations/[ORGANIZATION_ID]/cmekSettings"
   *       "billingAccounts/[BILLING_ACCOUNT_ID]/cmekSettings"
   *       "folders/[FOLDER_ID]/cmekSettings"
   *
   *   Example: `"organizations/12345/cmekSettings"`.
   *
   *   Note: CMEK for the Logs Router can currently only be configured for GCP
   *   organizations. Once configured, it applies to all projects and folders in
   *   the GCP organization.
   * @param {Object} request.cmekSettings
   *   Required. The CMEK settings to update.
   *
   *   See [Enabling CMEK for Logs
   *   Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
   *
   *   This object should have the same structure as [CmekSettings]{@link google.logging.v2.CmekSettings}
   * @param {Object} [request.updateMask]
   *   Optional. Field mask identifying which fields from `cmek_settings` should
   *   be updated. A field will be overwritten if and only if it is in the update
   *   mask. Output only fields cannot be updated.
   *
   *   See FieldMask for more information.
   *
   *   Example: `"updateMask=kmsKeyName"`
   *
   *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [CmekSettings]{@link google.logging.v2.CmekSettings}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [CmekSettings]{@link google.logging.v2.CmekSettings}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.ConfigServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const name = '';
   * const cmekSettings = {};
   * const request = {
   *   name: name,
   *   cmekSettings: cmekSettings,
   * };
   * client.updateCmekSettings(request)
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  updateCmekSettings(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers[
      'x-goog-request-params'
    ] = gax.routingHeader.fromParams({
      name: request.name,
    });

    return this._innerApiCalls.updateCmekSettings(request, options, callback);
  }

  // --------------------
  // -- Path templates --
  // --------------------

  /**
   * Return a fully-qualified billing_account resource name string.
   *
   * @param {String} billingAccount
   * @returns {String}
   */
  billingAccountPath(billingAccount) {
    return this._pathTemplates.billingAccountPathTemplate.render({
      billing_account: billingAccount,
    });
  }

  /**
   * Return a fully-qualified folder resource name string.
   *
   * @param {String} folder
   * @returns {String}
   */
  folderPath(folder) {
    return this._pathTemplates.folderPathTemplate.render({
      folder: folder,
    });
  }

  /**
   * Return a fully-qualified organization resource name string.
   *
   * @param {String} organization
   * @returns {String}
   */
  organizationPath(organization) {
    return this._pathTemplates.organizationPathTemplate.render({
      organization: organization,
    });
  }

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
   * Parse the billingAccountName from a billing_account resource.
   *
   * @param {String} billingAccountName
   *   A fully-qualified path representing a billing_account resources.
   * @returns {String} - A string representing the billing_account.
   */
  matchBillingAccountFromBillingAccountName(billingAccountName) {
    return this._pathTemplates.billingAccountPathTemplate.match(
      billingAccountName
    ).billing_account;
  }

  /**
   * Parse the folderName from a folder resource.
   *
   * @param {String} folderName
   *   A fully-qualified path representing a folder resources.
   * @returns {String} - A string representing the folder.
   */
  matchFolderFromFolderName(folderName) {
    return this._pathTemplates.folderPathTemplate.match(folderName).folder;
  }

  /**
   * Parse the organizationName from a organization resource.
   *
   * @param {String} organizationName
   *   A fully-qualified path representing a organization resources.
   * @returns {String} - A string representing the organization.
   */
  matchOrganizationFromOrganizationName(organizationName) {
    return this._pathTemplates.organizationPathTemplate.match(organizationName)
      .organization;
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
}

module.exports = ConfigServiceV2Client;
