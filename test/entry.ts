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

function withinExpectedTimeBoundaries(result?: Date): boolean {
  if (result) {
    const now = Date.now();
    const expectedTimestampBoundaries = {
      start: new Date(now - 1000),
      end: new Date(now + 1000),
    };
    if (
      result >= expectedTimestampBoundaries.start &&
      result <= expectedTimestampBoundaries.end
    )
      return true;
  }
  return false;
}

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
      assert(withinExpectedTimeBoundaries(entry.metadata.timestamp! as Date));
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

    it('should detect trace and span if headers present', () => {
      const req = {
        method: 'GET',
      } as unknown as http.IncomingMessage;
      // To mock http message.headers, we must use lowercased keys.
      req.headers = {
        'x-cloud-trace-context': '0000/1111;o=1',
      };
      entry.metadata.httpRequest = req;
      const json = entry.toJSON();
      assert.strictEqual(json.trace, 'projects//traces/0000');
      assert.strictEqual(json.spanId, '1111');
      assert.strictEqual(json.traceSampled, true);
    });

    it('should not overwrite user defined trace and span with detected', () => {
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

  describe('toStructuredJSON', () => {
    it('should not modify the original instance', () => {
      const entryBefore = extend(true, {}, entry);
      entry.toStructuredJSON();
      const entryAfter = extend(true, {}, entry);
      assert.deepStrictEqual(entryBefore, entryAfter);
    });

    it('should include properties not in StructuredJson', () => {
      entry.metadata.severity = 'CRITICAL';
    });

    it('should re-map new keys and delete old keys', () => {
      entry.metadata.insertId = '👀';
      entry.metadata.labels = {foo: '⌛️'};
      entry.metadata.spanId = '🍓';
      entry.metadata.trace = '🍝';
      entry.metadata.traceSampled = false;
      entry.data = 'this is a log';
      const json = entry.toStructuredJSON();
      assert(withinExpectedTimeBoundaries(new Date(json.timestamp!)));
      delete json.timestamp;
      const expectedJSON = {
        [entryTypes.INSERT_ID_KEY]: '👀',
        [entryTypes.TRACE_KEY]: '🍝',
        [entryTypes.SPAN_ID_KEY]: '🍓',
        [entryTypes.TRACE_SAMPLED_KEY]: false,
        [entryTypes.LABELS_KEY]: {foo: '⌛️'},
        message: 'this is a log',
      };
      assert.deepStrictEqual(json, expectedJSON);
    });

    it('should assign an available payload to message', () => {});

    it('should convert a string timestamp', () => {
      // TODO copy over all the other tests above
    });
    //  TODO complete this one
  });
});
