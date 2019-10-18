/**
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

import * as callbackify from '@google-cloud/promisify';
import * as assert from 'assert';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';

let callbackified = false;
const fakeCallbackify = extend({}, callbackify, {
  callbackifyAll(c) {
    if (c.name === 'Sink') {
      callbackified = true;
    }
  },
});

describe('Sink', () => {
  // tslint:disable-next-line no-any variable-name
  let Sink: any;
  let sink;

  const PROJECT_ID = 'project-id';

  const LOGGING = {
    createSink: () => {},
    projectId: '{{projectId}}',
    auth: () => {},
    configService: () => {},
  };
  const SINK_NAME = 'sink-name';

  before(() => {
    Sink = proxyquire('../src/sink', {
      '@google-cloud/promisify': fakeCallbackify,
    }).Sink;
  });

  beforeEach(() => {
    sink = new Sink(LOGGING, SINK_NAME);
  });

  describe('instantiation', () => {
    it('should promisify all the things', () => {
      assert(callbackified);
    });

    it('should localize Logging instance', () => {
      assert.strictEqual(sink.logging, LOGGING);
    });

    it('should localize the name', () => {
      assert.strictEqual(sink.name, SINK_NAME);
    });

    it('should localize the formatted name', () => {
      assert.strictEqual(
        sink.formattedName_,
        'projects/' + LOGGING.projectId + '/sinks/' + SINK_NAME
      );
    });
  });

  describe('create', () => {
    it('should call parent createSink', async () => {
      const config = {};

      sink.logging.createSink = async (name, config_) => {
        assert.strictEqual(name, sink.name);
        assert.strictEqual(config_, config);
      };

      await sink.create(config);
    });
  });

  describe('delete', () => {
    it('should execute gax method', async () => {
      sink.logging.auth.getProjectId = async () => PROJECT_ID;
      sink.logging.configService.deleteSink = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          sinkName: sink.formattedName_,
        });
        assert.strictEqual(gaxOpts, undefined);
      };

      await sink.delete();
    });

    it('should accept gaxOptions', async () => {
      const gaxOptions = {};

      sink.logging.getProjectId = async () => {};
      sink.logging.configService.deleteSink = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(gaxOpts, gaxOptions);
      };

      await sink.delete(gaxOptions);
    });
  });

  describe('getMetadata', () => {
    beforeEach(() => {
      sink.logging.auth.getProjectId = async () => PROJECT_ID;
    });
    it('should execute gax method', async () => {
      sink.logging.configService.getSink = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          sinkName: sink.formattedName_,
        });
        assert.strictEqual(gaxOpts, undefined);
        return [];
      };

      await sink.getMetadata();
    });

    it('should accept gaxOptions', async () => {
      const gaxOptions = {};

      sink.logging.configService.getSink = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(gaxOpts, gaxOptions);
        return [];
      };

      await sink.getMetadata(gaxOptions);
    });

    it('should update metadata', async () => {
      const metadata = {};

      sink.logging.configService.getSink = async (reqOpts, gaxOpts) => {
        return [metadata];
      };

      await sink.getMetadata();
      assert.strictEqual(sink.metadata, metadata);
    });

    it('should return original arguments', async () => {
      const ARGS = [{}, {}, {}];

      sink.logging.configService.getSink = async (reqOpts, gaxOpts) => {
        return [ARGS];
      };

      const [args] = await sink.getMetadata();
      assert.deepStrictEqual(args, ARGS);
    });
  });

  describe('setFilter', () => {
    const FILTER = 'filter';

    it('should call set metadata', async () => {
      sink.setMetadata = async metadata => {
        assert.strictEqual(metadata.filter, FILTER);
        return [];
      };

      await sink.setFilter(FILTER);
    });
  });

  describe('setMetadata', () => {
    const METADATA = {a: 'b', c: 'd'};

    beforeEach(() => {
      sink.getMetadata = async () => {
        return [METADATA];
      };

      sink.logging.auth.getProjectId = async () => PROJECT_ID;
    });

    it('should refresh the metadata', async () => {
      sink.getMetadata = () => {
        return [];
      };

      sink.logging.configService.updateSink = async (reqOpts, gaxOpts) => {
        return [METADATA];
      };

      assert.strictEqual(sink.metadata, undefined);
      await sink.setMetadata(METADATA);
      assert.deepStrictEqual(sink.metadata, METADATA);
    });

    it('should throw the error from refresh', () => {
      const error = new Error('Error.');

      sink.getMetadata = async () => {
        throw error;
      };

      sink
        .setMetadata(METADATA)
        .then(() => {}, err => assert.strictEqual(err, error));
    });

    it('should execute gax method', async () => {
      const currentMetadata = {a: 'a', e: 'e'};

      sink.getMetadata = async () => {
        return [currentMetadata];
      };

      sink.logging.configService.updateSink = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          sinkName: sink.formattedName_,
          sink: extend({}, currentMetadata, METADATA),
        });
        assert.strictEqual(gaxOpts, undefined);
        return [];
      };

      await sink.setMetadata(METADATA);
    });

    it('should accept gaxOptions', async () => {
      const metadata = extend({}, METADATA, {
        gaxOptions: {},
      });

      sink.logging.configService.updateSink = async (reqOpts, gaxOpts) => {
        assert.strictEqual(reqOpts.sink.gaxOptions, undefined);
        assert.strictEqual(gaxOpts, metadata.gaxOptions);
        return [];
      };
      await sink.setMetadata(metadata);
    });

    it('should update metadata', async () => {
      const metadata = {};

      sink.logging.configService.updateSink = async (reqOpts, gaxOpts) => {
        return [metadata];
      };

      await sink.setMetadata(metadata);
      assert.strictEqual(sink.metadata, metadata);
    });

    it('should return callback with original arguments', async () => {
      const ARGS = [{}, {}, {}];

      sink.logging.configService.updateSink = async (reqOpts, gaxOpts) => {
        return [ARGS];
      };

      const [args] = await sink.setMetadata(METADATA);
      assert.deepStrictEqual(args, ARGS);
    });
  });
});
