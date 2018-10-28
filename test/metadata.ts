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
  let MetadataCached: any;
  // tslint:disable-next-line no-any variable-name
  let Metadata: any;
  let metadata;

  let LOGGING;

  const ENV_CACHED = extend({}, process.env);

  before(() => {
    Metadata = proxyquire('../src/metadata', {
                 'gcp-metadata': fakeGcpMetadata,
                 fs: fakeFS,
               }).Metadata;

    MetadataCached = extend({}, Metadata);
  });

  beforeEach(() => {
    LOGGING = {
      auth: {},
    };
    extend(Metadata, MetadataCached);
    metadata = new Metadata(LOGGING);
    instanceOverride = null;
    readFileShouldError = false;
  });

  afterEach(() => {
    extend(process.env, ENV_CACHED);
  });

  describe('instantiation', () => {
    it('should localize Logging instance', () => {
      assert.strictEqual(metadata.logging, LOGGING);
    });
  });

  describe('getCloudFunctionDescriptor', () => {
    const FUNCTION_NAME = 'function-name';
    const FUNCTION_REGION = 'function-region';

    beforeEach(() => {
      process.env.FUNCTION_NAME = FUNCTION_NAME;
      process.env.FUNCTION_REGION = FUNCTION_REGION;
    });

    it('should return the correct descriptor', () => {
      assert.deepStrictEqual(Metadata.getCloudFunctionDescriptor(), {
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

    it('should return the correct descriptor', () => {
      assert.deepStrictEqual(Metadata.getGAEDescriptor(), {
        type: 'gae_app',
        labels: {
          module_id: GAE_SERVICE,
          version_id: GAE_VERSION,
        },
      });
    });

    it('should use GAE_MODULE_NAME for module_id', () => {
      delete process.env.GAE_SERVICE;

      const moduleId = Metadata.getGAEDescriptor().labels.module_id;
      assert.strictEqual(moduleId, GAE_MODULE_NAME);
    });
  });

  describe('getGKEDescriptor', () => {
    const CLUSTER_NAME = 'gke-cluster-name';

    it('should return the correct descriptor', done => {
      instanceOverride = {
        path: 'attributes/cluster-name',
        successArg: CLUSTER_NAME,
      };

      Metadata.getGKEDescriptor((err, descriptor) => {
        assert.ifError(err);
        assert.deepStrictEqual(descriptor, {
          type: 'container',
          labels: {
            cluster_name: CLUSTER_NAME,
            namespace_id: FAKE_READFILE_CONTENTS,
          },
        });
        done();
      });
    });

    it('should return error on failure to acquire metadata', done => {
      const FAKE_ERROR = new Error();
      instanceOverride = {
        errorArg: FAKE_ERROR,
      };

      Metadata.getGKEDescriptor(err => {
        assert.strictEqual(err, FAKE_ERROR);
        done();
      });
    });

    it('should return error when read of namespace file fails', done => {
      readFileShouldError = true;
      Metadata.getGKEDescriptor(err => {
        assert.ok(err);
        assert.ok(err.message.includes(FAKE_READFILE_ERROR_MESSAGE));
        done();
      });
    });
  });

  describe('getGCEDescriptor', () => {
    const INSTANCE_ID = 'fake-instance-id';
    const ZONE_ID = 'morrowind-vivec-1';
    const ZONE_FULL = `projects/fake-project/zones/${ZONE_ID}`;

    it('should return the correct descriptor', done => {
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

      Metadata.getGCEDescriptor((err, descriptor) => {
        assert.ifError(err);
        assert.deepStrictEqual(descriptor, {
          type: 'gce_instance',
          labels: {
            instance_id: INSTANCE_ID,
            zone: ZONE_ID,
          },
        });
        done();
      });
    });

    it('should return error on failure to acquire metadata', done => {
      const FAKE_ERROR = new Error();
      instanceOverride = {
        errorArg: FAKE_ERROR,
      };

      Metadata.getGCEDescriptor(err => {
        assert.strictEqual(err, FAKE_ERROR);
        done();
      });
    });
  });

  describe('getGlobalDescriptor', () => {
    it('should return the correct descriptor', () => {
      assert.deepStrictEqual(Metadata.getGlobalDescriptor(), {
        type: 'global',
      });
    });
  });

  describe('getDefaultResource', () => {
    it('should get the environment from auth client', done => {
      metadata.logging.auth.getEnv = () => {
        done();
      };

      metadata.getDefaultResource(assert.ifError);
    });

    describe('environments', () => {
      describe('app engine', () => {
        it('should return correct descriptor', done => {
          const DESCRIPTOR = {};

          Metadata.getGAEDescriptor = () => {
            return DESCRIPTOR;
          };

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('APP_ENGINE');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.strictEqual(defaultResource, DESCRIPTOR);
            done();
          });
        });
      });

      describe('cloud function', () => {
        it('should return correct descriptor', done => {
          const DESCRIPTOR = {};

          Metadata.getCloudFunctionDescriptor = () => {
            return DESCRIPTOR;
          };

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('CLOUD_FUNCTIONS');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.strictEqual(defaultResource, DESCRIPTOR);
            done();
          });
        });
      });

      describe('compute engine', () => {
        it('should return correct descriptor', done => {
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

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('COMPUTE_ENGINE');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.deepStrictEqual(defaultResource, {
              type: 'gce_instance',
              labels: {
                instance_id: INSTANCE_ID.toString(),
                zone: ZONE_ID,
              },
            });
            done();
          });
        });

        it('should deal with instance id being a BigNumber', done => {
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

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('COMPUTE_ENGINE');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.deepStrictEqual(defaultResource, {
              type: 'gce_instance',
              labels: {
                instance_id: INSTANCE_ID_STRING,
                zone: ZONE_ID,
              },
            });
            done();
          });
        });
      });

      describe('container engine', () => {
        it('should return correct descriptor', done => {
          const CLUSTER_NAME = 'overridden-value';
          instanceOverride = {
            path: 'attributes/cluster-name',
            successArg: CLUSTER_NAME,
          };

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('KUBERNETES_ENGINE');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.deepStrictEqual(defaultResource, {
              type: 'container',
              labels: {
                cluster_name: CLUSTER_NAME,
                namespace_id: FAKE_READFILE_CONTENTS,
              },
            });
            done();
          });
        });
      });

      describe('global', () => {
        it('should return correct descriptor', done => {
          const DESCRIPTOR = {};

          Metadata.getGlobalDescriptor = () => {
            return DESCRIPTOR;
          };

          metadata.logging.auth.getEnv = () => {
            return Promise.resolve('NONE');
          };

          metadata.getDefaultResource((err, defaultResource) => {
            assert.ifError(err);
            assert.strictEqual(defaultResource, DESCRIPTOR);
            done();
          });
        });
      });
    });
  });
});
