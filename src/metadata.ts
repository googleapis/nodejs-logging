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

import * as fs from 'fs';
import * as gcpMetadata from 'gcp-metadata';
import {GoogleAuth} from 'google-auth-library';
import * as pify from 'pify';

const readFile = pify(fs.readFile);

/**
 * Create a descriptor for Cloud Functions.
 *
 * @returns {object}
 */
export function getCloudFunctionDescriptor() {
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
export function getGAEDescriptor() {
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
 * @return {object}
 */
export async function getGCEDescriptor() {
  const idResponse = await gcpMetadata.instance('id');
  const zoneResponse = await gcpMetadata.instance('zone');
  // Some parsing is necessary. Metadata service returns a fully
  // qualified zone name: 'projects/{projectId}/zones/{zone}'. Logging
  // wants just the zone part.
  //
  const zone = zoneResponse.split('/').pop();
  return {
    type: 'gce_instance',
    labels: {
      // idResponse can be BigNumber when the id too large for JavaScript
      // numbers. Use a toString() to uniformly convert to a string.
      instance_id: idResponse.toString(),
      zone,
    },
  };
}

export const KUBERNETES_NAMESPACE_ID_PATH =
    '/var/run/secrets/kubernetes.io/serviceaccount/namespace';

/**
 * Create a descriptor for Google Container Engine.
 *
 * @return {object}
 */
export async function getGKEDescriptor() {
  // Stackdriver Logging Monitored Resource for 'container' requires
  // cluster_name and namespace_id fields. Note that these *need* to be
  // snake_case. The namespace_id is not easily available from inside the
  // container, but we can get the namespace_name. Logging has been using the
  // namespace_name in place of namespace_id for a while now. Log correlation
  // with metrics may not necessarily work however.
  //
  const resp = await gcpMetadata.instance('attributes/cluster-name');

  let namespace;
  try {
    namespace = await readFile(KUBERNETES_NAMESPACE_ID_PATH, 'utf8');
  } catch (err) {
    throw new Error(
        `Error reading ${KUBERNETES_NAMESPACE_ID_PATH}: ${err.message}`);
  }

  return {
    type: 'container',
    labels: {
      cluster_name: resp,
      namespace_id: namespace,
    },
  };
}

/**
 * Create a global descriptor.
 *
 * @returns {object}
 */
export function getGlobalDescriptor() {
  return {
    type: 'global',
  };
}

/**
 * Attempt to contact the metadata service and determine,
 * based on request success and environment variables, what type of resource
 * the library is operating on.
 */
export async function getDefaultResource(auth: GoogleAuth) {
  const env = await auth.getEnv();
  switch (env) {
    case 'KUBERNETES_ENGINE':
      return getGKEDescriptor();
    case 'APP_ENGINE':
      return getGAEDescriptor();
    case 'CLOUD_FUNCTIONS':
      return getCloudFunctionDescriptor();
    case 'COMPUTE_ENGINE':
      // Test for compute engine should be done after all the rest -
      // everything runs on top of compute engine.
      return getGCEDescriptor();
    default:
      return getGlobalDescriptor();
  }
}
