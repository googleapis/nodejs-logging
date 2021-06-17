/*!
 * Copyright 2021 Google LLC
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

/*
 * This file contains helpers to create a structured log in JSON format from a
 * fully formed, write request that would have otherwise been sent to the API.
 *
 * This is helpful in development mode or for users in serverless environments
 * who wish stream logs through non-API transports, like stdout. It ensures
 * users can write context rich logs without manually constructing a JSON
 * payload.
 *
 * Read more: https://cloud.google.com/logging/docs/structured-logging
 */

export const INSERT_ID_KEY = 'logging.googleapis.com/insertId'
export const LABELS_KEY = 'logging.googleapis.com/labels';
export const OPERATION_KEY = 'logging.googleapis.com/operation';
export const SOURCE_LOCATION_KEY = 'logging.googleapis.com/sourceLocation';
export const SPAN_ID_KEY = 'logging.googleapis.com/spanId';
export const TRACE_KEY = 'logging.googleapis.com/trace';
export const TRACE_SAMPLED_KEY = 'logging.googleapis.com/trace_sampled';

/**
 * structuredLog represents log entries that use the jsonPayload field to add
 * structure to their payloads. This format can be converted into JSON format
 * and parsed by Coud Logging agents in various GCP environments.
 *
 * Read more: https://cloud.google.com/logging/docs/structured-logging
 */
interface StructuredLog {
  // Universally supported properties
  severity?: string;
  message?: string | object;
  // log is a legacy property, always clobbered by `message`
  log?: string;
  httpRequest?: object;
  timestamp?: string;
  [INSERT_ID_KEY]?: string;
  [LABELS_KEY]?: object;
  [OPERATION_KEY]?: object;
  [SOURCE_LOCATION_KEY]?: string;
  [SPAN_ID_KEY]?: string;
  [TRACE_KEY]?: string;
  [TRACE_SAMPLED_KEY]?: boolean;
  // Additional properties supported by Serverless agents
  timestampSeconds?: string;
  timestampNanos?: string;
  time?: string;
  // Properties not supported by all agents (e.g. Cloud Run)
  logName?: string;
  resource?: object;
}

/**
 * getStructuredLogs takes a request blob and formats a structured log in
 * stringified JSON format
 *
 * @param req
 */
export function getStructuredLogs(req: any): string[] {
  const logs: string[] = [];
  // Format entries into structured log
  for (const entry of req.entries) {
    // general
    const log = {} as StructuredLog;
    // TODO make sure all formatting is ok
    req.logName ? log.logName = req.logName : null;
    req.resource ? log.resource = req.resource : null;
    req.labels ? log[LABELS_KEY] = req.labels : null;
    entry.severity ? log.severity = entry.severity : null;
    entry.textPayload || entry.jsonPayload
      ? (log.message = entry.textPayload)
      : entry.jsonPayload;
    entry.httpRequest ? log.httpRequest = entry.httpRequest : null;
    entry.timestamp ? log.timestamp = 'todo this later' : null;
    entry.insertId ? log[INSERT_ID_KEY] = entry.insertId.toString() : null; // formatted
    entry.spanId ? log[SPAN_ID_KEY] = entry.spanId : null;
    entry.trace ? log[TRACE_KEY] = entry.trace : null;
    'traceSampled' in entry ? log[TRACE_SAMPLED_KEY] = entry.traceSampled : null;
    console.log('formatting:');
    console.log(entry);
    console.log(log);
    // TODO get rid of undefined values
    logs.push(JSON.stringify(log) + '\n');
  }
  return logs;
}
