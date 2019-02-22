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
import * as callbackify from '@google-cloud/promisify';
import * as arrify from 'arrify';
import * as assert from 'assert';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as through from 'through2';

import {LogSink} from '../src/index';

const {v2} = require('../src');
const PKG = require('../../package.json');

let extended = false;
const fakePaginator = {
  paginator: {
    extend(klass: Function, methods: string|string[]) {
      if (klass.name !== 'Logging') {
        return;
      }
      extended = true;
      methods = arrify(methods);
      assert.deepStrictEqual(methods, ['getEntries', 'getSinks']);
    },
    streamify(methodName: string) {
      return methodName;
    },
  },
};

let googleAuthOverride;
function fakeGoogleAuth() {
  return (googleAuthOverride || util.noop).apply(null, arguments);
}

let isCustomTypeOverride;
let callbackified = false;
let replaceProjectIdTokenOverride;
const fakeUtil = extend({}, util, {
  isCustomType() {
    if (isCustomTypeOverride) {
      return isCustomTypeOverride.apply(null, arguments);
    }
    return false;
  },
});
const fakeCallbackify = {
  callbackifyAll(c: Function, options: callbackify.CallbackifyAllOptions) {
    if (c.name !== 'Logging') {
      return;
    }
    callbackified = true;
    assert.deepStrictEqual(options.exclude, [
      'entry',
      'log',
      'request',
      'sink',
      'setProjectId',
    ]);
  },
};
const fakeProjectify = {
  replaceProjectIdToken(reqOpts: {}) {
    if (replaceProjectIdTokenOverride) {
      return replaceProjectIdTokenOverride.apply(null, arguments);
    }
    return reqOpts;
  },
};

const originalFakeUtil = extend(true, {}, fakeUtil);

function fakeV2() {}

class FakeEntry {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
  static fromApiResponse_() {
    return arguments;
  }
}

class FakeLog {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
}

class FakeSink {
  calledWith_: IArguments;
  constructor() {
    this.calledWith_ = arguments;
  }
}

async function assertThrowsAsync(fn, regExp) {
  let f = () => {};
  try {
    await fn();
  } catch (e) {
    f = () => {
      throw e;
    };
  } finally {
    assert.throws(f, regExp);
  }
}

describe('Logging', () => {
  // tslint:disable-next-line no-any variable-name
  let Logging: any;
  let logging;

  const PROJECT_ID = 'project-id';

  before(() => {
    Logging = proxyquire('../../', {
                '@google-cloud/common-grpc': {
                  util: fakeUtil,
                },
                '@google-cloud/promisify': fakeCallbackify,
                '@google-cloud/paginator': fakePaginator,
                '@google-cloud/projectify': fakeProjectify,
                'google-auth-library': {
                  GoogleAuth: fakeGoogleAuth,
                },
                './log': {Log: FakeLog},
                './entry': {Entry: FakeEntry},
                './sink': {Sink: FakeSink},
                './v2': fakeV2,
              }).Logging;
  });

  beforeEach(() => {
    extend(fakeUtil, originalFakeUtil);
    googleAuthOverride = null;
    isCustomTypeOverride = null;
    replaceProjectIdTokenOverride = null;
    logging = new Logging({
      projectId: PROJECT_ID,
    });
  });

  describe('instantiation', () => {
    const EXPECTED_SCOPES: string[] = [];
    const clientClasses = [
      v2.ConfigServiceV2Client,
      v2.LoggingServiceV2Client,
      v2.MetricsServiceV2Client,
    ];

    for (const clientClass of clientClasses) {
      for (const scope of clientClass.scopes) {
        if (clientClasses.indexOf(scope) === -1) {
          EXPECTED_SCOPES.push(scope);
        }
      }
    }

    it('should extend the correct methods', () => {
      assert(extended);  // See `fakePaginator.extend`
    });

    it('should callbackify all the things', () => {
      assert(callbackified);
    });

    it('should initialize the API object', () => {
      assert.deepStrictEqual(logging.api, {});
    });

    it('should cache a local GoogleAuth instance', () => {
      const fakeGoogleAuthInstance = {};
      const options = {
        a: 'b',
        c: 'd',
      };

      googleAuthOverride = (options_: {}) => {
        assert.deepStrictEqual(
            options_,
            extend(
                {
                  libName: 'gccl',
                  libVersion: PKG.version,
                  scopes: EXPECTED_SCOPES,
                },
                options));
        return fakeGoogleAuthInstance;
      };

      const logging = new Logging(options);
      assert.strictEqual(logging.auth, fakeGoogleAuthInstance);
    });

    it('should localize the options', () => {
      const options = {
        a: 'b',
        c: 'd',
      };

      const logging = new Logging(options);

      assert.notStrictEqual(logging.options, options);

      assert.deepStrictEqual(
          logging.options,
          extend(
              {
                libName: 'gccl',
                libVersion: PKG.version,
                scopes: EXPECTED_SCOPES,
              },
              options));
    });

    it('should set the projectId', () => {
      assert.strictEqual(logging.projectId, PROJECT_ID);
    });

    it('should default the projectId to the token', () => {
      const logging = new Logging({});
      assert.strictEqual(logging.projectId, '{{projectId}}');
    });
  });

  describe('createSink', () => {
    const SINK_NAME = 'name';

    beforeEach(() => {
      logging.configService.createSink = async () => [{}];
    });

    it('should throw if a name is not provided', async () => {
      await assertThrowsAsync(
          async () => await logging.createSink(),
          /A sink name must be provided\./);
    });

    it('should throw if a config object is not provided', async () => {
      await assertThrowsAsync(
          async () => await logging.createSink(SINK_NAME),
          /A sink configuration object must be provided\./);
    });

    it('should set acls for a Dataset destination', async () => {
      const dataset = {};

      const CONFIG = {
        destination: dataset,
      };

      isCustomTypeOverride = (destination, type) => {
        assert.strictEqual(destination, dataset);
        return type === 'bigquery/dataset';
      };

      logging.setAclForDataset_ = async (config) => {
        assert.strictEqual(config, CONFIG);
      };

      await logging.createSink(SINK_NAME, CONFIG);
    });

    it('should set acls for a Topic destination', async () => {
      const topic = {};

      const CONFIG = {
        destination: topic,
      };

      isCustomTypeOverride = (destination, type) => {
        assert.strictEqual(destination, topic);
        return type === 'pubsub/topic';
      };

      logging.setAclForTopic_ = async (config) => {
        assert.strictEqual(config, CONFIG);
      };

      await logging.createSink(SINK_NAME, CONFIG);
    });

    it('should set acls for a Bucket destination', async () => {
      const bucket = {};

      const CONFIG = {
        destination: bucket,
      };

      isCustomTypeOverride = (destination, type) => {
        assert.strictEqual(destination, bucket);
        return type === 'storage/bucket';
      };

      logging.setAclForBucket_ = (config) => {
        assert.strictEqual(config, CONFIG);
      };

      await logging.createSink(SINK_NAME, CONFIG);
    });

    describe('API request', () => {
      it('should call GAX method', async () => {
        const config = {
          a: 'b',
          c: 'd',
        };

        const expectedConfig = extend({}, config, {
          name: SINK_NAME,
        });
        logging.configService.createSink = async (reqOpts, gaxOpts) => {
          const expectedParent = 'projects/' + logging.projectId;
          assert.strictEqual(reqOpts.parent, expectedParent);
          assert.deepStrictEqual(reqOpts.sink, expectedConfig);
          assert.strictEqual(gaxOpts, undefined);
          return [{}];
        };
        await logging.createSink(SINK_NAME, config);
      });

      it('should accept GAX options', async () => {
        const config = {
          a: 'b',
          c: 'd',
          gaxOptions: {},
        };

        logging.configService.createSink = async (reqOpts, gaxOpts) => {
          assert.strictEqual(reqOpts.sink.gaxOptions, undefined);
          assert.strictEqual(gaxOpts, config.gaxOptions);
          return [{}];
        };

        await logging.createSink(SINK_NAME, config);
      });

      describe('error', () => {
        const error = new Error('Error.');
        const apiResponse = undefined;

        beforeEach(() => {
          logging.configService.createSink = async () => {
            throw error;
          };
        });

        it('should exec as Promise and throw an error', async () => {
          logging.configService.createSink = async () => {
            throw error;
          };
          assertThrowsAsync(
              async () => await logging.createSink(SINK_NAME, {}), /Error./);
        });
      });

      describe('success', () => {
        const apiResponse = {
          name: SINK_NAME,
        };

        beforeEach(() => {
          logging.configService.createSink = async () => {
            return [apiResponse as LogSink];
          };
        });

        it('should return a promise with Sink & API response', async () => {
          const sink = {};

          logging.sink = name_ => {
            assert.strictEqual(name_, SINK_NAME);
            return sink;
          };
          logging.configService.createSink = async () => {
            return [apiResponse];
          };
          const [sink_, apiResponse_] = await logging.createSink(SINK_NAME, {});
          assert.strictEqual(sink_, sink);
          assert.strictEqual(sink_.metadata, apiResponse);
          assert.strictEqual(apiResponse_, apiResponse);
        });
      });
    });
  });

  describe('entry', () => {
    const RESOURCE = {};
    const DATA = {};

    it('should return an Entry object', () => {
      const entry = logging.entry(RESOURCE, DATA);
      assert(entry instanceof FakeEntry);
      assert.strictEqual(entry.calledWith_[0], RESOURCE);
      assert.strictEqual(entry.calledWith_[1], DATA);
    });
  });

  describe('getEntries', () => {
    beforeEach(() => {
      logging.setProjectId = async () => {};
    });

    it('should exec without options', async () => {
      logging.loggingService.listLogEntries = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          orderBy: 'timestamp desc',
          resourceNames: ['projects/' + logging.projectId],
        });
        assert.deepStrictEqual(gaxOpts, {
          autoPaginate: undefined,
        });
        return [[]];
      };

      await logging.getEntries();
    });

    it('should accept options', async () => {
      const options = {filter: 'test'};

      logging.loggingService.listLogEntries = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(
            reqOpts, extend(options, {
              filter: 'test',
              orderBy: 'timestamp desc',
              resourceNames: ['projects/' + logging.projectId],
            }));

        assert.deepStrictEqual(gaxOpts, {
          autoPaginate: undefined,
        });
        return [[]];
      };

      await logging.getEntries(options);
    });

    it('should not push the same resourceName again', async () => {
      const options = {
        resourceNames: ['projects/' + logging.projectId],
      };

      logging.loggingService.listLogEntries = async (reqOpts) => {
        assert.deepStrictEqual(reqOpts.resourceNames, [
          'projects/' + logging.projectId,
        ]);
        return [[]];
      };

      await logging.getEntries(options);
    });

    it('should allow overriding orderBy', async () => {
      const options = {
        orderBy: 'timestamp asc',
      };

      logging.loggingService.listLogEntries = async (reqOpts) => {
        assert.deepStrictEqual(reqOpts.orderBy, options.orderBy);
        return [[]];
      };

      await logging.getEntries(options);
    });

    it('should accept GAX options', async () => {
      const options = {
        a: 'b',
        c: 'd',
        gaxOptions: {
          autoPaginate: true,
        },
      };

      logging.loggingService.listLogEntries = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          a: 'b',
          c: 'd',
          orderBy: 'timestamp desc',
          resourceNames: ['projects/' + logging.projectId],
        });
        assert.strictEqual(reqOpts.gaxOptions, undefined);
        assert.deepStrictEqual(gaxOpts, options.gaxOptions);
        return [[]];
      };

      await logging.getEntries(options);
    });

    describe('error', () => {
      const error = new Error('Error.');
      beforeEach(() => {
        logging.loggingService.listLogEntries = async () => {
          throw error;
        };
      });

      it('should reject promise with error', () => {
        logging.getEntries().then(
            util.noop, (err) => assert.strictEqual(err, error));
      });
    });

    describe('success', () => {
      const expectedResponse = [[
        {
          logName: 'syslog',
        },
      ]];

      beforeEach(() => {
        logging.loggingService.listLogEntries = async () => {
          return expectedResponse;
        };
      });

      it('should resolve promise with entries & API resp', async () => {
        const [entries] = await logging.getEntries({});
        assert.strictEqual(entries[0], expectedResponse[0][0]);
      });
    });
  });

  describe('getEntriesStream', () => {
    const OPTIONS = {
      a: 'b',
      c: 'd',
      gaxOptions: {
        a: 'b',
        c: 'd',
      },
    };

    let GAX_STREAM;
    const RESULT = {};

    beforeEach(() => {
      GAX_STREAM = through.obj();
      GAX_STREAM.push(RESULT);
      logging.loggingService.listLogEntriesStream = () => GAX_STREAM;
      logging.setProjectId = async () => {};
    });

    it('should make request once reading', done => {
      logging.loggingService.listLogEntriesStream = (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          resourceNames: ['projects/' + logging.projectId],
          orderBy: 'timestamp desc',
          a: 'b',
          c: 'd',
        });

        assert.deepStrictEqual(gaxOpts, {
          autoPaginate: undefined,
          a: 'b',
          c: 'd',
        });

        setImmediate(done);

        return GAX_STREAM;
      };

      const stream = logging.getEntriesStream(OPTIONS);
      stream.emit('reading');
    });

    it('should convert results from request to Entry', done => {
      const stream = logging.getEntriesStream(OPTIONS);
      stream.on('data', entry => {
        const argsPassedToFromApiResponse_ = entry[0];
        assert.strictEqual(argsPassedToFromApiResponse_, RESULT);
        done();
      });
      stream.emit('reading');
    });

    it('should expose abort function', done => {
      GAX_STREAM.cancel = done;

      const stream = logging.getEntriesStream(OPTIONS);
      stream.emit('reading');
      setImmediate(() => {
        stream.abort();
      });
    });

    it('should not require an options object', () => {
      assert.doesNotThrow(() => {
        const stream = logging.getEntriesStream();
        stream.emit('reading');
      });
    });
  });

  describe('getSinks', () => {
    beforeEach(() => {
      logging.setProjectId = async () => {};
    });

    const OPTIONS = {
      a: 'b',
      c: 'd',
      gaxOptions: {
        a: 'b',
        c: 'd',
      },
    };

    it('should exec without options', async () => {
      logging.configService.listSinks = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(gaxOpts, {autoPaginate: undefined});
        return [[]];
      };

      await logging.getSinks();
    });

    it('should call gax method', async () => {
      logging.configService.listSinks = async (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          parent: 'projects/' + logging.projectId,
          a: 'b',
          c: 'd',
        });

        assert.deepStrictEqual(gaxOpts, {
          autoPaginate: undefined,
          a: 'b',
          c: 'd',
        });
        return [[]];
      };

      await logging.getSinks(OPTIONS);
    });

    describe('error', () => {
      it('should reject promise with error', () => {
        const error = new Error('Error.');

        logging.configService.listSinks = async () => {
          throw error;
        };

        logging.getSinks(OPTIONS).then(
            util.noop, (err) => assert.strictEqual(err, error));
      });
    });

    describe('success', () => {
      const ARGS = [
        [
          {
            name: 'sink-name',
          },
        ],
        {},
      ];

      beforeEach(() => {
        logging.configService.listSinks = async () => {
          return ARGS;
        };
      });

      it('should resolve promise with Logs & API resp', async () => {
        const sinkInstance = {};
        logging.sink = name => {
          assert.strictEqual(name, ARGS[0][0].name);
          return sinkInstance;
        };

        const [sinks] = await logging.getSinks(OPTIONS);
        assert.strictEqual(sinks[0], sinkInstance);
        assert.strictEqual(sinks[0].metadata, ARGS[0][0].metadata);
      });
    });
  });

  describe('getSinksStream', () => {
    const OPTIONS = {
      a: 'b',
      c: 'd',
      gaxOptions: {
        a: 'b',
        c: 'd',
      },
    };

    let GAX_STREAM;
    const RESULT = {
      name: 'sink-name',
    };

    beforeEach(() => {
      GAX_STREAM = through.obj();
      GAX_STREAM.push(RESULT);
      logging.configService.listSinksStream = () => GAX_STREAM;
      logging.setProjectId = async () => {};
    });

    it('should make request once reading', done => {
      logging.configService.listSinksStream = (reqOpts, gaxOpts) => {
        assert.deepStrictEqual(reqOpts, {
          parent: 'projects/' + logging.projectId,
          a: 'b',
          c: 'd',
        });

        assert.deepStrictEqual(gaxOpts, {
          autoPaginate: undefined,
          a: 'b',
          c: 'd',
        });

        setImmediate(done);

        return GAX_STREAM;
      };

      const stream = logging.getSinksStream(OPTIONS);
      stream.emit('reading');
    });

    it('should convert results from request to Sink', done => {
      const stream = logging.getSinksStream(OPTIONS);

      const sinkInstance = {};

      logging.sink = name => {
        assert.strictEqual(name, RESULT.name);
        return sinkInstance;
      };

      stream.on('data', sink => {
        assert.strictEqual(sink, sinkInstance);
        assert.strictEqual(sink.metadata, RESULT);
        done();
      });

      stream.emit('reading');
    });

    it('should expose abort function', done => {
      GAX_STREAM.cancel = done;

      const stream = logging.getSinksStream(OPTIONS);

      stream.emit('reading');

      setImmediate(() => {
        stream.abort();
      });
    });
  });

  describe('log', () => {
    const NAME = 'log-name';

    it('should return a Log object', () => {
      const log = logging.log(NAME);
      assert(log instanceof FakeLog);
      assert.strictEqual(log.calledWith_[0], logging);
      assert.strictEqual(log.calledWith_[1], NAME);
    });
  });

  describe('sink', () => {
    const NAME = 'sink-name';

    it('should return a Log object', () => {
      const sink = logging.sink(NAME);
      assert(sink instanceof FakeSink);
      assert.strictEqual(sink.calledWith_[0], logging);
      assert.strictEqual(sink.calledWith_[1], NAME);
    });
  });

  describe('setAclForBucket_', () => {
    const SINK_NAME = 'name';
    let CONFIG;

    let bucket;

    beforeEach(() => {
      bucket = {
        name: 'bucket-name',
        acl: {
          owners: {
            addGroup: util.noop,
          },
        },
      };

      CONFIG = {
        destination: bucket,
      };
    });

    it('should add cloud-logs as an owner', async () => {
      bucket.acl.owners.addGroup = async (entity) => {
        assert.strictEqual(entity, 'cloud-logs@google.com');
      };

      await logging.setAclForBucket_(CONFIG);
    });

    describe('error', () => {
      const error = new Error('Error.');
      const apiResponse = {};

      beforeEach(() => {
        bucket.acl.owners.addGroup = async () => {
          throw error;
        };
      });

      it('should throw error', async () => {
        assertThrowsAsync(
            async () => await logging.setAclForBucket_(CONFIG), /Error./);
      });
    });

    describe('success', () => {
      beforeEach(() => {
        bucket.acl.owners.addGroup = async () => {};
      });

      it('should set string destination', async () => {
        bucket.acl.owners.addGroup = async () => {
          const expectedDestination = 'storage.googleapis.com/' + bucket.name;
          await logging.setAclForBucket_(CONFIG);
          assert.strictEqual(CONFIG.destination, expectedDestination);
        };
      });
    });
  });

  describe('setAclForDataset_', () => {
    const SINK_NAME = 'name';
    let CONFIG;
    let dataset;

    beforeEach(() => {
      dataset = {
        id: 'dataset-id',
        parent: {
          projectId: PROJECT_ID,
        },
      };

      CONFIG = {
        destination: dataset,
      };
    });

    describe('metadata refresh', () => {
      describe('error', () => {
        const error = new Error('Error.');
        const apiResponse = {};

        beforeEach(() => {
          dataset.getMetadata = async () => {
            throw error;
          };
        });

        it('should throw error', async () => {
          assertThrowsAsync(
              async () => await logging.setAclForDataset_(CONFIG), /Error./);
        });
      });

      describe('success', () => {
        const apiResponse = {
          access: [{}, {}],
        };

        const originalAccess = [].slice.call(apiResponse.access);

        beforeEach(() => {
          dataset.getMetadata = async () => {
            return [apiResponse, apiResponse];
          };
        });

        it('should set the correct metadata', async () => {
          const access = {
            role: 'WRITER',
            groupByEmail: 'cloud-logs@google.com',
          };

          const expectedAccess =
              // tslint:disable-next-line no-any
              ([] as any[]).slice.call(originalAccess).concat(access);

          dataset.setMetadata = async (metadata) => {
            assert.deepStrictEqual(apiResponse.access, originalAccess);
            assert.deepStrictEqual(metadata.access, expectedAccess);
          };

          await logging.setAclForDataset_(CONFIG);
        });

        describe('updating metadata error', () => {
          const error = new Error('Error.');
          const apiResponse = {};

          beforeEach(() => {
            dataset.setMetadata = async () => {
              throw error;
            };
          });

          it('should throw error', async () => {
            assertThrowsAsync(
                async () => await logging.setAclForDataset_(CONFIG), /Error./);
          });
        });

        describe('updating metadata success', () => {
          beforeEach(() => {
            dataset.setMetadata = async () => {};
          });

          it('should set string destination', async () => {
            const expectedDestination = [
              'bigquery.googleapis.com',
              'projects',
              dataset.parent.projectId,
              'datasets',
              dataset.id,
            ].join('/');

            await logging.setAclForDataset_(CONFIG);
            assert.strictEqual(CONFIG.destination, expectedDestination);
          });
        });
      });
    });
  });

  describe('setAclForTopic_', () => {
    const SINK_NAME = 'name';
    let CONFIG;
    let topic;

    beforeEach(() => {
      topic = {
        name: 'topic-name',
        iam: {
          getPolicy: util.noop,
          setPolicy: util.noop,
        },
      };

      CONFIG = {
        destination: topic,
      };
    });

    describe('get policy', () => {
      describe('error', () => {
        const error = new Error('Error.');
        const apiResponse = {};

        beforeEach(() => {
          topic.iam.getPolicy = async () => {
            throw error;
          };
        });

        it('should throw error', async () => {
          assertThrowsAsync(
              async () => await logging.setAclForTopic_(CONFIG), /Error./);
        });
      });

      describe('success', () => {
        const apiResponse = {
          bindings: [{}, {}],
        };

        const originalBindings = [].slice.call(apiResponse.bindings);

        beforeEach(() => {
          topic.iam.getPolicy = async () => {
            return [apiResponse, apiResponse];
          };
        });

        it('should set the correct policy bindings', async () => {
          const binding = {
            role: 'roles/pubsub.publisher',
            members: ['serviceAccount:cloud-logs@system.gserviceaccount.com'],
          };

          // tslint:disable-next-line no-any
          const expectedBindings = ([] as any[]).slice.call(originalBindings);
          expectedBindings.push(binding);

          topic.iam.setPolicy = async (policy) => {
            assert.strictEqual(policy, apiResponse);
            assert.deepStrictEqual(policy.bindings, expectedBindings);
          };

          await logging.setAclForTopic_(CONFIG);
        });

        describe('updating policy error', () => {
          const error = new Error('Error.');
          const apiResponse = {};

          beforeEach(() => {
            topic.iam.setPolicy = async () => {
              throw error;
            };
          });

          it('should throw error', async () => {
            assertThrowsAsync(
                async () => await logging.setAclForTopic_(CONFIG), /Error./);
          });
        });

        describe('updating policy success', () => {
          const apiResponse = {};

          beforeEach(() => {
            topic.iam.setPolicy = async () => {};
          });

          it('should set string destination', async () => {
            const expectedDestination = 'pubsub.googleapis.com/' + topic.name;
            await logging.setAclForTopic_(CONFIG);
            assert.strictEqual(CONFIG.destination, expectedDestination);
          });
        });
      });
    });
  });
});
