/*!
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

import * as is from 'is';

export interface ObjectToStructConverterConfig {
  removeCircular?: boolean;
  stringify?: boolean;
}

export function objToStruct(obj: {}, options: ObjectToStructConverterConfig) {
  return new ObjectToStructConverter(options).convert(obj);
}

export class ObjectToStructConverter {
  seenObjects: Set<{}>;
  removeCircular: boolean;
  stringify?: boolean;
  /**
   * A class that can be used to convert an object to a struct. Optionally this
   * class can be used to erase/throw on circular references during conversion.
   *
   * @private
   *
   * @param {object=} options - Configuration object.
   * @param {boolean} options.removeCircular - Remove circular references in the
   *     object with a placeholder string. (Default: `false`)
   * @param {boolean} options.stringify - Stringify un-recognized types. (Default:
   *     `false`)
   */
  constructor(options?: ObjectToStructConverterConfig) {
    options = options || {};
    this.seenObjects = new Set();
    this.removeCircular = options.removeCircular === true;
    this.stringify = options.stringify === true;
  }

  /**
   * Begin the conversion process from a JS object to an encoded gRPC Value
   * message.
   *
   * @param {*} value - The input value.
   * @return {object} - The encoded value.
   *
   * @example
   * ObjectToStructConverter.convert({
   *   aString: 'Hi'
   * });
   * // {
   * //   fields: {
   * //     aString: {
   * //       stringValue: 'Hello!'
   * //     }
   * //   }
   * // }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  convert(obj: any) {
    const convertedObject = {
      fields: {},
    };
    this.seenObjects.add(obj);
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const value = obj[prop];
        if (is.undefined(value)) {
          continue;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (convertedObject as any).fields[prop] = this.encodeValue_(value);
      }
    }
    this.seenObjects.delete(obj);
    return convertedObject;
  }

  /**
   * Convert a raw value to a type-denoted protobuf message-friendly object.
   *
   * @private
   *
   * @param {*} value - The input value.
   * @return {*} - The encoded value.
   *
   * @example
   * ObjectToStructConverter.encodeValue('Hi');
   * // {
   * //   stringValue: 'Hello!'
   * // }
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encodeValue_(value: {} | null): any {
    let convertedValue;

    if (is.null(value)) {
      convertedValue = {
        nullValue: 0,
      };
    } else if (is.number(value)) {
      convertedValue = {
        numberValue: value,
      };
    } else if (is.string(value)) {
      convertedValue = {
        stringValue: value,
      };
    } else if (is.boolean(value)) {
      convertedValue = {
        boolValue: value,
      };
    } else if (Buffer.isBuffer(value)) {
      convertedValue = {
        blobValue: value,
      };
    } else if (is.object(value)) {
      if (this.seenObjects.has(value!)) {
        // Circular reference.
        if (!this.removeCircular) {
          throw new Error(
            [
              'This object contains a circular reference. To automatically',
              'remove it, set the `removeCircular` option to true.',
            ].join(' ')
          );
        }
        convertedValue = {
          stringValue: '[Circular]',
        };
      } else {
        convertedValue = {
          structValue: this.convert(value!),
        };
      }
    } else if (is.array(value)) {
      convertedValue = {
        listValue: {
          values: (value as Array<{}>).map(this.encodeValue_.bind(this)),
        },
      };
    } else {
      if (!this.stringify) {
        throw new Error('Value of type ' + typeof value + ' not recognized.');
      }
      convertedValue = {
        stringValue: String(value),
      };
    }
    return convertedValue;
  }
}

/**
 * Condense a protobuf Struct into an object of only its values.
 *
 * @private
 *
 * @param {object} struct - A protobuf Struct message.
 * @return {object} - The simplified object.
 *
 * @example
 * GrpcService.structToObj_({
 *   fields: {
 *     name: {
 *       kind: 'stringValue',
 *       stringValue: 'Stephen'
 *     }
 *   }
 * });
 * // {
 * //   name: 'Stephen'
 * // }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function structToObj(struct: any) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const convertedObject = {} as any;
  for (const prop in struct.fields) {
    // eslint-disable-next-line no-prototype-builtins
    if (struct.fields.hasOwnProperty(prop)) {
      const value = struct.fields[prop];
      convertedObject[prop] = decodeValue(value);
    }
  }

  return convertedObject;
}

/**
 * Decode a protobuf Struct's value.
 *
 * @param {object} value - A Struct's Field message.
 * @return {*} - The decoded value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeValue(value: any) {
  switch (value.kind) {
    case 'structValue': {
      return structToObj(value.structValue);
    }

    case 'nullValue': {
      return null;
    }

    case 'listValue': {
      return value.listValue.values.map(decodeValue);
    }

    default: {
      return value[value.kind];
    }
  }
}
