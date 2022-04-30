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

import arrify = require('arrify');
import path = require('path');
import {google} from '../../protos/protos';
import {Entry} from '../entry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const global: {[index: string]: any};

// The global variable keeping track if instrumentation record was already written or not.
// The instrumentation record should be generated only once per process and contain logging
// libraries related info.
global.instrumentationAdded = false;

// The variable to hold cached library version
let libraryVersion: string;

// Max length for instrumentation library name and version values
const maxDiagnosticValueLen = 14;

export const DIAGNOSTIC_INFO_KEY = 'logging.googleapis.com/diagnostic';
export const INSTRUMENTATION_SOURCE_KEY = 'instrumentation_source';
export const NODEJS_LIBRARY_NAME_PREFIX = 'nodejs';
export type InstrumentationInfo = {name: string; version: string};

/**
 * This method returns the status if instrumentation info was already added or not.
 * @returns true if the log record with instrumentation info was already added, false otherwise.
 */
export function getInstrumentationInfoStatus() {
  return global.instrumentationAdded;
}

/**
 * This method helps to populate entries with instrumentation data
 * @param entry {Entry} The entry or array of entries to be populated with instrumentation info
 * @returns {Entry} Array of entries which contains an entry with current library instrumentation info
 */
export function populatedInstrumentationInfo(entry: Entry | Entry[]): Entry[] {
  // Update the flag indicating that instrumentation entry was already added once,
  // so any subsequent calls to this method will not add a separate instrumentation log entry
  let isWritten = global.instrumentationAdded;
  global.instrumentationAdded = true;
  const entries: Entry[] = [];
  if (entry) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const entryItem of arrify(entry) as any[]) {
      if (entryItem) {
        const info =
          entryItem.data?.[DIAGNOSTIC_INFO_KEY]?.[INSTRUMENTATION_SOURCE_KEY];
        if (info) {
          // Validate and update the instrumentation info with current library info
          entryItem.data[DIAGNOSTIC_INFO_KEY][INSTRUMENTATION_SOURCE_KEY] =
            validateAndUpdateInstrumentation(info);
          // Indicate that instrumentation info log entry already exists
          // and that current library info was added to existing log entry
          isWritten = true;
        }
        entries.push(entryItem);
      }
    }
  }
  // If no instrumentation info was added before, append a separate log entry with
  // instrumentation data for this library
  if (!isWritten) {
    entries.push(createDiagnosticEntry(undefined, undefined));
  }
  return entries;
}

/**
 * The helper method to generate a log entry with diagnostic instrumentation data.
 * @param libraryName {string} The name of the logging library to ve reported. Should be prefixed with 'nodejs'.
 *        Will be truncated if longer than 14 characters.
 * @param libraryVersion {string} The version of the logging library to be reported. Will be truncated if longer than 14 characters.
 * @returns {Entry} The entry with diagnostic instrumentation data.
 */
export function createDiagnosticEntry(
  libraryName: string | undefined,
  libraryVersion: string | undefined
): Entry {
  // Validate the libraryName first and make sure it starts with 'nodejs' prefix.
  if (!libraryName || !libraryName.startsWith(NODEJS_LIBRARY_NAME_PREFIX)) {
    libraryName = NODEJS_LIBRARY_NAME_PREFIX;
  }
  const entry = new Entry(
    {
      severity: google.logging.type.LogSeverity.INFO,
    },
    {
      [DIAGNOSTIC_INFO_KEY]: {
        [INSTRUMENTATION_SOURCE_KEY]: [
          {
            // Truncate libraryName and libraryVersion if more than 14 characters length
            name: truncateValue(libraryName),
            version: truncateValue(libraryVersion ?? getLibraryVersion()),
          },
        ],
      },
    }
  );
  return entry;
}

/**
 * This method validates that provided instrumentation info list is valid and also adds current library info to a list.
 * @param infoList {InstrumentationInfo} The array of InstrumentationInfo to be validated and updated.
 * @returns {InstrumentationInfo} The updated list of InstrumentationInfo.
 */
function validateAndUpdateInstrumentation(
  infoList: InstrumentationInfo[]
): InstrumentationInfo[] {
  const finalInfo: InstrumentationInfo[] = [];
  // First, add current library information
  finalInfo.push({
    name: NODEJS_LIBRARY_NAME_PREFIX,
    version: getLibraryVersion(),
  });
  // Iterate through given list of libraries and for each entry perform validations and transformations
  // Limit amount of entries to be up to 3
  let count = 1;
  for (const info of infoList) {
    if (isValidInfo(info)) {
      finalInfo.push({
        name: truncateValue(info.name),
        version: truncateValue(info.version),
      });
    }
    if (++count === 3) break;
  }
  return finalInfo;
}

/**
 * A helper function to truncate a value (library name or version). The value is truncated
 * when it is longet than 14 chars and '*' is added instead of truncated suffix.
 * @param value {string} The library name or version to be truncated.
 * @returns {string} The truncated value.
 */
function truncateValue(value: string) {
  if (value && value.length > maxDiagnosticValueLen) {
    return value.substring(0, maxDiagnosticValueLen).concat('*');
  }
  return value;
}

/**
 * The helper function to retrieve current library version from 'package.json' file. Note that
 * since we use {path.resolve}, the search for 'package.json' could be impacted by current working directory.
 * @returns {string} A current library version.
 */
export function getLibraryVersion() {
  if (libraryVersion) {
    return libraryVersion;
  }
  libraryVersion = require(path.resolve('package.json')).version;
  return libraryVersion;
}

/**
 * The helper function which checks if given InstrumentationInfo is valid.
 * @param info {InstrumentationInfo} The info to be validated.
 * @returns true if given info is valid, false otherwise
 */
function isValidInfo(info: InstrumentationInfo) {
  if (
    !info ||
    !info.name ||
    !info.version ||
    !info.name.startsWith(NODEJS_LIBRARY_NAME_PREFIX)
  ) {
    return false;
  }
  return true;
}

/**
 * The helper method used for tests to reset a status if instrumentation already written.
 */
export function testResetInstrumentationStatus() {
  global.instrumentationAdded = false;
}
