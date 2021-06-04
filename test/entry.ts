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
import * as entryTypes from '../src/entry';
import * as common from '../src/common';
import * as http from 'http';

let fakeEventIdNewOverride: Function | null;

class FakeEventId {
  new() {
    const func = fakeEventIdNewOverride || (() => {});
    // eslint-disable-next-line prefer-rest-params
    return func(null, arguments);
  }
}

let fakeObjToStruct: Function | null;
let fakeStructToObj: Function | null;
const objToStruct = (obj: {}, opts: {}) => {
  return (fakeObjToStruct || common.objToStruct)(obj, opts);
};
const structToObj = (struct: {}) => {
  return (fakeStructToObj || common.structToObj)(struct);
};

describe('Entry', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let Entry: typeof entryTypes.Entry;
  let entry: entryTypes.Entry;

  const METADATA = {};
  const DATA = {};

  before(() => {
    Entry = proxyquire('../src/entry.js', {
      './common': {
        objToStruct,
        structToObj,
      },
      eventid: FakeEventId,
    }).Entry;
  });

  beforeEach(() => {
    fakeEventIdNewOverride = null;
    entry = new Entry(METADATA, DATA);
  });

  afterEach(() => {
    fakeObjToStruct = null;
    fakeStructToObj = null;
  });

  describe('instantiation', () => {
    it('should assign timestamp to metadata', () => {
      const now = Date.now();
      const expectedTimestampBoundaries = {
        start: new Date(now - 1000),
        end: new Date(now + 1000),
      };
      assert(entry.metadata.timestamp! >= expectedTimestampBoundaries.start);
      assert(entry.metadata.timestamp! <= expectedTimestampBoundaries.end);
    });

    it('should not assign timestamp if one is already set', () => {
      const timestamp = new Date('2012') as entryTypes.Timestamp;
      const entry = new Entry({timestamp});
      assert.strictEqual(entry.metadata.timestamp, timestamp);
    });

    it('should assign insertId to metadata', () => {
      const eventId = 'event-id';
      fakeEventIdNewOverride = () => eventId;
      const entry = new Entry();
      assert.strictEqual(entry.metadata.insertId, eventId);
    });

    it('should not assign insertId if one is already set', () => {
      const eventId = 'event-id';
      fakeEventIdNewOverride = () => eventId;
      const userDefinedInsertId = 'user-defined-insert-id';
      const entry = new Entry({
        insertId: userDefinedInsertId,
      });
      assert.strictEqual(entry.metadata.insertId, userDefinedInsertId);
    });

    it('should localize data', () => {
      assert.strictEqual(entry.data, DATA);
    });
  });

  describe('fromApiResponse_', () => {
    const RESOURCE = {};
    let entry: entryTypes.Entry;
    const date = new Date();

    beforeEach(() => {
      const seconds = date.getTime() / 1000;
      const secondsRounded = Math.floor(seconds);
      fakeStructToObj = (data: {}) => data;
      entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'jsonPayload',
        jsonPayload: DATA,
        extraProperty: true,
        timestamp: {
          seconds: secondsRounded,
          nanos: Math.floor((seconds - secondsRounded) * 1e9),
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    });

    it('should create an Entry', () => {
      assert(entry instanceof Entry);
      assert.strictEqual(entry.metadata.resource, RESOURCE);
      assert.strictEqual(entry.data, DATA);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assert.strictEqual((entry.metadata as any).extraProperty, true);
      assert.deepStrictEqual(entry.metadata.timestamp, date);
    });

    it('should extend the entry with proto data', () => {
      const entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'protoPayload',
        protoPayload: DATA,
        extraProperty: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      assert.strictEqual(entry.data, DATA);
    });

    it('should extend the entry with json data', () => {
      assert.strictEqual(entry.data, DATA);
    });

    it('should extend the entry with text data', () => {
      const entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'textPayload',
        textPayload: DATA as string,
        extraProperty: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      assert.strictEqual(entry.data, DATA);
    });
  });

  describe('toJSON', () => {
    beforeEach(() => {
      fakeObjToStruct = () => {};
    });

    it('should not modify the original instance', () => {
      const entryBefore = extend(true, {}, entry);
      entry.toJSON();
      const entryAfter = extend(true, {}, entry);
      assert.deepStrictEqual(entryBefore, entryAfter);
    });

    it('should convert data as a struct and assign to jsonPayload', () => {
      const input = {};
      const converted = {};

      fakeObjToStruct = (obj: {}, options: {}) => {
        assert.strictEqual(obj, input);
        assert.deepStrictEqual(options, {
          removeCircular: false,
          stringify: true,
        });
        return converted;
      };

      entry.data = input;
      const json = entry.toJSON();
      assert.strictEqual(json.jsonPayload, converted);
    });

    it('should pass removeCircular to objToStruct_', done => {
      fakeObjToStruct = (
        obj: {},
        options: common.ObjectToStructConverterConfig
      ) => {
        assert.strictEqual(options.removeCircular, true);
        done();
      };
      entry.data = {};
      entry.toJSON({removeCircular: true});
    });

    it('should assign string data as textPayload', () => {
      entry.data = 'string';
      const json = entry.toJSON();
      assert.strictEqual(json.textPayload, entry.data);
    });

    it('should convert a date timestamp', () => {
      const date = new Date();
      entry.metadata.timestamp = date as entryTypes.Timestamp;
      const json = entry.toJSON();
      const seconds = date.getTime() / 1000;
      const secondsRounded = Math.floor(seconds);
      assert.deepStrictEqual(json.timestamp, {
        seconds: secondsRounded,
        nanos: Math.floor((seconds - secondsRounded) * 1e9),
      });
    });

    it('should convert a string timestamp', () => {
      const tests = [
        {
          inputTime: '2020-01-01T00:00:00.11Z',
          expectedSeconds: 1577836800,
          expectedNanos: 110000000,
        },
        {
          inputTime: '2020-01-01T00:00:00Z',
          expectedSeconds: 1577836800,
          expectedNanos: 0,
        },
        {
          inputTime: '2020-01-01T00:00:00.999999999Z',
          expectedSeconds: 1577836800,
          expectedNanos: 999999999,
        },
        {
          inputTime: 'invalid timestamp string',
          expectedSeconds: 0,
          expectedNanos: 0,
        },
      ];

      for (const test of tests) {
        entry.metadata.timestamp = test.inputTime;
        const json = entry.toJSON();
        assert.deepStrictEqual(json.timestamp, {
          seconds: test.expectedSeconds,
          nanos: test.expectedNanos,
        });
      }
    });

    it('should convert a raw incoming HTTP request', () => {
      const req = {
        method: 'GET',
      } as http.IncomingMessage;
      req.headers = {};
      entry.metadata.httpRequest = req;
      const json = entry.toJSON();
      assert.strictEqual(json.httpRequest?.requestMethod, 'GET');
    });

    it('should extract trace & span from X-Cloud-Trace-Context', () => {
      const tests = [
        {
          header: '105445aa7843bc8bf206b120001000/000000001;o=1',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '000000001',
            traceSampled: true,
          },
        },
        // TraceSampled is false
        {
          header: '105445aa7843bc8bf206b120001000/000000001;o=0',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '000000001',
            traceSampled: false,
          },
        },
        {
          // No span
          header: '105445aa7843bc8bf206b120001000;o=1',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: undefined,
            traceSampled: true,
          },
        },
        {
          // No trace
          header: '/105445aa7843bc8bf206b120001000;o=0',
          expected: {
            trace: undefined,
            spanId: '105445aa7843bc8bf206b120001000',
            traceSampled: false,
          },
        },
        {
          // No traceSampled
          header: '105445aa7843bc8bf206b120001000/0',
          expected: {
            trace: '105445aa7843bc8bf206b120001000',
            spanId: '0',
            traceSampled: undefined,
          },
        },
        {
          // No input
          header: '',
          expected: {
            trace: undefined,
            spanId: undefined,
            traceSampled: undefined,
          },
        },
      ];
      for (const test of tests) {
        const req = {
          method: 'GET',
        } as unknown as http.IncomingMessage;
        // Mock raw http headers with lowercased keys.
        req.headers = {
          'x-cloud-trace-context': test.header,
        };
        delete entry.metadata.trace;
        delete entry.metadata.spanId;
        delete entry.metadata.traceSampled;
        entry.metadata.httpRequest = req;
        const json = entry.toJSON();
        assert.strictEqual(json.trace, test.expected.trace);
        assert.strictEqual(json.spanId, test.expected.spanId);
        assert.strictEqual(json.traceSampled, test.expected.traceSampled);
      }
    });

    it('should not overwrite user defined trace and span', () => {
      const req = {
        method: 'GET',
      } as unknown as http.IncomingMessage;
      // Mock raw http headers with lowercased keys.
      req.headers = {
        'x-cloud-trace-context': '105445aa7843bc8bf206b120001000/000000001;o=1',
      };
      entry.metadata.spanId = '1';
      entry.metadata.trace = '1';
      entry.metadata.traceSampled = false;
      const expected = {
        trace: '1',
        spanId: '1',
        traceSampled: false,
      };
      entry.metadata.httpRequest = req;
      const json = entry.toJSON();
      assert.strictEqual(json.trace, expected.trace);
      assert.strictEqual(json.spanId, expected.spanId);
      assert.strictEqual(json.traceSampled, expected.traceSampled);
    });
  });
});
