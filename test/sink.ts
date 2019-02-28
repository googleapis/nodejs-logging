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

import {util} from '@google-cloud/common-grpc';
import * as promisify from '@google-cloud/promisify';
import * as assert from 'assert';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';

let promisifed = false;
const fakePromisify = extend({}, promisify, {
  promisifyAll(c) {
    if (c.name === 'Sink') {
      promisifed = true;
    }
  },
});

describe('Sink', () => {
  // tslint:disable-next-line no-any variable-name
  let Sink: any;
  let sink;

  const LOGGING = {
    createSink: util.noop,
    projectId: 'project-id',
  };
  const SINK_NAME = 'sink-name';

  before(() => {
    Sink = proxyquire('../src/sink', {
             '@google-cloud/promisify': fakePromisify,
           }).Sink;
  });

  beforeEach(() => {
    sink = new Sink(LOGGING, SINK_NAME);
  });

  describe('instantiation', () => {
    it('should promisify all the things', () => {
      assert(promisifed);
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
          'projects/' + LOGGING.projectId + '/sinks/' + SINK_NAME);
    });
  });

  describe('create', () => {
    it('should call parent createSink', done => {
      const config = {};

      sink.logging.createSink = (name, config_, callback) => {
        assert.strictEqual(name, sink.name);
        assert.strictEqual(config_, config);
        callback();  // done()
      };

      sink.create(config, done);
    });
  });

  describe('delete', () => {
    it('should accept gaxOptions', done => {
      sink.logging.request = (config, callback) => {
        assert.strictEqual(config.client, 'ConfigServiceV2Client');
        assert.strictEqual(config.method, 'deleteSink');

        assert.deepStrictEqual(config.reqOpts, {
          sinkName: sink.formattedName_,
        });

        assert.deepStrictEqual(config.gaxOpts, {});

        callback();  // done()
      };

      sink.delete(done);
    });

    it('should accept gaxOptions', done => {
      const gaxOptions = {};

      sink.logging.request = config => {
        assert.strictEqual(config.gaxOpts, gaxOptions);
        done();
      };

      sink.delete(gaxOptions, assert.ifError);
    });
  });

  describe('getMetadata', () => {
    it('should make correct request', done => {
      sink.logging.request = config => {
        assert.strictEqual(config.client, 'ConfigServiceV2Client');
        assert.strictEqual(config.method, 'getSink');

        assert.deepStrictEqual(config.reqOpts, {
          sinkName: sink.formattedName_,
        });

        assert.deepStrictEqual(config.gaxOpts, {});

        done();
      };

      sink.getMetadata(assert.ifError);
    });

    it('should accept gaxOptions', done => {
      const gaxOptions = {};

      sink.logging.request = config => {
        assert.strictEqual(config.gaxOpts, gaxOptions);
        done();
      };

      sink.delete(gaxOptions, assert.ifError);
    });

    it('should update metadata', done => {
      const metadata = {};

      sink.logging.request = (config, callback) => {
        callback(null, metadata);
      };

      sink.getMetadata(() => {
        assert.strictEqual(sink.metadata, metadata);
        done();
      });
    });

    it('should execute callback with original arguments', done => {
      const ARGS = [{}, {}, {}];

      sink.logging.request = (config, callback) => {
        callback.apply(null, ARGS);
      };

      sink.getMetadata((...args) => {
        assert.deepStrictEqual(args, ARGS);
        done();
      });
    });
  });

  describe('setFilter', () => {
    const FILTER = 'filter';

    it('should call set metadata', done => {
      sink.setMetadata = (metadata, callback) => {
        assert.strictEqual(metadata.filter, FILTER);
        callback();  // done()
      };

      sink.setFilter(FILTER, done);
    });
  });

  describe('setMetadata', () => {
    const METADATA = {a: 'b', c: 'd'};

    beforeEach(() => {
      sink.getMetadata = (callback) => {
        callback(null, METADATA);
      };
    });

    it('should refresh the metadata', done => {
      sink.getMetadata = () => {
        done();
      };

      sink.setMetadata(METADATA, assert.ifError);
    });

    it('should exec callback with error from refresh', done => {
      const error = new Error('Error.');

      sink.getMetadata = (callback) => {
        callback(error);
      };

      sink.setMetadata(METADATA, (err) => {
        assert.strictEqual(err, error);
        done();
      });
    });

    it('should make the correct request', done => {
      const currentMetadata = {a: 'a', e: 'e'};

      sink.getMetadata = (callback) => {
        callback(null, currentMetadata);
      };

      sink.logging.request = (config) => {
        assert.strictEqual(config.client, 'ConfigServiceV2Client');
        assert.strictEqual(config.method, 'updateSink');

        assert.deepStrictEqual(config.reqOpts, {
          sinkName: sink.formattedName_,
          sink: extend({}, currentMetadata, METADATA),
        });

        assert.strictEqual(config.gaxOpts, undefined);

        done();
      };

      sink.setMetadata(METADATA, assert.ifError);
    });

    it('should accept gaxOptions', done => {
      const metadata = extend({}, METADATA, {
        gaxOptions: {},
      });

      sink.logging.request = (config) => {
        assert.strictEqual(config.reqOpts.sink.gaxOptions, undefined);
        assert.strictEqual(config.gaxOpts, metadata.gaxOptions);
        done();
      };

      sink.setMetadata(metadata, assert.ifError);
    });

    it('should update metadata', done => {
      const metadata = {};

      sink.logging.request = (config, callback) => {
        callback(null, metadata);
      };

      sink.setMetadata(metadata, () => {
        assert.strictEqual(sink.metadata, metadata);
        done();
      });
    });

    it('should execute callback with original arguments', done => {
      const ARGS = [{}, {}, {}];

      sink.logging.request = (config, callback) => {
        callback.apply(null, ARGS);
      };

      sink.setMetadata(METADATA, (...args) => {
        assert.deepStrictEqual(args, ARGS);
        done();
      });
    });
  });
});
