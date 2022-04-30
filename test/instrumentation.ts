/*!
 * Copyright 2022 Google LLC
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

import * as assert from 'assert';
import {Entry} from '../src';
import * as instrumentation from '../src/utils/instrumentation';
import {google} from '../protos/protos';

const NAME = 'name';
const VERSION = 'version';
const NODEJS_TEST = instrumentation.NODEJS_LIBRARY_NAME_PREFIX + '-test';
const LONG_NODEJS_TEST =
  instrumentation.NODEJS_LIBRARY_NAME_PREFIX + '-test-ooooooooooooooo';
const VERSION_TEST = '1.0.0';
const LONG_VERSION_TEST = VERSION_TEST + '.0.0.0.0.0.0.0.0.11.1.1-ALPHA';

describe('instrumentation_info', () => {
  beforeEach(() => {
    instrumentation.testResetInstrumentationStatus();
  });

  it('should generate library info properly by default', () => {
    console.log('The version is: ' + instrumentation.getLibraryVersion());
    const entry = instrumentation.createDiagnosticEntry(
      undefined,
      undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
    assert.equal(
      entry.data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[NAME],
      instrumentation.NODEJS_LIBRARY_NAME_PREFIX
    );
    assert.equal(
      entry.data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[VERSION],
      instrumentation.getLibraryVersion()
    );
  });

  it('should add instrumentation log entry to the list', () => {
    const dummyEntry = createEntry(undefined, undefined);
    const entries = instrumentation.populatedInstrumentationInfo(dummyEntry);
    assert.equal(entries.length, 2);
    assert.deepEqual(dummyEntry, entries[0]);
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[1] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[NAME],
      instrumentation.NODEJS_LIBRARY_NAME_PREFIX
    );
  });

  it('should add instrumentation info to existing list', () => {
    const dummyEntry = createEntry(NODEJS_TEST, VERSION_TEST);
    const entries = instrumentation.populatedInstrumentationInfo(dummyEntry);
    assert.equal(entries.length, 1);
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.length,
      2
    );
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[NAME],
      instrumentation.NODEJS_LIBRARY_NAME_PREFIX
    );
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[1]?.[NAME],
      NODEJS_TEST
    );
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[1]?.[VERSION],
      VERSION_TEST
    );
  });

  it('should replace instrumentation log entry in the list', () => {
    const dummyEntry = createEntry('nodejs-test', undefined);
    const entries = instrumentation.populatedInstrumentationInfo(dummyEntry);
    assert.equal(entries.length, 1);
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.length,
      1
    );
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[NAME],
      instrumentation.NODEJS_LIBRARY_NAME_PREFIX
    );
  });

  it('should truncate instrumentation info in log entry', () => {
    const entries = instrumentation.populatedInstrumentationInfo(
      createEntry(LONG_NODEJS_TEST, LONG_VERSION_TEST)
    );
    assert.equal(entries.length, 1);
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[1]?.[NAME],
      NODEJS_TEST + '-oo*'
    );
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[0] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[1]?.[VERSION],
      VERSION_TEST + '.0.0.0.0.*'
    );
  });

  it('should add instrumentation log entry only once', () => {
    const dummyEntry = createEntry(undefined, undefined);
    let entries = instrumentation.populatedInstrumentationInfo(dummyEntry);
    assert.equal(entries.length, 2);
    assert.deepEqual(dummyEntry, entries[0]);
    assert.equal(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (entries[1] as any).data?.[instrumentation.DIAGNOSTIC_INFO_KEY]?.[
        instrumentation.INSTRUMENTATION_SOURCE_KEY
      ]?.[0]?.[NAME],
      instrumentation.NODEJS_LIBRARY_NAME_PREFIX
    );
    entries = instrumentation.populatedInstrumentationInfo(dummyEntry);
    assert.equal(entries.length, 1);
    assert.deepEqual(dummyEntry, entries[0]);
  });
});

function createEntry(name: string | undefined, version: string | undefined) {
  const entry = new Entry(
    {
      severity: google.logging.type.LogSeverity.DEBUG,
    },
    undefined
  );
  if (name || version) {
    entry.data = {
      [instrumentation.DIAGNOSTIC_INFO_KEY]: {
        [instrumentation.INSTRUMENTATION_SOURCE_KEY]: [
          {
            name: name,
            version: version,
          },
        ],
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;
  }
  return entry;
}
