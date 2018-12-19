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
  promisifyAll(c, options) {
    if (c.name !== 'Log') {
      return;
    }
    promisifed = true;
    assert.deepStrictEqual(options.exclude, ['entry']);
  },
});

import {Entry} from '../src';
import {EntryJson} from '../src/entry';

const originalGetDefaultResource = async () => {
  return 'very-fake-resource';
};

const fakeMetadata = {
  getDefaultResource: originalGetDefaultResource
};

describe('Log', () => {
  // tslint:disable-next-line no-any variable-name
  let Log: any;
  let log;

  const PROJECT_ID = 'project-id';
  const LOG_NAME = 'escaping/required/for/this/log-name';
  const LOG_NAME_ENCODED = encodeURIComponent(LOG_NAME);
  const LOG_NAME_FORMATTED = [
    'projects',
    PROJECT_ID,
    'logs',
    LOG_NAME_ENCODED,
  ].join('/');

  let LOGGING;

  let assignSeverityToEntriesOverride: Function|null = null;

  before(() => {
    Log = proxyquire('../src/log', {
            '@google-cloud/promisify': fakePromisify,
            './entry': {Entry},
            './metadata': fakeMetadata,
          }).Log;
    const assignSeverityToEntries_ = Log.assignSeverityToEntries_;
    Log.assignSeverityToEntries_ = (...args) =>
        (assignSeverityToEntriesOverride || assignSeverityToEntries_)
            .apply(null, args);
  });

  beforeEach(() => {
    assignSeverityToEntriesOverride = null;

    LOGGING = {
      projectId: PROJECT_ID,
      entry: util.noop,
      request: util.noop,
    };

    log = new Log(LOGGING, LOG_NAME_FORMATTED);
  });

  describe('instantiation', () => {
    it('should promisify all the things', () => {
      assert(promisifed);
    });

    it('should localize the escaped name', () => {
      assert.strictEqual(log.name, LOG_NAME_ENCODED);
    });

    it('should localize removeCircular_ to default value', () => {
      assert.strictEqual(log.removeCircular_, false);
    });

    it('should localize the formatted name', () => {
      const formattedName = 'formatted-name';

      const formatName_ = Log.formatName_;
      Log.formatName_ = () => {
        Log.formatName_ = formatName_;
        return formattedName;
      };

      const log = new Log(LOGGING, LOG_NAME_FORMATTED);

      assert.strictEqual(log.formattedName_, formattedName);
    });

    it('should accept and localize options.removeCircular', () => {
      const options = {removeCircular: true};
      const log = new Log(LOGGING, LOG_NAME_FORMATTED, options);
      assert.strictEqual(log.removeCircular_, true);
    });

    it('should localize the Logging instance', () => {
      assert.strictEqual(log.logging, LOGGING);
    });

    it('should localize the name', () => {
      assert.strictEqual(log.name, LOG_NAME_FORMATTED.split('/').pop());
    });
  });

  describe('assignSeverityToEntries_', () => {
    const circular = {} as {circular: {}};
    circular.circular = circular;
    const ENTRIES = [{data: {a: 'b'}}, {data: {c: 'd'}}, {data: {e: circular}}];
    const SEVERITY = 'severity';

    it('should assign severity to a single entry', () => {
      assert.deepStrictEqual(
          Log.assignSeverityToEntries_(ENTRIES[0], SEVERITY)
              .map(x => x.metadata)
              .map(x => x.severity),
          [SEVERITY]);
    });

    it('should assign severity property to multiple entries', () => {
      assert.deepStrictEqual(
          Log.assignSeverityToEntries_(ENTRIES, SEVERITY)
              .map(x => x.metadata)
              .map(x => x.severity),
          [SEVERITY, SEVERITY, SEVERITY]);
    });

    it('should not affect original array', () => {
      const originalEntries = ENTRIES.map(x => extend({}, x));
      Log.assignSeverityToEntries_(originalEntries, SEVERITY);
      assert.deepStrictEqual(originalEntries, ENTRIES);
    });
  });

  describe('formatName_', () => {
    const PROJECT_ID = 'project-id';
    const NAME = 'log-name';

    const EXPECTED = 'projects/' + PROJECT_ID + '/logs/' + NAME;

    it('should properly format the name', () => {
      assert.strictEqual(Log.formatName_(PROJECT_ID, NAME), EXPECTED);
    });

    it('should encode a name that requires it', () => {
      const name = 'appengine/logs';
      const expectedName = 'projects/' + PROJECT_ID + '/logs/appengine%2Flogs';

      assert.strictEqual(Log.formatName_(PROJECT_ID, name), expectedName);
    });

    it('should not encode a name that does not require it', () => {
      const name = 'appengine%2Flogs';
      const expectedName = 'projects/' + PROJECT_ID + '/logs/' + name;

      assert.strictEqual(Log.formatName_(PROJECT_ID, name), expectedName);
    });
  });

  describe('delete', () => {
    it('should accept gaxOptions', done => {
      log.logging.request = (config, callback) => {
        assert.strictEqual(config.client, 'LoggingServiceV2Client');
        assert.strictEqual(config.method, 'deleteLog');

        assert.deepStrictEqual(config.reqOpts, {
          logName: log.formattedName_,
        });

        assert.deepStrictEqual(config.gaxOpts, {});

        callback();  // done()
      };

      log.delete(done);
    });

    it('should accept gaxOptions', done => {
      const gaxOptions = {};

      log.logging.request = config => {
        assert.strictEqual(config.gaxOpts, gaxOptions);
        done();
      };

      log.delete(gaxOptions, assert.ifError);
    });
  });

  describe('entry', () => {
    it('should return an entry from Logging', () => {
      const metadata = {
        val: true,
      };
      const data = {};

      const entryObject = {};

      log.logging.entry = (metadata_, data_) => {
        assert.deepStrictEqual(metadata_, metadata);
        assert.strictEqual(data_, data);
        return entryObject;
      };

      const entry = log.entry(metadata, data);
      assert.strictEqual(entry, entryObject);
    });

    it('should assume one argument means data', done => {
      const data = {};

      log.logging.entry = (metadata, data_) => {
        assert.strictEqual(data_, data);
        done();
      };

      log.entry(data);
    });
  });

  describe('getEntries', () => {
    const EXPECTED_OPTIONS = {
      filter: 'logName="' + LOG_NAME_FORMATTED + '"',
    };

    it('should call Logging getEntries with defaults', done => {
      log.logging.getEntries = (options, callback) => {
        assert.deepStrictEqual(options, EXPECTED_OPTIONS);
        callback();  // done()
      };

      log.getEntries(done);
    });

    it('should allow overriding the options', done => {
      const options = {
        custom: true,
        filter: 'custom filter',
      };

      log.logging.getEntries = (options_, callback) => {
        assert.deepStrictEqual(options_, extend({}, EXPECTED_OPTIONS, options));
        callback();  // done()
      };

      log.getEntries(options, done);
    });
  });

  describe('getEntriesStream', () => {
    const fakeStream = {};
    const EXPECTED_OPTIONS = {
      filter: 'logName="' + LOG_NAME_FORMATTED + '"',
    };

    it('should call Logging getEntriesStream with defaults', done => {
      log.logging.getEntriesStream = options => {
        assert.deepStrictEqual(options, EXPECTED_OPTIONS);
        setImmediate(done);
        return fakeStream;
      };

      const stream = log.getEntriesStream();
      assert.strictEqual(stream, fakeStream);
    });

    it('should allow overriding the options', done => {
      const options = {
        custom: true,
        filter: 'custom filter',
      };

      log.logging.getEntriesStream = options_ => {
        assert.deepStrictEqual(options_, extend({}, EXPECTED_OPTIONS, options));
        setImmediate(done);
        return fakeStream;
      };

      const stream = log.getEntriesStream(options);
      assert.strictEqual(stream, fakeStream);
    });
  });

  describe('write', () => {
    const ENTRY = {};
    const OPTIONS = {};
    const FAKE_RESOURCE = 'fake-resource';

    beforeEach(() => {
      log.decorateEntries_ = entries => {
        return entries;
      };
      fakeMetadata.getDefaultResource = async () => {
        return FAKE_RESOURCE;
      };
    });

    it('should forward options.resource to request', done => {
      const CUSTOM_RESOURCE = 'custom-resource';
      const optionsWithResource = extend({}, OPTIONS, {
        resource: CUSTOM_RESOURCE,
      });

      log.logging.request = (config, callback) => {
        assert.strictEqual(config.client, 'LoggingServiceV2Client');
        assert.strictEqual(config.method, 'writeLogEntries');

        assert.deepStrictEqual(config.reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: CUSTOM_RESOURCE,
        });

        assert.strictEqual(config.gaxOpts, undefined);

        callback();
      };

      log.write(ENTRY, optionsWithResource, done);
    });

    it('should transform camelcase label keys to snake case', done => {
      const CUSTOM_RESOURCE = {
        labels: {
          camelCaseKey: 'camel-case-key-val',
        },
      };
      const EXPECTED_RESOURCE = {
        labels: {
          camel_case_key: 'camel-case-key-val',
        },
      };
      const optionsWithResource = extend({}, OPTIONS, {
        resource: CUSTOM_RESOURCE,
      });

      log.logging.request = (config, callback) => {
        assert.strictEqual(config.client, 'LoggingServiceV2Client');
        assert.strictEqual(config.method, 'writeLogEntries');

        assert.deepStrictEqual(config.reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: EXPECTED_RESOURCE,
        });

        assert.strictEqual(config.gaxOpts, undefined);

        callback();
      };

      log.write(ENTRY, optionsWithResource, done);
    });

    it('should make the correct API request', done => {
      log.logging.request = (config, callback) => {
        assert.strictEqual(config.client, 'LoggingServiceV2Client');
        assert.strictEqual(config.method, 'writeLogEntries');

        assert.deepStrictEqual(config.reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: FAKE_RESOURCE,
        });

        assert.strictEqual(config.gaxOpts, undefined);

        callback();
      };

      log.write(ENTRY, OPTIONS, done);
    });

    it('should arrify & decorate the entries', done => {
      const decoratedEntries = [];

      log.decorateEntries_ = entries => {
        assert.strictEqual(entries[0], ENTRY);
        return decoratedEntries;
      };

      log.logging.request = config => {
        assert.strictEqual(config.reqOpts.entries, decoratedEntries);
        done();
      };

      log.write(ENTRY, OPTIONS, assert.ifError);
    });

    it('should not require options', done => {
      log.logging.request = (config, callback) => {
        callback();  // done()
      };

      log.write(ENTRY, done);
    });
  });

  describe('severity shortcuts', () => {
    const ENTRY = {};
    const LABELS = [];

    beforeEach(() => {
      log.write = util.noop;
    });

    describe('alert', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ALERT');
          done();
        };
        log.alert(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };
        log.alert(ENTRY, LABELS, done);
      });
    });

    describe('critical', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'CRITICAL');

          done();
        };

        log.critical(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };
        log.critical(ENTRY, LABELS, done);
      });
    });

    describe('debug', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'DEBUG');

          done();
        };

        log.debug(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };
        log.debug(ENTRY, LABELS, done);
      });
    });

    describe('emergency', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'EMERGENCY');

          done();
        };

        log.emergency(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };
        log.emergency(ENTRY, LABELS, done);
      });
    });

    describe('error', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ERROR');
          done();
        };
        log.error(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };

        log.error(ENTRY, LABELS, done);
      });
    });

    describe('info', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'INFO');

          done();
        };

        log.info(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };

        log.info(ENTRY, LABELS, done);
      });
    });

    describe('notice', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'NOTICE');

          done();
        };

        log.notice(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };

        log.notice(ENTRY, LABELS, done);
      });
    });

    describe('warning', () => {
      it('should format the entries', done => {
        assignSeverityToEntriesOverride = (entries, severity) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'WARNING');

          done();
        };

        log.warning(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', done => {
        const assignedEntries = [];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = (entry, labels, callback) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback();  // done()
        };
        log.warning(ENTRY, LABELS, done);
      });
    });
  });

  describe('decorateEntries_', () => {
    const toJSONResponse = {};

    function FakeEntry() {}
    FakeEntry.prototype.toJSON = () => toJSONResponse;

    beforeEach(() => {
      log.entry = () => new FakeEntry();
    });

    it('should create an Entry object if one is not provided', () => {
      const entry = {};

      log.entry = entry_ => {
        assert.strictEqual(entry_, entry);
        return new FakeEntry();
      };

      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
    });

    it('should get JSON format from Entry object', () => {
      log.entry = () => {
        throw new Error('should not be called');
      };
      const entry = new Entry();
      entry.toJSON = () => toJSONResponse as {} as EntryJson;
      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
    });

    it('should pass log.removeCircular to toJSON', done => {
      log.removeCircular_ = true;

      const entry = new Entry();
      entry.toJSON = options_ => {
        assert.deepStrictEqual(options_, {removeCircular: true});
        setImmediate(done);
        return {} as EntryJson;
      };

      log.decorateEntries_([entry]);
    });

    it('should throw error from serialization', () => {
      const error = new Error('Error.');

      const entry = new Entry();
      entry.toJSON = () => {
        throw error;
      };

      try {
        log.decorateEntries_([entry]);
      } catch (err) {
        assert.strictEqual(err, error);
      }
    });
  });
});
