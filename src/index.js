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

'use strict';

var arrify = require('arrify');
var common = require('@google-cloud/common');
var extend = require('extend');
var format = require('string-format-obj');
var googleAuth = require('google-auto-auth');
var is = require('is');
var pumpify = require('pumpify');
var streamEvents = require('stream-events');
var through = require('through2');

var PKG = require('../package.json');
var v2 = require('./v2');

var Entry = require('./entry.js');
var Log = require('./log.js');
var Sink = require('./sink.js');

/**
 * @namespace google
 */
/**
 * @namespace google.api
 */
/**
 * @namespace google.logging
 */
/**
 * @namespace google.logging.type
 */
/**
 * @namespace google.logging.v2
 */
/**
 * @namespace google.protobuf
 */

/**
 * @typedef {object} ClientConfig
 * @property {string} [projectId] The project ID from the Google Developer's
 *     Console, e.g. 'grape-spaceship-123'. We will also check the environment
 *     variable `GCLOUD_PROJECT` for your project ID. If your app is running in
 *     an environment which supports {@link https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application Application Default Credentials},
 *     your project ID will be detected automatically.
 * @property {string} [keyFilename] Full path to the a .json, .pem, or .p12 key
 *     downloaded from the Google Developers Console. If you provide a path to a
 *     JSON file, the `projectId` option above is not necessary. NOTE: .pem and
 *     .p12 require you to specify the `email` option as well.
 * @property {string} [email] Account email address. Required when using a .pem
 *     or .p12 keyFilename.
 * @property {object} [credentials] Credentials object.
 * @property {string} [credentials.client_email]
 * @property {string} [credentials.private_key]
 * @property {boolean} [autoRetry=true] Automatically retry requests if the
 *     response is related to rate limits or certain intermittent server errors.
 *     We will exponentially backoff subsequent requests by default.
 * @property {number} [maxRetries=3] Maximum number of automatic retries
 *     attempted before returning the error.
 * @property {Constructor} [promise] Custom promise module to use instead of
 *     native Promises.
 */

/**
 * [Stackdriver Logging](https://cloud.google.com/logging/docs) allows you to
 * store, search, analyze, monitor, and alert on log data and events from Google
 * Cloud Platform and Amazon Web Services (AWS).
 *
 * @class
 *
 * @see [What is Stackdriver Logging?]{@link https://cloud.google.com/logging/docs}
 * @see [Introduction to the Stackdriver Logging API]{@link https://cloud.google.com/logging/docs/api}
 * @see [Logging to Stackdriver from Bunyan]{@link https://www.npmjs.com/package/@google-cloud/logging-bunyan}
 * @see [Logging to Stackdriver from Winston]{@link https://www.npmjs.com/package/@google-cloud/logging-winston}
 *
 * @param {ClientConfig} [options] Configuration options.
 *
 * @example <caption>Import the client library</caption>
 * const Logging = require('@google-cloud/logging');
 *
 * @example <caption>Create a client that uses <a href="https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application">Application Default Credentials (ADC)</a>:</caption>
 * const logging = new Logging();
 *
 * @example <caption>Create a client with <a href="https://cloud.google.com/docs/authentication/production#obtaining_and_providing_service_account_credentials_manually">explicit credentials</a>:</caption>
 * const logging = new Logging({
 *   projectId: 'your-project-id',
 *   keyFilename: '/path/to/keyfile.json'
 * });
 *
 * @example <caption>include:samples/quickstart.js</caption>
 * region_tag:logging_quickstart
 * Full quickstart example:
 */
function Logging(options) {
  if (!(this instanceof Logging)) {
    options = common.util.normalizeArguments(this, options);
    return new Logging(options);
  }

  // Determine what scopes are needed.
  // It is the union of the scopes on all three clients.
  let scopes = [];
  let clientClasses = [
    v2.ConfigServiceV2Client,
    v2.LoggingServiceV2Client,
    v2.MetricsServiceV2Client,
  ];
  for (let clientClass of clientClasses) {
    for (let scope of clientClass.scopes) {
      if (clientClasses.indexOf(scope) === -1) {
        scopes.push(scope);
      }
    }
  }

  var options_ = extend(
    {
      libName: 'gccl',
      libVersion: PKG.version,
      scopes: scopes,
    },
    options
  );

  this.api = {};
  this.auth = googleAuth(options_);
  this.options = options_;
  this.projectId = this.options.projectId || '{{projectId}}';
}

/**
 * Config to set for the sink. Not all available options are listed here, see
 * the [Sink resource](https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks#LogSink)
 * definition for full details.
 *
 * @typedef {object} CreateSinkRequest
 * @property {object} [gaxOptions] Request configuration options, outlined
 *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @property {Bucket|Dataset|Topic} [destination] The destination. The proper ACL
 *     scopes will be granted to the provided destination. Can be one of:
 *     {@link https://cloud.google.com/nodejs/docs/reference/storage/latest/Bucket Bucket},
 *     {@link https://cloud.google.com/nodejs/docs/reference/bigquery/latest/Dataset Dataset},
 *     or {@link https://cloud.google.com/nodejs/docs/reference/pubsub/latest/Topic Topic}
 * @property {string} [filter] An advanced logs filter. Only log entries
 *     matching the filter are written.
 */
/**
 * @typedef {array} CreateSinkResponse
 * @property {Sink} 0 The new {@link Sink}.
 * @property {object} 1 The full API response.
 */
/**
 * @callback CreateSinkCallback
 * @param {?Error} err Request error, if any.
 * @param {Sink} sink The new {@link Sink}.
 * @param {object} apiResponse The full API response.
 */
// jscs:disable maximumLineLength
/**
 * Create a sink.
 *
 * @see [Sink Overview]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks}
 * @see [Advanced Logs Filters]{@link https://cloud.google.com/logging/docs/view/advanced_filters}
 * @see [projects.sinks.create API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks/create}
 *
 * @param {string} name Name of the sink.
 * @param {CreateSinkRequest} config Config to set for the sink.
 * @param {CreateSinkCallback} [callback] Callback function.
 * @returns {Promise<CreateSinkResponse>}
 * @throws {Error} If a name is not provided.
 * @throws {Error} if a config object is not provided.
 * @see Sink#create
 *
 * @example
 * var Storage = require('@google-cloud/storage');
 * var storage = new Storage({
 *   projectId: 'grape-spaceship-123'
 * });
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * var config = {
 *   destination: storage.bucket('logging-bucket'),
 *   filter: 'severity = ALERT'
 * };
 *
 * function callback(err, sink, apiResponse) {
 *   // `sink` is a Sink object.
 * }
 *
 * logging.createSink('new-sink-name', config, callback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * logging.createSink('new-sink-name', config).then(function(data) {
 *   var sink = data[0];
 *   var apiResponse = data[1];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_create_sink
 * Another example:
 */
Logging.prototype.createSink = function(name, config, callback) {
  // jscs:enable maximumLineLength
  var self = this;

  if (!is.string(name)) {
    throw new Error('A sink name must be provided.');
  }

  if (!is.object(config)) {
    throw new Error('A sink configuration object must be provided.');
  }

  if (common.util.isCustomType(config.destination, 'bigquery/dataset')) {
    this.setAclForDataset_(name, config, callback);
    return;
  }

  if (common.util.isCustomType(config.destination, 'pubsub/topic')) {
    this.setAclForTopic_(name, config, callback);
    return;
  }

  if (common.util.isCustomType(config.destination, 'storage/bucket')) {
    this.setAclForBucket_(name, config, callback);
    return;
  }

  var reqOpts = {
    parent: 'projects/' + this.projectId,
    sink: extend({}, config, {name: name}),
  };

  delete reqOpts.sink.gaxOptions;

  this.request(
    {
      client: 'ConfigServiceV2Client',
      method: 'createSink',
      reqOpts: reqOpts,
      gaxOpts: config.gaxOptions,
    },
    function(err, resp) {
      if (err) {
        callback(err, null, resp);
        return;
      }

      var sink = self.sink(resp.name);
      sink.metadata = resp;

      callback(null, sink, resp);
    }
  );
};

/**
 * Create an entry object.
 *
 * Note that using this method will not itself make any API requests. You will
 * use the object returned in other API calls, such as
 * {@link Log#write}.
 *
 * @see [LogEntry JSON representation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry}
 *
 * @param {?object|?string} [resource] See a
 *     [Monitored Resource](https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource).
 * @param {object|string} data The data to use as the value for this log
 *     entry.
 * @returns {Entry}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * var resource = {
 *   type: 'gce_instance',
 *   labels: {
 *     zone: 'global',
 *     instance_id: '3'
 *   }
 * };
 *
 * var entry = logging.entry(resource, {
 *   delegate: 'my_username'
 * });
 *
 * entry.toJSON();
 * // {
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
Logging.prototype.entry = function(resource, data) {
  return new Entry(resource, data);
};

/**
 * Query object for listing entries.
 *
 * @typedef {object} GetEntriesRequest
 * @property {boolean} [autoPaginate=true] Have pagination handled
 *     automatically.
 * @property {string} [filter] An
 *     [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced_filters).
 *     An empty filter matches all log entries.
 * @property {object} [gaxOptions] Request configuration options, outlined
 *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @property {number} [maxApiCalls] Maximum number of API calls to make.
 * @property {number} [maxResults] Maximum number of items plus prefixes to
 *     return.
 * @property {string} [orderBy] How the results should be sorted,
 *     `timestamp` (oldest first) and `timestamp desc` (newest first,
 *     **default**).
 * @property {number} [pageSize] Maximum number of logs to return.
 * @property {string} [pageToken] A previously-returned page token
 *     representing part of the larger set of results to view.
 */
/**
 * @typedef {array} GetEntriesResponse
 * @property {Entry[]} 0 Array of {@link Entry} instances.
 * @property {object} 1 The full API response.
 */
/**
 * @callback GetEntriesCallback
 * @param {?Error} err Request error, if any.
 * @param {Entry[]} entries Array of {@link Entry} instances.
 * @param {object} apiResponse The full API response.
 */
/**
 * List the entries in your logs.
 *
 * @see [entries.list API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/entries/list}
 *
 * @param {GetEntriesRequest} [query] Query object for listing entries.
 * @param {GetEntriesCallback} [callback] Callback function.
 * @returns {Promise<GetEntriesResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * logging.getEntries(function(err, entries) {
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
 *     logging.getEntries(nextQuery, callback);
 *   }
 * }
 *
 * logging.getEntries({
 *   autoPaginate: false
 * }, callback);
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * logging.getEntries().then(function(data) {
 *   var entries = data[0];
 * });
 *
 * @example <caption>include:samples/logs.js</caption>
 * region_tag:logging_list_log_entries
 * Another example:
 *
 * @example <caption>include:samples/logs.js</caption>
 * region_tag:logging_list_log_entries_advanced
 * Another example:
 */
Logging.prototype.getEntries = function(options, callback) {
  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  var reqOpts = extend(
    {
      orderBy: 'timestamp desc',
    },
    options
  );

  reqOpts.resourceNames = arrify(reqOpts.resourceNames);
  reqOpts.resourceNames.push('projects/' + this.projectId);

  delete reqOpts.autoPaginate;
  delete reqOpts.gaxOptions;

  var gaxOptions = extend(
    {
      autoPaginate: options.autoPaginate,
    },
    options.gaxOptions
  );

  this.request(
    {
      client: 'LoggingServiceV2Client',
      method: 'listLogEntries',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    },
    function() {
      var entries = arguments[1];

      if (entries) {
        arguments[1] = entries.map(Entry.fromApiResponse_);
      }

      callback.apply(null, arguments);
    }
  );
};

/**
 * List the {@link Entry} objects in your logs as a readable object
 * stream.
 *
 * @method Logging#getEntriesStream
 * @param {GetEntriesRequest} [query] Query object for listing entries.
 * @returns {ReadableStream} A readable stream that emits {@link Entry}
 *     instances.
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * logging.getEntriesStream()
 *   .on('error', console.error)
 *   .on('data', function(entry) {
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
 * logging.getEntriesStream()
 *   .on('data', function(entry) {
 *     this.end();
 *   });
 */
Logging.prototype.getEntriesStream = function(options) {
  var self = this;

  options = options || {};

  var requestStream;

  var userStream = streamEvents(pumpify.obj());

  userStream.abort = function() {
    if (requestStream) {
      requestStream.abort();
    }
  };

  var toEntryStream = through.obj(function(entry, _, next) {
    next(null, Entry.fromApiResponse_(entry));
  });

  userStream.once('reading', function() {
    var reqOpts = extend(
      {
        orderBy: 'timestamp desc',
      },
      options
    );
    reqOpts.resourceNames = arrify(reqOpts.resourceNames);
    reqOpts.resourceNames.push('projects/' + self.projectId);

    delete reqOpts.autoPaginate;
    delete reqOpts.gaxOptions;

    var gaxOptions = extend(
      {
        autoPaginate: options.autoPaginate,
      },
      options.gaxOptions
    );

    requestStream = self.request({
      client: 'LoggingServiceV2Client',
      method: 'listLogEntriesStream',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    });

    userStream.setPipeline(requestStream, toEntryStream);
  });

  return userStream;
};

/**
 * Query object for listing sinks.
 *
 * @typedef {object} GetSinksRequest
 * @property {boolean} [autoPaginate=true] Have pagination handled
 *     automatically.
 * @property {object} [gaxOptions] Request configuration options, outlined
 *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @property {number} [maxApiCalls] Maximum number of API calls to make.
 * @property {number} [maxResults] Maximum number of items plus prefixes to
 *     return.
 * @property {number} [pageSize] Maximum number of logs to return.
 * @property {string} [pageToken] A previously-returned page token
 *     representing part of the larger set of results to view.
 */
/**
 * @typedef {array} GetSinksResponse
 * @property {Sink[]} 0 Array of {@link Sink} instances.
 * @property {object} 1 The full API response.
 */
/**
 * @callback GetSinksCallback
 * @param {?Error} err Request error, if any.
 * @param {Sink[]} sinks Array of {@link Sink} instances.
 * @param {object} apiResponse The full API response.
 */
/**
 * Get the sinks associated with this project.
 *
 * @see [projects.sinks.list API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks/list}
 *
 * @param {GetSinksRequest} [query] Query object for listing sinks.
 * @param {GetSinksCallback} [callback] Callback function.
 * @returns {Promise<GetSinksResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * logging.getSinks(function(err, sinks) {
 *   // sinks is an array of Sink objects.
 * });
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * logging.getSinks().then(function(data) {
 *   var sinks = data[0];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_list_sinks
 * Another example:
 */
Logging.prototype.getSinks = function(options, callback) {
  var self = this;

  if (is.fn(options)) {
    callback = options;
    options = {};
  }

  var reqOpts = extend({}, options, {
    parent: 'projects/' + this.projectId,
  });

  delete reqOpts.autoPaginate;
  delete reqOpts.gaxOptions;

  var gaxOptions = extend(
    {
      autoPaginate: options.autoPaginate,
    },
    options.gaxOptions
  );

  this.request(
    {
      client: 'ConfigServiceV2Client',
      method: 'listSinks',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    },
    function() {
      var sinks = arguments[1];

      if (sinks) {
        arguments[1] = sinks.map(function(sink) {
          var sinkInstance = self.sink(sink.name);
          sinkInstance.metadata = sink;
          return sinkInstance;
        });
      }

      callback.apply(null, arguments);
    }
  );
};

/**
 * Get the {@link Sink} objects associated with this project as a
 * readable object stream.
 *
 * @method Logging#getSinksStream
 * @param {GetSinksRequest} [query] Query object for listing sinks.
 * @returns {ReadableStream} A readable stream that emits {@link Sink}
 *     instances.
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 *
 * logging.getSinksStream()
 *   .on('error', console.error)
 *   .on('data', function(sink) {
 *     // `sink` is a Sink object.
 *   })
 *   .on('end', function() {
 *     // All sinks retrieved.
 *   });
 *
 * //-
 * // If you anticipate many results, you can end a stream early to prevent
 * // unnecessary processing and API requests.
 * //-
 * logging.getSinksStream()
 *   .on('data', function(sink) {
 *     this.end();
 *   });
 */
Logging.prototype.getSinksStream = function(options) {
  var self = this;

  options = options || {};

  var requestStream;
  var userStream = streamEvents(pumpify.obj());

  userStream.abort = function() {
    if (requestStream) {
      requestStream.abort();
    }
  };

  var toSinkStream = through.obj(function(sink, _, next) {
    var sinkInstance = self.sink(sink.name);
    sinkInstance.metadata = sink;
    next(null, sinkInstance);
  });

  userStream.once('reading', function() {
    var reqOpts = extend({}, options, {
      parent: 'projects/' + self.projectId,
    });

    delete reqOpts.gaxOptions;

    var gaxOptions = extend(
      {
        autoPaginate: options.autoPaginate,
      },
      options.gaxOptions
    );

    requestStream = self.request({
      client: 'ConfigServiceV2Client',
      method: 'listSinksStream',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    });

    userStream.setPipeline(requestStream, toSinkStream);
  });

  return userStream;
};

/**
 * Get a reference to a Stackdriver Logging log.
 *
 * @see [Log Overview]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.logs}
 *
 * @param {string} name Name of the existing log.
 * @param {object} [options] Configuration object.
 * @param {boolean} [options.removeCircular] Replace circular references in
 *     logged objects with a string value, `[Circular]`. (Default: false)
 * @returns {Log}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var log = logging.log('my-log');
 */
Logging.prototype.log = function(name, options) {
  return new Log(this, name, options);
};

/**
 * Get a reference to a Stackdriver Logging sink.
 *
 * @see [Sink Overview]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks}
 *
 * @param {string} name Name of the existing sink.
 * @returns {Sink}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 */
Logging.prototype.sink = function(name) {
  return new Sink(this, name);
};

/**
 * Funnel all API requests through this method, to be sure we have a project ID.
 *
 * @param {object} config Configuration object.
 * @param {object} config.gaxOpts GAX options.
 * @param {function} config.method The gax method to call.
 * @param {object} config.reqOpts Request options.
 * @param {function} [callback] Callback function.
 */
Logging.prototype.request = function(config, callback) {
  var self = this;
  var isStreamMode = !callback;

  var gaxStream;
  var stream;

  if (isStreamMode) {
    stream = streamEvents(through.obj());

    stream.abort = function() {
      if (gaxStream && gaxStream.cancel) {
        gaxStream.cancel();
      }
    };

    stream.once('reading', makeRequestStream);
  } else {
    makeRequestCallback();
  }

  function prepareGaxRequest(callback) {
    self.auth.getProjectId(function(err, projectId) {
      if (err) {
        callback(err);
        return;
      }

      var gaxClient = self.api[config.client];

      if (!gaxClient) {
        // Lazily instantiate client.
        gaxClient = new v2[config.client](self.options);
        self.api[config.client] = gaxClient;
      }

      var reqOpts = extend(true, {}, config.reqOpts);
      reqOpts = common.util.replaceProjectIdToken(reqOpts, projectId);

      var requestFn = gaxClient[config.method].bind(
        gaxClient,
        reqOpts,
        config.gaxOpts
      );

      callback(null, requestFn);
    });
  }

  function makeRequestCallback() {
    if (global.GCLOUD_SANDBOX_ENV) {
      return;
    }

    prepareGaxRequest(function(err, requestFn) {
      if (err) {
        callback(err);
        return;
      }

      requestFn(callback);
    });
  }

  function makeRequestStream() {
    if (global.GCLOUD_SANDBOX_ENV) {
      return through.obj();
    }

    prepareGaxRequest(function(err, requestFn) {
      if (err) {
        stream.destroy(err);
        return;
      }

      gaxStream = requestFn();

      gaxStream
        .on('error', function(err) {
          stream.destroy(err);
        })
        .pipe(stream);
    });
  }

  return stream;
};

/**
 * This method is called when creating a sink with a Bucket destination. The
 * bucket must first grant proper ACL access to the Stackdriver Logging account.
 *
 * The parameters are the same as what {@link Logging#createSink} accepts.
 *
 * @private
 */
Logging.prototype.setAclForBucket_ = function(name, config, callback) {
  var self = this;
  var bucket = config.destination;

  bucket.acl.owners.addGroup('cloud-logs@google.com', function(err, apiResp) {
    if (err) {
      callback(err, null, apiResp);
      return;
    }

    config.destination = 'storage.googleapis.com/' + bucket.name;

    self.createSink(name, config, callback);
  });
};

/**
 * This method is called when creating a sink with a Dataset destination. The
 * dataset must first grant proper ACL access to the Stackdriver Logging
 * account.
 *
 * The parameters are the same as what {@link Logging#createSink} accepts.
 *
 * @private
 */
Logging.prototype.setAclForDataset_ = function(name, config, callback) {
  var self = this;
  var dataset = config.destination;

  dataset.getMetadata(function(err, metadata, apiResp) {
    if (err) {
      callback(err, null, apiResp);
      return;
    }

    var access = [].slice.call(arrify(metadata.access));

    access.push({
      role: 'WRITER',
      groupByEmail: 'cloud-logs@google.com',
    });

    dataset.setMetadata(
      {
        access: access,
      },
      function(err, apiResp) {
        if (err) {
          callback(err, null, apiResp);
          return;
        }

        config.destination = format('{baseUrl}/projects/{pId}/datasets/{dId}', {
          baseUrl: 'bigquery.googleapis.com',
          pId: dataset.parent.projectId,
          dId: dataset.id,
        });

        self.createSink(name, config, callback);
      }
    );
  });
};

/**
 * This method is called when creating a sink with a Topic destination. The
 * topic must first grant proper ACL access to the Stackdriver Logging account.
 *
 * The parameters are the same as what {@link Logging#createSink} accepts.
 *
 * @private
 */
Logging.prototype.setAclForTopic_ = function(name, config, callback) {
  var self = this;
  var topic = config.destination;

  topic.iam.getPolicy(function(err, policy, apiResp) {
    if (err) {
      callback(err, null, apiResp);
      return;
    }

    policy.bindings = arrify(policy.bindings);

    policy.bindings.push({
      role: 'roles/pubsub.publisher',
      members: ['serviceAccount:cloud-logs@system.gserviceaccount.com'],
    });

    topic.iam.setPolicy(policy, function(err, policy, apiResp) {
      if (err) {
        callback(err, null, apiResp);
        return;
      }

      config.destination = format('{baseUrl}/{topicName}', {
        baseUrl: 'pubsub.googleapis.com',
        topicName: topic.name,
      });

      self.createSink(name, config, callback);
    });
  });
};

/*! Developer Documentation
 *
 * These methods can be auto-paginated.
 */
common.paginator.extend(Logging, ['getEntries', 'getSinks']);

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
common.util.promisifyAll(Logging, {
  exclude: ['entry', 'log', 'request', 'sink'],
});

/**
 * {@link Entry} class.
 *
 * @name Logging.Entry
 * @see Entry
 * @type {Constructor}
 */
Logging.Entry = Entry;

/**
 * {@link Log} class.
 *
 * @name Logging.Log
 * @see Log
 * @type {Constructor}
 */
Logging.Log = Log;

/**
 * Reference to the {@link Logging} class.
 * @name module:@google-cloud/logging.Logging
 * @see Logging
 */
/**
 * {@link Logging} class.
 *
 * @name Logging.Logging
 * @see Logging
 * @type {Constructor}
 */
Logging.Logging = Logging;

/**
 * {@link Sink} class.
 *
 * @name Logging.Sink
 * @see Sink
 * @type {Constructor}
 */
Logging.Sink = Sink;

/**
 * The default export of the `@google-cloud/logging` package is the
 * {@link Logging} class.
 *
 * See {@link Logging} and {@link ClientConfig} for client methods and
 * configuration options.
 *
 * @module {Constructor} @google-cloud/logging
 * @alias nodejs-logging
 *
 * @example <caption>Install the client library with <a href="https://www.npmjs.com/">npm</a>:</caption>
 * npm install --save @google-cloud/logging
 *
 * @example <caption>Import the client library</caption>
 * const Logging = require('@google-cloud/logging');
 *
 * @example <caption>Create a client that uses <a href="https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application">Application Default Credentials (ADC)</a>:</caption>
 * const logging = new Logging();
 *
 * @example <caption>Create a client with <a href="https://cloud.google.com/docs/authentication/production#obtaining_and_providing_service_account_credentials_manually">explicit credentials</a>:</caption>
 * const logging = new Logging({
 *   projectId: 'your-project-id',
 *   keyFilename: '/path/to/keyfile.json'
 * });
 *
 * @example <caption>include:samples/quickstart.js</caption>
 * region_tag:logging_quickstart
 * Full quickstart example:
 */
module.exports = Logging;

/**
 * Reference to the low-level auto-generated clients for the V2 Logging service.
 *
 * @type {object}
 * @property {constructor} LoggingServiceV2Client
 *   Reference to {@link v2.LoggingServiceV2Client}
 * @property {constructor} ConfigServiceV2Client
 *   Reference to {@link v2.ConfigServiceV2Client}
 * @property {constructor} MetricsServiceV2Client
 *   Reference to {@link v2.MetricsServiceV2Client}
 */
module.exports.v2 = v2;
