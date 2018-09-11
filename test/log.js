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

'use strict';

const assert = require('assert');
const extend = require('extend');
const prop = require('propprop');
const proxyquire = require('proxyquire');
const {util} = require('@google-cloud/common-grpc');
const promisify = require('@google-cloud/promisify');

let promisifed = false;
const fakePromisify = extend({}, promisify, {
  promisifyAll: function(Class, options) {
    if (Class.name !== 'Log') {
      return;
    }
    promisifed = true;
    assert.deepStrictEqual(options.exclude, ['entry']);
  },
});

const {Entry} = require('../src');

function FakeMetadata() {
  this.calledWith_ = arguments;
}

describe('Log', function() {
  let Log;
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

  let assignSeverityToEntriesOverride = null;

  before(function() {
    Log = proxyquire('../src/log', {
      '@google-cloud/promisify': fakePromisify,
      './entry': {Entry: Entry},
      './metadata': {Metadata: FakeMetadata},
    }).Log;
    const assignSeverityToEntries_ = Log.assignSeverityToEntries_;
    Log.assignSeverityToEntries_ = function() {
      return (
        assignSeverityToEntriesOverride || assignSeverityToEntries_
      ).apply(null, arguments);
    };
  });

  beforeEach(function() {
    assignSeverityToEntriesOverride = null;

    LOGGING = {
      projectId: PROJECT_ID,
      entry: util.noop,
      request: util.noop,
    };

    log = new Log(LOGGING, LOG_NAME_FORMATTED);
  });

  describe('instantiation', function() {
    it('should promisify all the things', function() {
      assert(promisifed);
    });

    it('should localize the escaped name', function() {
      assert.strictEqual(log.name, LOG_NAME_ENCODED);
    });

    it('should localize removeCircular_ to default value', function() {
      assert.strictEqual(log.removeCircular_, false);
    });

    it('should localize the formatted name', function() {
      const formattedName = 'formatted-name';

      const formatName_ = Log.formatName_;
      Log.formatName_ = function() {
        Log.formatName_ = formatName_;
        return formattedName;
      };

      const log = new Log(LOGGING, LOG_NAME_FORMATTED);

      assert.strictEqual(log.formattedName_, formattedName);
    });

    it('should localize an instance of Metadata', function() {
      assert(log.metadata_ instanceof FakeMetadata);
      assert.strictEqual(log.metadata_.calledWith_[0], LOGGING);
    });

    it('should accept and localize options.removeCircular', function() {
      const options = {removeCircular: true};
      const log = new Log(LOGGING, LOG_NAME_FORMATTED, options);
      assert.strictEqual(log.removeCircular_, true);
    });

    it('should localize the Logging instance', function() {
      assert.strictEqual(log.logging, LOGGING);
    });

    it('should localize the name', function() {
      assert.strictEqual(log.name, LOG_NAME_FORMATTED.split('/').pop());
    });
  });

  describe('assignSeverityToEntries_', function() {
    const circular = {};
    circular.circular = circular;

    const ENTRIES = [{data: {a: 'b'}}, {data: {c: 'd'}}, {data: {e: circular}}];

    const SEVERITY = 'severity';

    it('should assign severity to a single entry', function() {
      assert.deepStrictEqual(
        Log.assignSeverityToEntries_(ENTRIES[0], SEVERITY)
          .map(prop('metadata'))
          .map(prop('severity')),
        [SEVERITY]
      );
    });

    it('should assign severity property to multiple entries', function() {
      assert.deepStrictEqual(
        Log.assignSeverityToEntries_(ENTRIES, SEVERITY)
          .map(prop('metadata'))
          .map(prop('severity')),
        [SEVERITY, SEVERITY, SEVERITY]
      );
    });

    it('should not affect original array', function() {
      const originalEntries = ENTRIES.map(x => extend({}, x));
      Log.assignSeverityToEntries_(originalEntries, SEVERITY);
      assert.deepStrictEqual(originalEntries, ENTRIES);
    });
  });

  describe('formatName_', function() {
    const PROJECT_ID = 'project-id';
    const NAME = 'log-name';

    const EXPECTED = 'projects/' + PROJECT_ID + '/logs/' + NAME;

    it('should properly format the name', function() {
      assert.strictEqual(Log.formatName_(PROJECT_ID, NAME), EXPECTED);
    });

    it('should encode a name that requires it', function() {
      const name = 'appengine/logs';
      const expectedName = 'projects/' + PROJECT_ID + '/logs/appengine%2Flogs';

      assert.strictEqual(Log.formatName_(PROJECT_ID, name), expectedName);
    });

    it('should not encode a name that does not require it', function() {
      const name = 'appengine%2Flogs';
      const expectedName = 'projects/' + PROJECT_ID + '/logs/' + name;

      assert.strictEqual(Log.formatName_(PROJECT_ID, name), expectedName);
    });
  });

  describe('delete', function() {
    it('should accept gaxOptions', function(done) {
      log.logging.request = function(config, callback) {
        assert.strictEqual(config.client, 'LoggingServiceV2Client');
        assert.strictEqual(config.method, 'deleteLog');

        assert.deepStrictEqual(config.reqOpts, {
          logName: log.formattedName_,
        });

        assert.deepStrictEqual(config.gaxOpts, {});

        callback(); // done()
      };

      log.delete(done);
    });

    it('should accept gaxOptions', function(done) {
      const gaxOptions = {};

      log.logging.request = function(config) {
        assert.strictEqual(config.gaxOpts, gaxOptions);
        done();
      };

      log.delete(gaxOptions, assert.ifError);
    });
  });

  describe('entry', function() {
    it('should return an entry from Logging', function() {
      const metadata = {
        val: true,
      };
      const data = {};

      const entryObject = {};

      log.logging.entry = function(metadata_, data_) {
        assert.deepStrictEqual(metadata_, metadata);
        assert.strictEqual(data_, data);
        return entryObject;
      };

      const entry = log.entry(metadata, data);
      assert.strictEqual(entry, entryObject);
    });

    it('should assume one argument means data', function(done) {
      const data = {};

      log.logging.entry = function(metadata, data_) {
        assert.strictEqual(data_, data);
        done();
      };

      log.entry(data);
    });
  });

  describe('getEntries', function() {
    const EXPECTED_OPTIONS = {
      filter: 'logName="' + LOG_NAME_FORMATTED + '"',
    };

    it('should call Logging getEntries with defaults', function(done) {
      log.logging.getEntries = function(options, callback) {
        assert.deepStrictEqual(options, EXPECTED_OPTIONS);
        callback(); // done()
      };

      log.getEntries(done);
    });

    it('should allow overriding the options', function(done) {
      const options = {
        custom: true,
        filter: 'custom filter',
      };

      log.logging.getEntries = function(options_, callback) {
        assert.deepStrictEqual(options_, extend({}, EXPECTED_OPTIONS, options));
        callback(); // done()
      };

      log.getEntries(options, done);
    });
  });

  describe('getEntriesStream', function() {
    const fakeStream = {};
    const EXPECTED_OPTIONS = {
      filter: 'logName="' + LOG_NAME_FORMATTED + '"',
    };

    it('should call Logging getEntriesStream with defaults', function(done) {
      log.logging.getEntriesStream = function(options) {
        assert.deepStrictEqual(options, EXPECTED_OPTIONS);
        setImmediate(done);
        return fakeStream;
      };

      const stream = log.getEntriesStream();
      assert.strictEqual(stream, fakeStream);
    });

    it('should allow overriding the options', function(done) {
      const options = {
        custom: true,
        filter: 'custom filter',
      };

      log.logging.getEntriesStream = function(options_) {
        assert.deepStrictEqual(options_, extend({}, EXPECTED_OPTIONS, options));
        setImmediate(done);
        return fakeStream;
      };

      const stream = log.getEntriesStream(options);
      assert.strictEqual(stream, fakeStream);
    });
  });

  describe('write', function() {
    const ENTRY = {};
    const OPTIONS = {};
    const FAKE_RESOURCE = 'fake-resource';

    beforeEach(function() {
      log.decorateEntries_ = function(entries) {
        return entries;
      };
      log.metadata_.getDefaultResource = function(callback) {
        callback(null, FAKE_RESOURCE);
      };
    });

    it('should forward options.resource to request', function(done) {
      const CUSTOM_RESOURCE = 'custom-resource';
      const optionsWithResource = extend({}, OPTIONS, {
        resource: CUSTOM_RESOURCE,
      });

      log.logging.request = function(config, callback) {
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

    it('should transform camelcase label keys to snake case', function(done) {
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

      log.logging.request = function(config, callback) {
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

    it('should make the correct API request', function(done) {
      log.logging.request = function(config, callback) {
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

    it('should arrify & decorate the entries', function(done) {
      const decoratedEntries = [];

      log.decorateEntries_ = function(entries) {
        assert.strictEqual(entries[0], ENTRY);
        return decoratedEntries;
      };

      log.logging.request = function(config) {
        assert.strictEqual(config.reqOpts.entries, decoratedEntries);
        done();
      };

      log.write(ENTRY, OPTIONS, assert.ifError);
    });

    it('should not require options', function(done) {
      log.logging.request = function(config, callback) {
        callback(); // done()
      };

      log.write(ENTRY, done);
    });
  });

  describe('severity shortcuts', function() {
    const ENTRY = {};
    const LABELS = [];

    beforeEach(function() {
      log.write = util.noop;
    });

    describe('alert', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ALERT');

          done();
        };

        log.alert(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.alert(ENTRY, LABELS, done);
      });
    });

    describe('critical', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'CRITICAL');

          done();
        };

        log.critical(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.critical(ENTRY, LABELS, done);
      });
    });

    describe('debug', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'DEBUG');

          done();
        };

        log.debug(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.debug(ENTRY, LABELS, done);
      });
    });

    describe('emergency', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'EMERGENCY');

          done();
        };

        log.emergency(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.emergency(ENTRY, LABELS, done);
      });
    });

    describe('error', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ERROR');

          done();
        };

        log.error(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.error(ENTRY, LABELS, done);
      });
    });

    describe('info', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'INFO');

          done();
        };

        log.info(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.info(ENTRY, LABELS, done);
      });
    });

    describe('notice', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'NOTICE');

          done();
        };

        log.notice(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.notice(ENTRY, LABELS, done);
      });
    });

    describe('warning', function() {
      it('should format the entries', function(done) {
        assignSeverityToEntriesOverride = function(entries, severity) {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'WARNING');

          done();
        };

        log.warning(ENTRY, LABELS, assert.ifError);
      });

      it('should pass correct arguments to write', function(done) {
        const assignedEntries = [];

        assignSeverityToEntriesOverride = function() {
          return assignedEntries;
        };

        log.write = function(entry, labels, callback) {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
          callback(); // done()
        };

        log.warning(ENTRY, LABELS, done);
      });
    });
  });

  describe('decorateEntries_', function() {
    const toJSONResponse = {};

    function FakeEntry() {}
    FakeEntry.prototype.toJSON = function() {
      return toJSONResponse;
    };

    beforeEach(function() {
      log.entry = function() {
        return new FakeEntry();
      };

      log.metadata_.assignDefaultResource = function(entryJson, callback) {
        callback(null, entryJson);
      };
    });

    it('should create an Entry object if one is not provided', function() {
      const entry = {};

      log.entry = function(entry_) {
        assert.strictEqual(entry_, entry);
        return new FakeEntry();
      };

      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
    });

    it('should get JSON format from Entry object', function() {
      log.entry = function() {
        throw new Error('should not be called');
      };

      const entry = new Entry();
      entry.toJSON = function() {
        return toJSONResponse;
      };

      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
    });

    it('should pass log.removeCircular to toJSON', function(done) {
      log.removeCircular_ = true;

      const entry = new Entry();
      entry.toJSON = function(options_) {
        assert.deepStrictEqual(options_, {removeCircular: true});
        setImmediate(done);
        return {};
      };

      log.decorateEntries_([entry]);
    });

    it('should throw error from serialization', function() {
      const error = new Error('Error.');

      const entry = new Entry();
      entry.toJSON = function() {
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
