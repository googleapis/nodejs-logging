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
import {Log as LOG, WriteOptions, GetEntriesRequest} from '../src/log';
import {Logging} from '../src/index';

const noop = () => {};

let callbackified = false;
const fakeCallbackify = extend({}, callbackify, {
  callbackifyAll(c: Function, options: callbackify.CallbackifyAllOptions) {
    if (c.name !== 'Log') {
      return;
    }
    callbackified = true;
    assert.deepStrictEqual(options.exclude, ['entry', 'getEntriesStream']);
  },
});

import {Entry} from '../src';
import {EntryJson, LogEntry} from '../src/entry';
import {LogOptions} from '../src/log';

const originalGetDefaultResource = async () => {
  return 'very-fake-resource';
};

const fakeMetadata = {
  getDefaultResource: originalGetDefaultResource,
};

describe('Log', () => {
  // tslint:disable-next-line variable-name
  let Log: typeof LOG;
  // tslint:disable-next-line no-any
  let log: any;

  const PROJECT_ID = 'project-id';
  const LOG_NAME = 'escaping/required/for/this/log-name';
  const LOG_NAME_ENCODED = encodeURIComponent(LOG_NAME);
  const LOG_NAME_FORMATTED = [
    'projects',
    PROJECT_ID,
    'logs',
    LOG_NAME_ENCODED,
  ].join('/');

  let LOGGING: Logging;

  let assignSeverityToEntriesOverride: Function | null = null;

  before(() => {
    Log = proxyquire('../src/log', {
      '@google-cloud/promisify': fakeCallbackify,
      './entry': {Entry},
      './metadata': fakeMetadata,
    }).Log;
    const assignSeverityToEntries_ = Log.assignSeverityToEntries_;
    Log.assignSeverityToEntries_ = (...args) =>
      (assignSeverityToEntriesOverride || assignSeverityToEntries_).apply(
        null,
        args
      );
  });

  beforeEach(() => {
    log = createLogger();
  });

  function createLogger(maxEntrySize?: number) {
    assignSeverityToEntriesOverride = null;

    LOGGING = ({
      projectId: '{{project-id}}',
      entry: noop,
      request: noop,
      loggingService: noop,
      auth: noop,
    } as {}) as Logging;

    const options: LogOptions = {};
    if (maxEntrySize) {
      options.maxEntrySize = maxEntrySize;
    }

    return new Log(LOGGING, LOG_NAME, options);
  }

  describe('instantiation', () => {
    it('should callbackify all the things', () => {
      assert(callbackified);
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

      const log = new Log(LOGGING, LOG_NAME);

      assert.strictEqual(log.formattedName_, formattedName);
    });

    it('should accept and localize options.removeCircular', () => {
      const options = {removeCircular: true};
      const log = new Log(LOGGING, LOG_NAME, options);
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
    const ENTRIES = [
      {data: {a: 'b'}},
      {data: {c: 'd'}},
      {data: {e: circular}},
    ] as Entry[];
    const SEVERITY = 'severity';

    it('should assign severity to a single entry', () => {
      assert.deepStrictEqual(
        Log.assignSeverityToEntries_(ENTRIES[0], SEVERITY)
          .map(x => x.metadata)
          .map(x => x.severity),
        [SEVERITY]
      );
    });

    it('should assign severity property to multiple entries', () => {
      assert.deepStrictEqual(
        Log.assignSeverityToEntries_(ENTRIES, SEVERITY)
          .map(x => x.metadata)
          .map(x => x.severity),
        [SEVERITY, SEVERITY, SEVERITY]
      );
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
    beforeEach(() => {
      log.logging.auth.getProjectId = async () => PROJECT_ID;
    });

    it('should execute gax method', async () => {
      log.logging.loggingService.deleteLog = async (
        reqOpts: {},
        gaxOpts: {}
      ) => {
        assert.deepStrictEqual(reqOpts, {
          logName: log.formattedName_,
        });

        assert.strictEqual(gaxOpts, undefined);
      };

      await log.delete();
    });

    it('should accept gaxOptions', async () => {
      const gaxOptions = {};

      log.logging.loggingService.deleteLog = async (
        reqOpts: {},
        gaxOpts: {}
      ) => {
        assert.strictEqual(gaxOpts, gaxOptions);
      };

      await log.delete(gaxOptions);
    });
  });

  describe('entry', () => {
    it('should return an entry from Logging', () => {
      const metadata = {
        val: true,
      } as LogEntry;
      const data = {};

      const entryObject = {};

      log.logging.entry = (metadata_: {}, data_: {}) => {
        assert.deepStrictEqual(metadata_, metadata);
        assert.strictEqual(data_, data);
        return entryObject;
      };

      const entry = log.entry(metadata, data);
      assert.strictEqual(entry, entryObject);
    });

    it('should assume one argument means data', done => {
      const data = {};
      log.logging.entry = (metadata: {}, data_: {}) => {
        assert.strictEqual(data_, data);
        done();
      };
      log.entry(data);
    });
  });

  describe('getEntries', () => {
    beforeEach(() => {
      log.logging.auth.getProjectId = async () => PROJECT_ID;
    });

    const EXPECTED_OPTIONS = {
      filter: 'logName="' + LOG_NAME_FORMATTED + '"',
    };

    it('should call Logging getEntries with defaults', async () => {
      log.logging.getEntries = (options: GetEntriesRequest) => {
        assert.deepStrictEqual(options, EXPECTED_OPTIONS);
      };
      await log.getEntries();
    });

    it('should add logName filter to user provided filter', async () => {
      const options = {
        custom: true,
        filter: 'custom filter',
      };
      log.logging.projectId = await log.logging.auth.getProjectId();
      log.formattedName_ = Log.formatName_(log.logging.projectId, log.name);

      const expectedOptions = extend({}, options);
      expectedOptions.filter = `(${options.filter}) AND logName="${log.formattedName_}"`;

      log.logging.getEntries = (options_: {}) => {
        assert.notDeepStrictEqual(options_, options);
        assert.deepStrictEqual(options_, expectedOptions);
      };

      await log.getEntries(options);
    });
  });

  describe('getEntriesStream', () => {
    const fakeStream = {};
    const EXPECTED_OPTIONS = {
      log: LOG_NAME_ENCODED,
    };

    it('should call Logging getEntriesStream with defaults', done => {
      log.logging.getEntriesStream = (options: {}) => {
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

      log.logging.getEntriesStream = (options_: {}) => {
        assert.deepStrictEqual(options_, extend({}, EXPECTED_OPTIONS, options));
        setImmediate(done);
        return fakeStream;
      };

      const stream = log.getEntriesStream(options);
      assert.strictEqual(stream, fakeStream);
    });
  });

  describe('write', () => {
    const ENTRY = {} as Entry;
    const OPTIONS = {};
    const FAKE_RESOURCE = 'fake-resource';

    beforeEach(() => {
      log.decorateEntries_ = (entries: Entry[]) => entries;
      fakeMetadata.getDefaultResource = async () => {
        return FAKE_RESOURCE;
      };
      log.logging.auth.getProjectId = async () => PROJECT_ID;
    });

    it('should forward options.resource to request', async () => {
      const CUSTOM_RESOURCE = 'custom-resource';
      const optionsWithResource = extend({}, OPTIONS, {
        resource: CUSTOM_RESOURCE,
      }) as WriteOptions;

      log.logging.loggingService.writeLogEntries = (
        reqOpts: {},
        gaxOpts: {}
      ) => {
        assert.deepStrictEqual(reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: CUSTOM_RESOURCE,
        });

        assert.strictEqual(gaxOpts, undefined);
      };

      await log.write(ENTRY, optionsWithResource);
    });

    it('should cache a detected resource', async () => {
      const fakeResource = 'test-level-fake-resource';
      fakeMetadata.getDefaultResource = async () => {
        return fakeResource;
      };
      log.logging.loggingService.writeLogEntries = () => {
        assert.strictEqual(log.logging.detectedResource, fakeResource);
      };
      await log.write(ENTRY);
    });

    it('should re-use detected resource', async () => {
      log.logging.detectedResource = 'environment-default-resource';
      fakeMetadata.getDefaultResource = () => {
        throw new Error('Cached resource was not used.');
      };
      // tslint:disable-next-line no-any
      log.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any
      ) => {
        assert.strictEqual(reqOpts.resource, log.logging.detectedResource);
      };
      await log.write(ENTRY);
    });

    it('should transform camelcase label keys to snake case', async () => {
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

      log.logging.loggingService.writeLogEntries = (
        reqOpts: {},
        gaxOpts: {}
      ) => {
        assert.deepStrictEqual(reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: EXPECTED_RESOURCE,
        });

        assert.strictEqual(gaxOpts, undefined);
      };

      await log.write(ENTRY, optionsWithResource);
    });

    it('should call gax method', async () => {
      log.logging.loggingService.writeLogEntries = (
        reqOpts: {},
        gaxOpts: {}
      ) => {
        assert.deepStrictEqual(reqOpts, {
          logName: log.formattedName_,
          entries: [ENTRY],
          resource: FAKE_RESOURCE,
        });

        assert.strictEqual(gaxOpts, undefined);
      };

      await log.write(ENTRY, OPTIONS);
    });

    it('should arrify & decorate the entries', async () => {
      const decoratedEntries = [] as Entry[];

      log.decorateEntries_ = (entries: Entry[]) => {
        assert.strictEqual(entries[0], ENTRY);
        return decoratedEntries;
      };

      // tslint:disable-next-line no-any
      log.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any,
        gaxOpts: {}
      ) => {
        assert.strictEqual(reqOpts.entries, decoratedEntries);
      };

      await log.write(ENTRY, OPTIONS);
    });

    it('should not require options', async () => {
      log.logging.loggingService.writeLogEntries = (
        reqOpts: {},
        gaxOpts: {}
      ) => {};

      await log.write(ENTRY);
    });

    it('should not truncate entries by default', async () => {
      const logger = createLogger();
      const entry = new Entry({}, 'hello world'.padEnd(300000, '.'));
      // tslint:disable-next-line no-any
      logger.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any,
        _gaxOpts: {}
      ) => {
        assert.strictEqual(reqOpts.entries[0].textPayload.length, 300000);
      };

      await logger.write(entry);
    });

    it('should truncate string entry if maxEntrySize hit', async () => {
      const truncatingLogger = createLogger(200);
      const entry = new Entry({}, 'hello world'.padEnd(2000, '.'));

      truncatingLogger.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any,
        _gaxOpts: {}
      ) => {
        const text = reqOpts.entries[0].textPayload;
        assert.ok(text.startsWith('hello world'));
        assert.ok(text.length < 300);
      };

      await truncatingLogger.write(entry);
    });

    it('should truncate message field, on object entry, if maxEntrySize hit', async () => {
      const truncatingLogger = createLogger(200);
      const entry = new Entry(
        {},
        {
          message: 'hello world'.padEnd(2000, '.'),
        }
      );

      truncatingLogger.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any,
        _gaxOpts: {}
      ) => {
        const text = reqOpts.entries[0].jsonPayload.fields.message.stringValue;
        assert.ok(text.startsWith('hello world'));
        assert.ok(text.length < 300);
      };

      await truncatingLogger.write(entry);
    });

    it('should truncate stack trace', async () => {
      const truncatingLogger = createLogger(300);
      const entry = new Entry(
        {},
        {
          message: 'hello world'.padEnd(2000, '.'),
          metadata: {
            stack: 'hello world'.padEnd(2000, '.'),
          },
        }
      );

      truncatingLogger.logging.loggingService.writeLogEntries = (
        // tslint:disable-next-line no-any
        reqOpts: any,
        _gaxOpts: {}
      ) => {
        const message =
          reqOpts.entries[0].jsonPayload.fields.message.stringValue;
        const stack = reqOpts.entries[0].jsonPayload.fields.metadata
          .structValue!.fields!.stack.stringValue;
        assert.strictEqual(stack, '');
        assert.ok(message.startsWith('hello world'));
        assert.ok(message.length < 400);
      };

      await truncatingLogger.write(entry);
    });
  });

  describe('severity shortcuts', () => {
    const ENTRY = {} as Entry;
    const LABELS = [] as WriteOptions;

    beforeEach(() => {
      log.write = noop;
    });

    describe('alert', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ALERT');
        };
        await log.alert(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };
        await log.alert(ENTRY, LABELS);
      });
    });

    describe('critical', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'CRITICAL');
        };

        await log.critical(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };
        await log.critical(ENTRY, LABELS);
      });
    });

    describe('debug', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'DEBUG');
        };

        await log.debug(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };
        await log.debug(ENTRY, LABELS);
      });
    });

    describe('emergency', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'EMERGENCY');
        };

        await log.emergency(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };
        await log.emergency(ENTRY, LABELS);
      });
    });

    describe('error', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'ERROR');
        };
        await log.error(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };

        await log.error(ENTRY, LABELS);
      });
    });

    describe('info', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'INFO');
        };

        await log.info(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };

        await log.info(ENTRY, LABELS);
      });
    });

    describe('notice', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'NOTICE');
        };

        await log.notice(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];

        assignSeverityToEntriesOverride = () => {
          return assignedEntries;
        };

        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };

        await log.notice(ENTRY, LABELS);
      });
    });

    describe('warning', () => {
      it('should format the entries', async () => {
        assignSeverityToEntriesOverride = (
          entries: Entry[],
          severity: string
        ) => {
          assert.strictEqual(entries, ENTRY);
          assert.strictEqual(severity, 'WARNING');
        };

        await log.warning(ENTRY, LABELS);
      });

      it('should pass correct arguments to write', async () => {
        const assignedEntries = [] as Entry[];
        assignSeverityToEntriesOverride = () => assignedEntries;
        log.write = async (entry: Entry, labels: WriteOptions) => {
          assert.strictEqual(entry, assignedEntries);
          assert.strictEqual(labels, LABELS);
        };
        await log.warning(ENTRY, LABELS);
      });
    });
  });

  describe('decorateEntries_', () => {
    const toJSONResponse = {};

    class FakeEntry {
      toJSON() {
        return toJSONResponse;
      }
    }

    beforeEach(() => {
      log.entry = () => new FakeEntry() as Entry;
    });

    it('should create an Entry object if one is not provided', () => {
      const entry = {};

      log.entry = (entry_: Entry) => {
        assert.strictEqual(entry_, entry);
        return new FakeEntry() as Entry;
      };

      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
    });

    it('should get JSON format from Entry object', () => {
      log.entry = () => {
        throw new Error('should not be called');
      };
      const entry = new Entry();
      entry.toJSON = () => (toJSONResponse as {}) as EntryJson;
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
