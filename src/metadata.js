/*!
 * Copyright 2016 Google Inc. All Rights Reserved.
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

const fs = require('fs');
const gcpMetadata = require('gcp-metadata');

/**
 * The Metadata class attempts to contact the metadata service and determine,
 * based on request success and environment variables, what type of resource
 * the library is operating on.
 *
 * @class
 * @private
 *
 * @see [Logs Resource API Documentation]{@link https://cloud.google.com/logging/docs/api/reference/rest/v2/MonitoredResource}
 *
 * @param {Logging} logging The parent Logging instance.
 */
class Metadata {
  constructor(logging) {
    this.logging = logging;
  }
  /**
   * Retrieve a resource object describing the current environment.
   *
   * @param {function} callback Callback function.
   */
  getDefaultResource(callback) {
    this.logging.auth.getEnv()
        .then(env => {
          if (env === 'KUBERNETES_ENGINE') {
            Metadata.getGKEDescriptor(callback);
          } else if (env === 'APP_ENGINE') {
            callback(null, Metadata.getGAEDescriptor());
          } else if (env === 'CLOUD_FUNCTIONS') {
            callback(null, Metadata.getCloudFunctionDescriptor());
          } else if (env === 'COMPUTE_ENGINE') {
            // Test for compute engine should be done after all the rest -
            // everything runs on top of compute engine.
            Metadata.getGCEDescriptor(callback);
          } else {
            callback(null, Metadata.getGlobalDescriptor());
          }
        })
        .catch(callback);
  }

  /**
   * Create a descriptor for Cloud Functions.
   *
   * @returns {object}
   */
  static getCloudFunctionDescriptor() {
    return {
      type: 'cloud_function',
      labels: {
        function_name: process.env.FUNCTION_NAME,
        region: process.env.FUNCTION_REGION,
      },
    };
  }

  /**
   * Create a descriptor for Google App Engine.
   *
   * @returns {object}
   */
  static getGAEDescriptor() {
    return {
      type: 'gae_app',
      labels: {
        module_id: process.env.GAE_SERVICE || process.env.GAE_MODULE_NAME,
        version_id: process.env.GAE_VERSION,
      },
    };
  }

  /**
   * Create a descriptor for Google Compute Engine.
   *
   * @param {function} callback Callback function.
   * @return {object}
   */
  static getGCEDescriptor(callback) {
    gcpMetadata.instance('id').then(idResponse => {
      gcpMetadata.instance('zone').then(zoneResponse => {
        // Some parsing is necessary. Metadata service returns a fully
        // qualified zone name: 'projects/{projectId}/zones/{zone}'. Logging
        // wants just the zone part.
        //
        const zone = zoneResponse.split('/').pop();
        callback(null, {
          type: 'gce_instance',
          labels: {
            // idResponse can be BigNumber when the id too large for JavaScript
            // numbers. Use a toString() to uniformly convert to a string.
            instance_id: idResponse.toString(),
            zone: zone,
          },
        });
      }, callback);
    }, callback);
  }

  /**
   * Create a descriptor for Google Container Engine.
   *
   * @param {function} callback Callback function.
   * @return {object}
   */
  static getGKEDescriptor(callback) {
    // Stackdriver Logging Monitored Resource for 'container' requires
    // cluster_name and namespace_id fields. Note that these *need* to be
    // snake_case. The namespace_id is not easily available from inside the
    // container, but we can get the namespace_name. Logging has been using the
    // namespace_name in place of namespace_id for a while now. Log correlation
    // with metrics may not necessarily work however.
    //
    gcpMetadata.instance('attributes/cluster-name').then(resp => {
      fs.readFile(
          Metadata.KUBERNETES_NAMESPACE_ID_PATH, 'utf8', (err, namespace) => {
            if (err) {
              callback(new Error(
                  `Error reading ` +
                  `${Metadata.KUBERNETES_NAMESPACE_ID_PATH}: ${err.message}`));
              return;
            }
            callback(null, {
              type: 'container',
              labels: {
                cluster_name: resp,
                namespace_id: namespace,
              },
            });
          });
    }, callback);
  }

  /**
   * Create a global descriptor.
   *
   * @returns {object}
   */
  static getGlobalDescriptor() {
    return {
      type: 'global',
    };
  }
}

Metadata.KUBERNETES_NAMESPACE_ID_PATH =
    '/var/run/secrets/kubernetes.io/serviceaccount/namespace';

module.exports.Metadata = Metadata;
