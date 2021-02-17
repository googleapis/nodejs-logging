// Copyright 2015 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as assert from 'assert';
import {describe, it, before, beforeEach, afterEach} from 'mocha';
import * as extend from 'extend';
import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import {Entry, Logging} from '../src';
import {Log as LOG, LogOptions, WriteOptions} from '../src/log';
import {Data, EntryJson, LogEntry} from '../src/entry';

describe('Log', () => {
  let Log: typeof LOG;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let log: any;

  const PROJECT_ID = 'project-id';
  const FAKE_RESOURCE = 'fake-resource';
  const LOG_NAME = 'escaping/required/for/this/log-name';
  const LOG_NAME_ENCODED = encodeURIComponent(LOG_NAME);
  const LOG_NAME_FORMATTED = [
    'projects',
    PROJECT_ID,
    'logs',
    LOG_NAME_ENCODED,
  ].join('/');

  let LOGGING: Logging;

  const callbackifyFake = {
    callbackifyAll: sinon.stub(),
  };

  const metadataFake = {
    getDefaultResource: sinon.stub(),
  };

  before(() => {
    Log = proxyquire('../src/log', {
      '@google-cloud/promisify': callbackifyFake,
      './entry': {Entry},
      './metadata': metadataFake,
    }).Log;

    log = createLogger();
  });

  beforeEach(() => {
    metadataFake.getDefaultResource.reset();
    log.logging.entry.reset();
    log.logging.getEntries.reset();
    log.logging.getEntriesStream.reset();
    log.logging.request.reset();
    log.logging.loggingService.deleteLog.reset();
    log.logging.loggingService.writeLogEntries.reset();
    log.logging.auth.getEnv.reset();
    log.logging.auth.getProjectId.reset();

    metadataFake.getDefaultResource.returns(FAKE_RESOURCE);
    log.logging.auth.getProjectId.resolves(PROJECT_ID);
  });

  function createLogger(maxEntrySize?: number) {
    LOGGING = ({
      projectId: '{{project-id}}',
      entry: sinon.stub(),
      getEntries: sinon.stub(),
      getEntriesStream: sinon.stub(),
      request: sinon.stub(),
      loggingService: {
        deleteLog: sinon.stub(),
        writeLogEntries: sinon.stub(),
      },
      auth: {
        getEnv: sinon.stub(),
        getProjectId: sinon.stub(),
      },
    } as {}) as Logging;

    const options: LogOptions = {};
    if (maxEntrySize) {
      options.maxEntrySize = maxEntrySize;
    }

    return new Log(LOGGING, LOG_NAME, options);
  }

  describe('instantiation', () => {
    it('should callbackify all the things', () => {
      assert(
        callbackifyFake.callbackifyAll.calledWithExactly(
          Log,
          sinon.match({exclude: ['entry', 'getEntriesStream']})
        )
      );
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

    it('should default to no max entry size', () => {
      assert.strictEqual(log.maxEntrySize, undefined);
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
    it('should execute gax method', async () => {
      await log.delete();
      assert(
        log.logging.loggingService.deleteLog.calledWithExactly(
          {
            logName: log.formattedName_,
          },
          undefined
        )
      );
    });

    it('should accept gaxOptions', async () => {
      await log.delete({});
      assert(
        log.logging.loggingService.deleteLog.calledWith(sinon.match.any, {})
      );
    });
  });

  describe('entry', () => {
    it('should return an entry from Logging', () => {
      const metadata = {
        val: true,
      } as LogEntry;
      const data = {};
      const entryObject = {};
      log.logging.entry.returns(entryObject);

      const entry = log.entry(metadata, data);
      assert.strictEqual(entry, entryObject);
      assert(log.logging.entry.calledWithExactly(metadata, data));
    });

    it('should assume one regular argument means data', () => {
      const data = {};
      log.entry(data);
      assert(log.logging.entry.calledWith(sinon.match.any, data));
    });

    it('should assume one httpRequest argument means metadata', () => {
      const metadata = {
        httpRequest: {},
      };
      log.entry(metadata);
      assert(log.logging.entry.calledWith(metadata, {}));
    });
  });

  describe('getEntries', () => {
    it('should call Logging getEntries with defaults', async () => {
      await log.getEntries();
      assert(
        log.logging.getEntries.calledWithExactly({
          filter: `logName="${LOG_NAME_FORMATTED}"`,
        })
      );
    });

    it('should add logName filter to user provided filter', async () => {
      const options = {
        custom: true,
        filter: 'custom filter',
      };
      const expectedOptions = extend({}, options);
      expectedOptions.filter = `(${options.filter}) AND logName="${LOG_NAME_FORMATTED}"`;

      await log.getEntries(options);
      assert(log.logging.getEntries.calledWithExactly(expectedOptions));
    });

    it('should not add logName filter if already present', async () => {
      const filter = `logName="${LOG_NAME_FORMATTED}" AND custom filter`;
      const options = {filter};

      await log.getEntries(options);
      assert(log.logging.getEntries.calledWithExactly({filter}));
    });
  });

  describe('getEntriesStream', () => {
    const FAKE_STREAM = {};

    beforeEach(() => {
      log.logging.getEntriesStream.returns(FAKE_STREAM);
    });

    it('should call Logging getEntriesStream with defaults', () => {
      const stream = log.getEntriesStream();
      assert.strictEqual(stream, FAKE_STREAM);
      assert(
        log.logging.getEntriesStream.calledWithExactly({
          log: LOG_NAME_ENCODED,
        })
      );
    });

    it('should allow overriding the options', () => {
      const options = {
        custom: true,
        filter: 'custom filter',
      };

      const stream = log.getEntriesStream(options);
      assert.strictEqual(stream, FAKE_STREAM);
      assert(
        log.logging.getEntriesStream.calledWithExactly(
          extend(
            {},
            {
              log: LOG_NAME_ENCODED,
            },
            options
          )
        )
      );
    });
  });

  // TODO: tailEntries
  // should call tailEntries with defaults
  // should allow overriding the options

  describe('write', () => {
    let ENTRY: Entry;
    let ENTRIES: Entry[];
    let OPTIONS: WriteOptions;
    let truncateEntriesStub: sinon.SinonStub;
    let decorateEntriesStub: sinon.SinonStub;
    let origDetectedResource: string;

    before(() => {
      origDetectedResource = log.logging.detectedResource;
    });

    beforeEach(() => {
      ENTRY = {} as Entry;
      ENTRIES = [ENTRY] as Entry[];
      OPTIONS = {} as WriteOptions;
      decorateEntriesStub = sinon.stub(log, 'decorateEntries_').returnsArg(0);
      truncateEntriesStub = sinon.stub(log, 'truncateEntries').returnsArg(0);
    });
    afterEach(() => {
      decorateEntriesStub.restore();
      truncateEntriesStub.restore();
      log.logging.detectedResource = origDetectedResource;
    });

    it('should forward options.resource to request', async () => {
      const CUSTOM_RESOURCE = 'custom-resource';
      const optionsWithResource = extend({}, OPTIONS, {
        resource: CUSTOM_RESOURCE,
      }) as WriteOptions;

      await log.write(ENTRIES, optionsWithResource);
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWithExactly(
          {
            logName: log.formattedName_,
            entries: ENTRIES,
            resource: CUSTOM_RESOURCE,
          },
          undefined
        )
      );
    });

    it('should cache a detected resource', async () => {
      const fakeResource = 'test-level-fake-resource';
      metadataFake.getDefaultResource.resetBehavior();
      metadataFake.getDefaultResource.resolves(fakeResource);

      await log.write(ENTRIES);
      assert(log.logging.loggingService.writeLogEntries.calledOnce);
      assert.strictEqual(log.logging.detectedResource, fakeResource);
    });

    it('should re-use detected resource', async () => {
      const reusableDetectedResource = 'environment-default-resource';
      log.logging.detectedResource = reusableDetectedResource;
      metadataFake.getDefaultResource.resetBehavior();
      metadataFake.getDefaultResource.throws('Cached resource was not used.');

      await log.write(ENTRIES);
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWith(
          sinon.match({
            resource: reusableDetectedResource,
          })
        )
      );
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

      await log.write(ENTRIES, optionsWithResource);
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWithExactly(
          {
            logName: log.formattedName_,
            entries: ENTRIES,
            resource: EXPECTED_RESOURCE,
          },
          undefined
        )
      );
    });

    it('should call gax method', async () => {
      await log.write(ENTRIES, OPTIONS);
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWithExactly(
          {
            logName: log.formattedName_,
            entries: ENTRIES,
            resource: FAKE_RESOURCE,
          },
          undefined
        )
      );
    });

    it('should decorate the entries', async () => {
      decorateEntriesStub.resetBehavior();
      decorateEntriesStub.returns('decorated entries');

      await log.write(ENTRIES, OPTIONS);
      assert(decorateEntriesStub.calledOnceWithExactly(ENTRIES));
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWith(
          sinon.match({
            entries: 'decorated entries',
          })
        )
      );
    });

    it('should arrify the entries', async () => {
      const arrifiedEntries: Entry[] = [ENTRY];

      await log.write(ENTRY, OPTIONS);
      assert(decorateEntriesStub.calledOnceWithExactly(arrifiedEntries));
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWith(
          sinon.match({
            entries: arrifiedEntries,
          })
        )
      );
    });

    it('should truncate the entries after decorating', async () => {
      await log.write(ENTRIES, OPTIONS);
      assert(truncateEntriesStub.calledAfter(decorateEntriesStub));
      assert(truncateEntriesStub.calledOnceWithExactly(ENTRIES));
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWith(
          sinon.match({
            entries: ENTRIES,
          })
        )
      );
    });

    it('should not require options', async () => {
      await log.write(ENTRY);
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWithExactly(
          sinon.match.object,
          undefined
        )
      );
    });

    it('should pass through additional options', async () => {
      await log.write(ENTRY, {dryRun: true, partialSuccess: false});
      assert(
        log.logging.loggingService.writeLogEntries.calledOnceWith(
          sinon.match({
            dryRun: true,
            partialSuccess: false,
          })
        )
      );
    });
  });

  describe('truncateEntries', () => {
    const entryMetaMaxLength = 100;

    function entriesFactory(message: Data): EntryJson[] {
      return [new Entry({}, message).toJSON()];
    }

    it('should not truncate entries by default', () => {
      const longEntry = 'hello world'.padEnd(3e5, '.');
      const entries = entriesFactory(longEntry);

      log.truncateEntries(entries);
      const text = entries[0].textPayload;
      assert.ok(text, longEntry);
    });

    it('should truncate string entry if maxEntrySize hit', () => {
      const maxSize = 2e2;
      const longEntry = 'hello world'.padEnd(maxSize * 10, '.');
      const entries = entriesFactory(longEntry);

      log.maxEntrySize = maxSize;
      log.truncateEntries(entries);

      const text: string = entries[0].textPayload!;
      assert.ok(text.startsWith('hello world'));
      assert.ok(text.length < maxSize + entryMetaMaxLength);
    });

    it('should not truncate string entry if less than maxEntrySize', () => {
      const maxSize = 2e3; // something greater than message length and entry overhead
      const shortEntry = 'hello world';
      const entries = entriesFactory(shortEntry);

      log.maxEntrySize = maxSize;
      log.truncateEntries(entries);

      const text: string = entries[0].textPayload!;
      assert.strictEqual(text, shortEntry);
    });

    it('should truncate message field, on object entry, if maxEntrySize hit', () => {
      const maxSize = 2e2;
      const longEntry = 'hello world'.padEnd(maxSize * 10, '.');
      const entries = entriesFactory({message: longEntry});

      log.maxEntrySize = maxSize;
      log.truncateEntries(entries);

      const text: string = entries[0].jsonPayload!.fields!.message.stringValue!;
      assert.ok(text.startsWith('hello world'));
      assert.ok(text.length < maxSize + entryMetaMaxLength);
    });

    it('should truncate stack trace', async () => {
      const maxSize = 300;
      const entries = entriesFactory({
        message: 'hello world'.padEnd(2000, '.'),
        metadata: {
          stack: 'hello world'.padEnd(2000, '.'),
        },
      });

      log.maxEntrySize = maxSize;
      log.truncateEntries(entries);

      const message: string = entries[0].jsonPayload!.fields!.message
        .stringValue!;
      const stack: string = entries[0].jsonPayload!.fields!.metadata
        .structValue!.fields!.stack.stringValue!;
      assert.strictEqual(stack, '');
      assert.ok(message.startsWith('hello world'));
      assert.ok(message.length < maxSize + entryMetaMaxLength);
    });
  });

  describe('severity shortcuts', () => {
    let ENTRY: Entry;
    let LABELS: WriteOptions;
    let assignSeverityStub: sinon.SinonStub;
    let writeStub: sinon.SinonStub;

    beforeEach(() => {
      ENTRY = {} as Entry;
      LABELS = [] as WriteOptions;
      assignSeverityStub = sinon.stub(Log, 'assignSeverityToEntries_');
      writeStub = sinon.stub(log, 'write');
    });

    afterEach(() => {
      assignSeverityStub.restore();
      writeStub.restore();
    });

    [
      'alert',
      'critical',
      'debug',
      'emergency',
      'error',
      'info',
      'notice',
      'warning',
    ].forEach(severityMethodName => {
      describe(severityMethodName, () => {
        let severityMethod: Function;

        beforeEach(() => {
          severityMethod = log[severityMethodName].bind(log);
        });

        it('should format the entries', async () => {
          const severity = severityMethodName.toUpperCase();
          await severityMethod(ENTRY, LABELS);
          assert(assignSeverityStub.calledOnceWith(ENTRY, severity));
        });

        it('should pass correct arguments to write', async () => {
          const assignedEntries = [] as Entry[];
          assignSeverityStub.returns(assignedEntries);
          await severityMethod(ENTRY, LABELS);
          assert(writeStub.calledOnceWith(assignedEntries));
        });
      });
    });
  });

  describe('decorateEntries_', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let toJSONResponse: any;
    let logEntryStub: sinon.SinonStub;
    let toJSONStub: sinon.SinonStub;

    beforeEach(() => {
      toJSONResponse = {};
      toJSONStub = sinon.stub().returns(toJSONResponse);
      logEntryStub = sinon.stub(log, 'entry').returns({
        toJSON: toJSONStub,
      });
    });

    afterEach(() => {
      logEntryStub.restore();
    });

    it('should create an Entry object if one is not provided', () => {
      const entry = {};
      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
      assert(log.entry.calledWithExactly(entry));
    });

    it('should get JSON format from Entry object', () => {
      const entry = new Entry();
      entry.toJSON = () => (toJSONResponse as {}) as EntryJson;
      const decoratedEntries = log.decorateEntries_([entry]);
      assert.strictEqual(decoratedEntries[0], toJSONResponse);
      assert(log.entry.notCalled);
    });

    it('should pass log.removeCircular to toJSON', () => {
      log.removeCircular_ = true;
      const entry = new Entry();
      const localJSONStub = sinon
        .stub(entry, 'toJSON')
        .returns({} as EntryJson);

      log.decorateEntries_([entry]);
      assert(localJSONStub.calledWithExactly({removeCircular: true}));
    });

    it('should throw error from serialization', () => {
      const entry = new Entry();
      sinon.stub(entry, 'toJSON').throws('Error.');
      assert.throws(() => {
        log.decorateEntries_([entry]);
      }, 'Error.');
    });
  });
});
