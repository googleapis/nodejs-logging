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

var common = require('@google-cloud/common');
var extend = require('extend');
var is = require('is');

/**
 * A sink is an object that lets you to specify a set of log entries to export
 * to a particular destination. Stackdriver Logging lets you export log entries
 * to destinations including Cloud Storage buckets (for long term log
 * storage), Google BigQuery datasets (for log analysis), Google Pub/Sub (for
 * streaming to other applications).
 *
 * @see [Introduction to Sinks]{@link https://cloud.google.com/logging/docs/basic-concepts#sinks}
 *
 * @class
 *
 * @param {Logging} logging {@link Logging} instance.
 * @param {string} name Name of the sink.
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 */
function Sink(logging, name) {
  this.logging = logging;
  /**
   * @name Sink#name
   * @type {string}
   */
  this.name = name;
  this.formattedName_ = 'projects/' + logging.projectId + '/sinks/' + name;
}

/**
 * Create a sink.
 *
 * @param {CreateSinkRequest} config Config to set for the sink.
 * @param {CreateSinkCallback} [callback] Callback function.
 * @returns {Promise<CreateSinkResponse>}
 * @throws {Error} if a config object is not provided.
 * @see Logging#createSink
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 *
 * var config = {
 *   destination: {
 *     // ...
 *   }
 * };
 *
 * sink.create(config, function(err, sink, apiResponse) {
 *   if (!err) {
 *     // The sink was created successfully.
 *   }
 * });
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * sink.create(config).then(function(data) {
 *   var sink = data[0];
 *   var apiResponse = data[1];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_create_sink
 * Another example:
 */
Sink.prototype.create = function(config, callback) {
  this.logging.createSink(this.name, config, callback);
};

/**
 * @typedef {array} DeleteSinkResponse
 * @property {object} 0 The full API response.
 */
/**
 * @callback DeleteSinkCallback
 * @param {?Error} err Request error, if any.
 * @param {object} apiResponse The full API response.
 */
/**
 * Delete the sink.
 *
 * @see [projects.sink.delete API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks/delete}
 *
 * @param {object} [gaxOptions] Request configuration options, outlined
 *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @param {DeleteSinkCallback} [callback] Callback function.
 * @returns {Promise<DeleteSinkResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 *
 * sink.delete(function(err, apiResponse) {
 *   if (!err) {
 *     // The log was deleted.
 *   }
 * });
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * sink.delete().then(function(data) {
 *   var apiResponse = data[0];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_delete_sink
 * Another example:
 */
Sink.prototype.delete = function(gaxOptions, callback) {
  if (is.fn(gaxOptions)) {
    callback = gaxOptions;
    gaxOptions = {};
  }

  var reqOpts = {
    sinkName: this.formattedName_,
  };

  this.logging.request(
    {
      client: 'ConfigServiceV2Client',
      method: 'deleteSink',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    },
    callback
  );
};

/**
 * @typedef {array} GetSinkMetadataResponse
 * @property {object} 0 The {@link Sink} metadata.
 * @property {object} 1 The full API response.
 */
/**
 * @callback GetSinkMetadataCallback
 * @param {?Error} err Request error, if any.
 * @param {object} metadata The {@link Sink} metadata.
 * @param {object} apiResponse The full API response.
 */
/**
 * Get the sink's metadata.
 *
 * @see [Sink Resource]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks#LogSink}
 * @see [projects.sink.get API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks/get}
 *
 * @param {object} [gaxOptions] Request configuration options, outlined
 *     here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @param {GetSinkMetadataCallback} [callback] Callback function.
 * @returns {Promise<GetSinkMetadataResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 *
 * sink.getMetadata(function(err, metadata, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * sink.getMetadata().then(function(data) {
 *   var metadata = data[0];
 *   var apiResponse = data[1];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_get_sink
 * Another example:
 */
Sink.prototype.getMetadata = function(gaxOptions, callback) {
  var self = this;

  if (is.fn(gaxOptions)) {
    callback = gaxOptions;
    gaxOptions = {};
  }

  var reqOpts = {
    sinkName: this.formattedName_,
  };

  this.logging.request(
    {
      client: 'ConfigServiceV2Client',
      method: 'getSink',
      reqOpts: reqOpts,
      gaxOpts: gaxOptions,
    },
    function() {
      if (arguments[1]) {
        self.metadata = arguments[1];
      }

      callback.apply(null, arguments);
    }
  );
};

/**
 * @typedef {array} SetSinkFilterResponse
 * @property {object} 0 The full API response.
 */
/**
 * @callback SetSinkFilterCallback
 * @param {?Error} err Request error, if any.
 * @param {object} apiResponse The full API response.
 */
/**
 * Set the sink's filter.
 *
 * This will override any filter that was previously set.
 *
 * @see [Advanced Logs Filters]{@link https://cloud.google.com/logging/docs/view/advanced_filters}
 *
 * @param {string} filter The new filter.
 * @param {SetSinkFilterCallback} [callback] Callback function.
 * @returns {Promise<SetSinkFilterResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 *
 * var filter = 'metadata.severity = ALERT';
 *
 * sink.setFilter(filter, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * sink.setFilter(filter).then(function(data) {
 *   var apiResponse = data[0];
 * });
 */
Sink.prototype.setFilter = function(filter, callback) {
  this.setMetadata(
    {
      filter: filter,
    },
    callback
  );
};

/**
 * @typedef {array} SetSinkMetadataResponse
 * @property {object} 0 The full API response.
 */
/**
 * @callback SetSinkMetadataCallback
 * @param {?Error} err Request error, if any.
 * @param {object} apiResponse The full API response.
 */
/**
 * Set the sink's metadata.
 *
 * @see [Sink Resource]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks#LogSink}
 * @see [projects.sink.update API Documentation]{@link https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks/update}
 *
 * @param {object} metadata See a
 *     [Sink resource](https://cloud.google.com/logging/docs/reference/v2/rest/v2/projects.sinks#LogSink).
 * @param {object} [metadata.gaxOptions] Request configuration options,
 *     outlined here: https://googleapis.github.io/gax-nodejs/global.html#CallOptions.
 * @param {SetSinkMetadataCallback} [callback] Callback function.
 * @returns {Promise<SetSinkMetadataResponse>}
 *
 * @example
 * var Logging = require('@google-cloud/logging');
 * var logging = new Logging();
 * var sink = logging.sink('my-sink');
 *
 * var metadata = {
 *   filter: 'metadata.severity = ALERT'
 * };
 *
 * sink.setMetadata(metadata, function(err, apiResponse) {});
 *
 * //-
 * // If the callback is omitted, we'll return a Promise.
 * //-
 * sink.setMetadata(metadata).then(function(data) {
 *   var apiResponse = data[0];
 * });
 *
 * @example <caption>include:samples/sinks.js</caption>
 * region_tag:logging_update_sink
 * Another example:
 */
Sink.prototype.setMetadata = function(metadata, callback) {
  var self = this;

  callback = callback || common.util.noop;

  this.getMetadata(function(err, currentMetadata, apiResponse) {
    if (err) {
      callback(err, apiResponse);
      return;
    }

    var reqOpts = {
      sinkName: self.formattedName_,
      sink: extend({}, currentMetadata, metadata),
    };

    delete reqOpts.sink.gaxOptions;

    self.logging.request(
      {
        client: 'ConfigServiceV2Client',
        method: 'updateSink',
        reqOpts: reqOpts,
        gaxOpts: metadata.gaxOptions,
      },
      function() {
        if (arguments[1]) {
          self.metadata = arguments[1];
        }

        callback.apply(null, arguments);
      }
    );
  });
};

/*! Developer Documentation
 *
 * All async methods (except for streams) will return a Promise in the event
 * that a callback is omitted.
 */
common.util.promisifyAll(Sink);

/**
 * Reference to the {@link Sink} class.
 * @name module:@google-cloud/logging.Sink
 * @see Sink
 */
module.exports = Sink;
