/**
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

import * as assert from 'assert';
import BigNumber from 'bignumber.js';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import assertRejects = require('assert-rejects');

let instanceOverride;
const fakeGcpMetadata = {
  instance(path) {
    if (instanceOverride) {
      const override = Array.isArray(instanceOverride) ?
          instanceOverride.find(entry => entry.path === path) :
          instanceOverride;

      if (override.path) {
        assert.strictEqual(path, override.path);
      }

      if (override.errorArg) {
        return Promise.reject(override.errorArg);
      }

      if (override.successArg) {
        return Promise.resolve(override.successArg);
      }
    }

    return Promise.resolve('fake-instance-value');
  },
};

const FAKE_READFILE_ERROR_MESSAGE = 'fake readFile error';
const FAKE_READFILE_CONTENTS = 'fake readFile contents';
let readFileShouldError;
const fakeFS = {
  readFile: (filename, encoding, callback) => {
    setImmediate(() => {
      if (readFileShouldError) {
        callback(new Error(FAKE_READFILE_ERROR_MESSAGE));
      } else {
        callback(null, FAKE_READFILE_CONTENTS);
      }
    });
  },
};

describe('metadata', () => {
  // tslint:disable-next-line no-any variable-name
  let metadataCached: any;
  // tslint:disable-next-line no-any variable-name
  let metadata: any;
  let AUTH;
  const ENV_CACHED = extend({}, process.env);

  before(() => {
    metadata = proxyquire('../src/metadata', {
      'gcp-metadata': fakeGcpMetadata,
      fs: fakeFS,
    });

    metadataCached = extend({}, metadata);
  });

  beforeEach(() => {
    AUTH = {};
    extend(metadata, metadataCached);
    instanceOverride = null;
    readFileShouldError = false;
  });

  afterEach(() => {
    extend(process.env, ENV_CACHED);
  });

  describe('getCloudFunctionDescriptor', () => {
    const FUNCTION_NAME = 'function-name';
    const FUNCTION_REGION = 'function-region';

    beforeEach(() => {
      process.env.FUNCTION_NAME = FUNCTION_NAME;
      process.env.FUNCTION_REGION = FUNCTION_REGION;
    });

    it('should return the correct descriptor', () => {
      assert.deepStrictEqual(metadata.getCloudFunctionDescriptor(), {
        type: 'cloud_function',
        labels: {
          function_name: FUNCTION_NAME,
          region: FUNCTION_REGION,
        },
      });
    });
  });

  describe('getGAEDescriptor', () => {
    const GAE_MODULE_NAME = 'gae-module-name';
    const GAE_SERVICE = 'gae-service';
    const GAE_VERSION = 'gae-version';

    beforeEach(() => {
      process.env.GAE_MODULE_NAME = GAE_MODULE_NAME;
      process.env.GAE_SERVICE = GAE_SERVICE;
      process.env.GAE_VERSION = GAE_VERSION;
    });

    it('should return the correct descriptor', async () => {
      const ZONE_ID = 'cyrodiil-anvil-2';
      const ZONE_FULL = `projects/fake-project/zones/${ZONE_ID}`;
      instanceOverride = {path: 'zone', successArg: ZONE_FULL};
      const descriptor = await metadata.getGAEDescriptor();
      assert.deepStrictEqual(descriptor, {
        type: 'gae_app',
        labels:
            {module_id: GAE_SERVICE, version_id: GAE_VERSION, zone: ZONE_ID},
      });
    });

    it('should use GAE_MODULE_NAME for module_id', async () => {
      delete process.env.GAE_SERVICE;

      const moduleId = (await metadata.getGAEDescriptor()).labels.module_id;
      assert.strictEqual(moduleId, GAE_MODULE_NAME);
    });
  });

  describe('getGKEDescriptor', () => {
    const CLUSTER_NAME = 'gke-cluster-name';

    it('should return the correct descriptor', async () => {
      instanceOverride = {
        path: 'attributes/cluster-name',
        successArg: CLUSTER_NAME,
      };

      const descriptor = await metadata.getGKEDescriptor();
      assert.deepStrictEqual(descriptor, {
        type: 'container',
        labels: {
          cluster_name: CLUSTER_NAME,
          namespace_id: FAKE_READFILE_CONTENTS,
        },
      });
    });

    it('should throw error on failure to acquire metadata', async () => {
      const FAKE_ERROR = new Error();
      instanceOverride = {
        errorArg: FAKE_ERROR,
      };

      assertRejects(metadata.getGKEDescriptor(), (err) => err === FAKE_ERROR);
    });

    it('should throw error when read of namespace file fails', async () => {
      readFileShouldError = true;

      assertRejects(
          metadata.getGKEDescriptor(),
          (err) => err.message.includes(FAKE_READFILE_ERROR_MESSAGE));
    });
  });

  describe('getGlobalDescriptor', () => {
    it('should return the correct descriptor', () => {
      assert.deepStrictEqual(metadata.getGlobalDescriptor(), {
        type: 'global',
      });
    });
  });

  describe('getDefaultResource', () => {
    it('should get the environment from auth client', async () => {
      let called = false;

      const fakeAuth = {
        async getEnv() {
          called = true;
          return null;
        }
      };
      await metadata.getDefaultResource(fakeAuth);
      assert.ok(called);
    });

    describe('environments', () => {
      describe('app engine', () => {
        it('should return correct descriptor', async () => {
          const GAE_MODULE_NAME = 'gae-module-name';
          const GAE_SERVICE = 'gae-service';
          const GAE_VERSION = 'gae-version';
          process.env.GAE_MODULE_NAME = GAE_MODULE_NAME;
          process.env.GAE_SERVICE = GAE_SERVICE;
          process.env.GAE_VERSION = GAE_VERSION;
          const ZONE_ID = 'cyrodiil-anvil-2';
          const ZONE_FULL = `projects/fake-project/zones/${ZONE_ID}`;
          instanceOverride = {path: 'zone', successArg: ZONE_FULL};

          const fakeAuth = {
            async getEnv() {
              return 'APP_ENGINE';
            }
          };

          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepEqual(defaultResource, {
            type: 'gae_app',
            labels: {
              module_id: GAE_SERVICE,
              version_id: GAE_VERSION,
              zone: ZONE_ID
            },
          });
        });
      });

      describe('cloud function', () => {
        it('should return correct descriptor', async () => {
          const FUNCTION_NAME = 'function-name';
          const FUNCTION_REGION = 'function-region';
          process.env.FUNCTION_NAME = FUNCTION_NAME;
          process.env.FUNCTION_REGION = FUNCTION_REGION;

          const fakeAuth = {
            async getEnv() {
              return 'CLOUD_FUNCTIONS';
            }
          };

          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepEqual(defaultResource, {
            type: 'cloud_function',
            labels: {
              function_name: FUNCTION_NAME,
              region: FUNCTION_REGION,
            },
          });
        });
      });

      describe('compute engine', () => {
        it('should return correct descriptor', async () => {
          const INSTANCE_ID = 1234567;
          const ZONE_ID = 'cyrodiil-anvil-2';
          const ZONE_FULL = `projects/fake-project/zones/${ZONE_ID}`;
          instanceOverride = [
            {
              path: 'id',
              successArg: INSTANCE_ID,
            },
            {
              path: 'zone',
              successArg: ZONE_FULL,
            },
          ];

          const fakeAuth = {
            async getEnv() {
              return 'COMPUTE_ENGINE';
            }
          };
          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepStrictEqual(defaultResource, {
            type: 'gce_instance',
            labels: {
              instance_id: INSTANCE_ID.toString(),
              zone: ZONE_ID,
            },
          });
        });

        it('should deal with instance id being a BigNumber', async () => {
          const INSTANCE_ID_STRING = `3279739563200103600`;
          const INSTANCE_ID = new BigNumber(INSTANCE_ID_STRING);
          const ZONE_ID = 'cyrodiil-anvil-2';
          const ZONE_FULL = `projects/fake-project/zones/${ZONE_ID}`;
          instanceOverride = [
            {
              path: 'id',
              successArg: INSTANCE_ID,
            },
            {
              path: 'zone',
              successArg: ZONE_FULL,
            },
          ];

          const fakeAuth = {
            async getEnv() {
              return 'COMPUTE_ENGINE';
            }
          };

          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepStrictEqual(defaultResource, {
            type: 'gce_instance',
            labels: {
              instance_id: INSTANCE_ID_STRING,
              zone: ZONE_ID,
            },
          });
        });
      });

      describe('container engine', () => {
        it('should return correct descriptor', async () => {
          const CLUSTER_NAME = 'overridden-value';
          instanceOverride = {
            path: 'attributes/cluster-name',
            successArg: CLUSTER_NAME,
          };

          const fakeAuth = {
            async getEnv() {
              return 'KUBERNETES_ENGINE';
            }
          };

          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepStrictEqual(defaultResource, {
            type: 'container',
            labels: {
              cluster_name: CLUSTER_NAME,
              namespace_id: FAKE_READFILE_CONTENTS,
            },
          });
        });
      });

      describe('global', () => {
        it('should return correct descriptor', async () => {
          const fakeAuth = {
            async getEnv() {
              return 'NONE';
            }
          };

          const defaultResource = await metadata.getDefaultResource(fakeAuth);
          assert.deepEqual(defaultResource, {
            type: 'global',
          });
        });
      });
    });
  });
});
