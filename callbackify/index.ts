/*!
 * Copyright 2019 Google Inc. All Rights Reserved.
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

export interface CallbackifyAllOptions extends CallbackifyOptions {
  /**
   * Array of methods to ignore when callbackifying.
   */
  exclude?: string[];
}

export interface CallbackifyOptions {
  /**
   * Pass to the callback a single arg instead of an array.
   */
  singular?: boolean;
}

export interface CallbackMethod extends Function {
  callbackified_?: boolean;
}

/**
 * Wraps a promisy type function to conditionally call a callback function.
 *
 * @param {function} originalMethod - The method to callbackify.
 * @param {object=} options - Callback options.
 * @param {boolean} options.singular - Pass to the callback a single arg instead of an array.
 * @return {function} wrapped
 */
export function callbackify(originalMethod, options?: CallbackifyOptions) {
  if (originalMethod.callbackified_) {
    return originalMethod;
  }

  options = options || {};

  const slice = Array.prototype.slice;

  // tslint:disable-next-line:no-any
  const wrapper = function(this: any) {
    const context = this;
    let last;
    let cb;
    // search for a callback function in case it is not a last param.
    for (last = arguments.length - 1; last >= 0; last--) {
      const arg = arguments[last];
      if (typeof arg === 'undefined') {
        continue;  // skip undefined.
      }
      if (typeof arg === 'function') {
        cb = arg;
        break;  // callback argument found.
      }
    }
    const args = slice.call(arguments);

    if (cb) {
      originalMethod.apply(context, args)
          .then(res => {
            if (options!.singular && Array.isArray(res) && res.length === 1) {
              cb(null, res[0]);
            } else {
              cb(null, ...res);
            }
          })
          .catch(err => cb(err));
    } else {
      return originalMethod.apply(context, arguments);
    }
  };
  wrapper.callbackified_ = true;
  return wrapper;
}

/**
 * Callbackifies certain Class methods. This will not callbackify private or
 * streaming methods.
 *
 * @param {module:common/service} Class - Service class.
 * @param {object=} options - Configuration object.
 */
export function callbackifyAll(
    // tslint:disable-next-line:variable-name
    Class: Function, options?: CallbackifyAllOptions) {
  const exclude = (options && options.exclude) || [];
  const ownPropertyNames = Object.getOwnPropertyNames(Class.prototype);
  const methods = ownPropertyNames.filter((methodName) => {
    // clang-format off
    return (is.fn(Class.prototype[methodName]) && // is it a function?
      !/^_|(Stream|_)|^constructor$/.test(methodName) && // is it callbackifyable?
      exclude.indexOf(methodName) === -1
    ); // is it blacklisted?
    // clang-format on
  });

  methods.forEach((methodName) => {
    const originalMethod = Class.prototype[methodName];
    if (!originalMethod.promisified_) {
      Class.prototype[methodName] =
          exports.callbackify(originalMethod, options);
    }
  });
}