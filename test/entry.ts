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

import * as assert from 'assert';
import * as extend from 'extend';
import {Service, util} from '@google-cloud/common-grpc';
import * as proxyquire from 'proxyquire';

class FakeGrpcService {
  static structToObj_?: Function;
  static objToStruct_?: Function;
}

let fakeEventIdNewOverride;

class FakeEventId {
  new() {
    return (fakeEventIdNewOverride || util.noop).apply(null, arguments);
  }
}

describe('Entry', () => {
  // tslint:disable-next-line no-any variable-name
  let Entry: any;
  let entry;

  const METADATA = {};
  const DATA = {};

  before(() => {
    Entry = proxyquire('../src/entry.js', {
              '@google-cloud/common-grpc': {
                Service: FakeGrpcService,
              },
              eventid: FakeEventId,
            }).Entry;
  });

  beforeEach(() => {
    fakeEventIdNewOverride = null;
    extend(FakeGrpcService, Service);
    entry = new Entry(METADATA, DATA);
  });

  describe('instantiation', () => {
    it('should assign timestamp to metadata', () => {
      const now = new Date();

      const expectedTimestampBoundaries = {
        start: new Date(now.getTime() - 1000),
        end: new Date(now.getTime() + 1000),
      };

      assert(entry.metadata.timestamp >= expectedTimestampBoundaries.start);
      assert(entry.metadata.timestamp <= expectedTimestampBoundaries.end);
    });

    it('should not assign timestamp if one is already set', () => {
      const timestamp = new Date('2012');

      const entry = new Entry({
        timestamp,
      });

      assert.strictEqual(entry.metadata.timestamp, timestamp);
    });

    it('should assign insertId to metadata', () => {
      const eventId = 'event-id';

      fakeEventIdNewOverride = () => {
        return eventId;
      };

      const entry = new Entry();

      assert.strictEqual(entry.metadata.insertId, eventId);
    });

    it('should not assign insertId if one is already set', () => {
      const eventId = 'event-id';

      fakeEventIdNewOverride = () => {
        return eventId;
      };

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
    let entry;
    const date = new Date();

    beforeEach(() => {
      const seconds = date.getTime() / 1000;
      const secondsRounded = Math.floor(seconds);

      FakeGrpcService.structToObj_ = data => {
        return data;
      };

      entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'jsonPayload',
        jsonPayload: DATA,
        extraProperty: true,
        timestamp: {
          seconds: secondsRounded,
          nanos: Math.floor((seconds - secondsRounded) * 1e9),
        },
      });
    });

    it('should create an Entry', () => {
      assert(entry instanceof Entry);
      assert.strictEqual(entry.metadata.resource, RESOURCE);
      assert.strictEqual(entry.data, DATA);
      assert.strictEqual(entry.metadata.extraProperty, true);
      assert.deepStrictEqual(entry.metadata.timestamp, date);
    });

    it('should extend the entry with proto data', () => {
      const entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'protoPayload',
        protoPayload: DATA,
        extraProperty: true,
      });

      assert.strictEqual(entry.data, DATA);
    });

    it('should extend the entry with json data', () => {
      assert.strictEqual(entry.data, DATA);
    });

    it('should extend the entry with text data', () => {
      const entry = Entry.fromApiResponse_({
        resource: RESOURCE,
        payload: 'textPayload',
        textPayload: DATA,
        extraProperty: true,
      });

      assert.strictEqual(entry.data, DATA);
    });
  });

  describe('toJSON', () => {
    beforeEach(() => {
      FakeGrpcService.objToStruct_ = util.noop;
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

      FakeGrpcService.objToStruct_ = (obj, options) => {
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
      FakeGrpcService.objToStruct_ = (obj, options) => {
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

    it('should convert a date', () => {
      const date = new Date();
      entry.metadata.timestamp = date;

      const json = entry.toJSON();

      const seconds = date.getTime() / 1000;
      const secondsRounded = Math.floor(seconds);

      assert.deepStrictEqual(json.timestamp, {
        seconds: secondsRounded,
        nanos: Math.floor((seconds - secondsRounded) * 1e9),
      });
    });
  });
});
