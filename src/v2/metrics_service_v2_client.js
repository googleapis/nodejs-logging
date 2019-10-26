// Copyright 2019 Google LLC
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

const gapicConfig = require('./metrics_service_v2_client_config.json');
const gax = require('google-gax');
const path = require('path');

const VERSION = require('../../../package.json').version;

/**
 * Service for configuring logs-based metrics.
 *
 * @class
 * @memberof v2
 */
class MetricsServiceV2Client {
  /**
   * Construct an instance of MetricsServiceV2Client.
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
      opts.servicePath ||
      opts.apiEndpoint ||
      this.constructor.servicePath;

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

    const nodejsProtoPath = path.join(__dirname, '..', '..', 'protos', 'protos.json');
    const protos = gaxGrpc.loadProto(
      opts.fallback ?
        require("../../protos/protos.json") :
        nodejsProtoPath
    );

    // This API contains "path templates"; forward-slash-separated
    // identifiers to uniquely identify resources within the API.
    // Create useful helper objects for these.
    this._pathTemplates = {
      billingPathTemplate: new gaxModule.PathTemplate(
        'billingAccounts/{billing_account}'
      ),
      folderPathTemplate: new gaxModule.PathTemplate(
        'folders/{folder}'
      ),
      metricPathTemplate: new gaxModule.PathTemplate(
        'projects/{project}/metrics/{metric}'
      ),
      organizationPathTemplate: new gaxModule.PathTemplate(
        'organizations/{organization}'
      ),
      projectPathTemplate: new gaxModule.PathTemplate(
        'projects/{project}'
      ),
    };

    // Some of the methods on this service return "paged" results,
    // (e.g. 50 results at a time, with tokens to get subsequent
    // pages). Denote the keys used for pagination and results.
    this._descriptors.page = {
      listLogMetrics: new gaxModule.PageDescriptor(
        'pageToken',
        'nextPageToken',
        'metrics'
      ),
    };

    // Put together the default options sent with requests.
    const defaults = gaxGrpc.constructSettings(
      'google.logging.v2.MetricsServiceV2',
      gapicConfig,
      opts.clientConfig,
      {'x-goog-api-client': clientHeader.join(' ')}
    );

    // Set up a dictionary of "inner API calls"; the core implementation
    // of calling the API is handled in `google-gax`, with this code
    // merely providing the destination and request information.
    this._innerApiCalls = {};

    // Put together the "service stub" for
    // google.logging.v2.MetricsServiceV2.
    const metricsServiceV2Stub = gaxGrpc.createStub(
      opts.fallback ?
        protos.lookupService('google.logging.v2.MetricsServiceV2') :
        protos.google.logging.v2.MetricsServiceV2,
      opts
    );

    // Iterate over each of the methods that the service provides
    // and create an API call method for each.
    const metricsServiceV2StubMethods = [
      'listLogMetrics',
      'getLogMetric',
      'createLogMetric',
      'updateLogMetric',
      'deleteLogMetric',
    ];
    for (const methodName of metricsServiceV2StubMethods) {
      const innerCallPromise = metricsServiceV2Stub.then(
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
   * Lists logs-based metrics.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   Required. The name of the project containing the metrics:
   *
   *       "projects/[PROJECT_ID]"
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
   *   The second parameter to the callback is Array of [LogMetric]{@link google.logging.v2.LogMetric}.
   *
   *   When autoPaginate: false is specified through options, it contains the result
   *   in a single response. If the response indicates the next page exists, the third
   *   parameter is set to be used for the next request object. The fourth parameter keeps
   *   the raw response object of an object representing [ListLogMetricsResponse]{@link google.logging.v2.ListLogMetricsResponse}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is Array of [LogMetric]{@link google.logging.v2.LogMetric}.
   *
   *   When autoPaginate: false is specified through options, the array has three elements.
   *   The first element is Array of [LogMetric]{@link google.logging.v2.LogMetric} in a single response.
   *   The second element is the next request object if the response
   *   indicates the next page exists, or null. The third element is
   *   an object representing [ListLogMetricsResponse]{@link google.logging.v2.ListLogMetricsResponse}.
   *
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * // Iterate over all elements.
   * const formattedParent = client.projectPath('[PROJECT]');
   *
   * client.listLogMetrics({parent: formattedParent})
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
   *     return client.listLogMetrics(nextRequest, options).then(callback);
   *   }
   * }
   * client.listLogMetrics({parent: formattedParent}, options)
   *   .then(callback)
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  listLogMetrics(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers['x-goog-request-params'] =
      gax.routingHeader.fromParams({
        'parent': request.parent
      });

    return this._innerApiCalls.listLogMetrics(request, options, callback);
  }

  /**
   * Equivalent to {@link listLogMetrics}, but returns a NodeJS Stream object.
   *
   * This fetches the paged responses for {@link listLogMetrics} continuously
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
   *   Required. The name of the project containing the metrics:
   *
   *       "projects/[PROJECT_ID]"
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
   *   An object stream which emits an object representing [LogMetric]{@link google.logging.v2.LogMetric} on 'data' event.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
   * client.listLogMetricsStream({parent: formattedParent})
   *   .on('data', element => {
   *     // doThingsWith(element)
   *   }).on('error', err => {
   *     console.log(err);
   *   });
   */
  listLogMetricsStream(request, options) {
    options = options || {};

    return this._descriptors.page.listLogMetrics.createStream(
      this._innerApiCalls.listLogMetrics,
      request,
      options
    );
  };

  /**
   * Gets a logs-based metric.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.metricName
   *   The resource name of the desired metric:
   *
   *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
   * client.getLogMetric({metricName: formattedMetricName})
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  getLogMetric(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers['x-goog-request-params'] =
      gax.routingHeader.fromParams({
        'metric_name': request.metricName
      });

    return this._innerApiCalls.getLogMetric(request, options, callback);
  }

  /**
   * Creates a logs-based metric.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.parent
   *   The resource name of the project in which to create the metric:
   *
   *       "projects/[PROJECT_ID]"
   *
   *   The new metric must be provided in the request.
   * @param {Object} request.metric
   *   The new logs-based metric, which must not have an identifier that
   *   already exists.
   *
   *   This object should have the same structure as [LogMetric]{@link google.logging.v2.LogMetric}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedParent = client.projectPath('[PROJECT]');
   * const metric = {};
   * const request = {
   *   parent: formattedParent,
   *   metric: metric,
   * };
   * client.createLogMetric(request)
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  createLogMetric(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers['x-goog-request-params'] =
      gax.routingHeader.fromParams({
        'parent': request.parent
      });

    return this._innerApiCalls.createLogMetric(request, options, callback);
  }

  /**
   * Creates or updates a logs-based metric.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.metricName
   *   The resource name of the metric to update:
   *
   *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
   *
   *   The updated metric must be provided in the request and it's
   *   `name` field must be the same as `[METRIC_ID]` If the metric
   *   does not exist in `[PROJECT_ID]`, then a new metric is created.
   * @param {Object} request.metric
   *   The updated metric.
   *
   *   This object should have the same structure as [LogMetric]{@link google.logging.v2.LogMetric}
   * @param {Object} [options]
   *   Optional parameters. You can override the default settings for this call, e.g, timeout,
   *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/interfaces/CallOptions.html} for the details.
   * @param {function(?Error, ?Object)} [callback]
   *   The function which will be called with the result of the API call.
   *
   *   The second parameter to the callback is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   * @returns {Promise} - The promise which resolves to an array.
   *   The first element of the array is an object representing [LogMetric]{@link google.logging.v2.LogMetric}.
   *   The promise has a method named "cancel" which cancels the ongoing API call.
   *
   * @example
   *
   * const logging = require('@google-cloud/logging');
   *
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
   * const metric = {};
   * const request = {
   *   metricName: formattedMetricName,
   *   metric: metric,
   * };
   * client.updateLogMetric(request)
   *   .then(responses => {
   *     const response = responses[0];
   *     // doThingsWith(response)
   *   })
   *   .catch(err => {
   *     console.error(err);
   *   });
   */
  updateLogMetric(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers['x-goog-request-params'] =
      gax.routingHeader.fromParams({
        'metric_name': request.metricName
      });

    return this._innerApiCalls.updateLogMetric(request, options, callback);
  }

  /**
   * Deletes a logs-based metric.
   *
   * @param {Object} request
   *   The request object that will be sent.
   * @param {string} request.metricName
   *   The resource name of the metric to delete:
   *
   *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
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
   * const client = new logging.v2.MetricsServiceV2Client({
   *   // optional auth parameters.
   * });
   *
   * const formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
   * client.deleteLogMetric({metricName: formattedMetricName}).catch(err => {
   *   console.error(err);
   * });
   */
  deleteLogMetric(request, options, callback) {
    if (options instanceof Function && callback === undefined) {
      callback = options;
      options = {};
    }
    request = request || {};
    options = options || {};
    options.otherArgs = options.otherArgs || {};
    options.otherArgs.headers = options.otherArgs.headers || {};
    options.otherArgs.headers['x-goog-request-params'] =
      gax.routingHeader.fromParams({
        'metric_name': request.metricName
      });

    return this._innerApiCalls.deleteLogMetric(request, options, callback);
  }

  // --------------------
  // -- Path templates --
  // --------------------

  /**
   * Return a fully-qualified billing resource name string.
   *
   * @param {String} billingAccount
   * @returns {String}
   */
  billingPath(billingAccount) {
    return this._pathTemplates.billingPathTemplate.render({
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
   * Return a fully-qualified metric resource name string.
   *
   * @param {String} project
   * @param {String} metric
   * @returns {String}
   */
  metricPath(project, metric) {
    return this._pathTemplates.metricPathTemplate.render({
      project: project,
      metric: metric,
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
   * Parse the billingName from a billing resource.
   *
   * @param {String} billingName
   *   A fully-qualified path representing a billing resources.
   * @returns {String} - A string representing the billing_account.
   */
  matchBillingAccountFromBillingName(billingName) {
    return this._pathTemplates.billingPathTemplate
      .match(billingName)
      .billing_account;
  }

  /**
   * Parse the folderName from a folder resource.
   *
   * @param {String} folderName
   *   A fully-qualified path representing a folder resources.
   * @returns {String} - A string representing the folder.
   */
  matchFolderFromFolderName(folderName) {
    return this._pathTemplates.folderPathTemplate
      .match(folderName)
      .folder;
  }

  /**
   * Parse the metricName from a metric resource.
   *
   * @param {String} metricName
   *   A fully-qualified path representing a metric resources.
   * @returns {String} - A string representing the project.
   */
  matchProjectFromMetricName(metricName) {
    return this._pathTemplates.metricPathTemplate
      .match(metricName)
      .project;
  }

  /**
   * Parse the metricName from a metric resource.
   *
   * @param {String} metricName
   *   A fully-qualified path representing a metric resources.
   * @returns {String} - A string representing the metric.
   */
  matchMetricFromMetricName(metricName) {
    return this._pathTemplates.metricPathTemplate
      .match(metricName)
      .metric;
  }

  /**
   * Parse the organizationName from a organization resource.
   *
   * @param {String} organizationName
   *   A fully-qualified path representing a organization resources.
   * @returns {String} - A string representing the organization.
   */
  matchOrganizationFromOrganizationName(organizationName) {
    return this._pathTemplates.organizationPathTemplate
      .match(organizationName)
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
    return this._pathTemplates.projectPathTemplate
      .match(projectName)
      .project;
  }
}


module.exports = MetricsServiceV2Client;
