// Copyright 2017 Google LLC
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

'use strict';

async function writeLogEntry(logName) {
  // [START logging_write_log_entry]
  const {Logging} = require('@google-cloud/logging');
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following line and replace with your values.
   */
  // const logName = 'my-log';
  const log = logging.log(logName);

  // A text log entry
  const text_entry = log.entry('Hello world!');

  // A json log entry with additional context
  const metadata = {
    severity: 'WARNING',
    labels: {
      foo: 'bar',
    },
    // A default log resource is added for some GCP environments
    // This log resource can be overwritten per spec:
    // https://cloud.google.com/logging/docs/reference/v2/rest/v2/MonitoredResource
    resource: {
      type: 'global',
    },
  };

  const message = {
    name: 'King Arthur',
    quest: 'Find the Holy Grail',
    favorite_color: 'Blue',
  };

  const json_Entry = log.entry(metadata, message);

  async function writeLogEntry() {
    // Asynchronously write the log entry
    await log.write(text_entry);

    // Asynchronously batch write the log entries
    await log.write([text_entry, json_Entry]);

    // Let the logging library dispatch logs asynchronously without 
    // awaiting for operation to complete
    log.write(text_entry);

    console.log(`Wrote to ${logName}`);
  }
  writeLogEntry();
  // [END logging_write_log_entry]
}

async function listLogs() {
  // [START logging_list_logs]
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  async function printLogNames() {
    const [logs] = await logging.getLogs();
    console.log('Logs:');
    logs.forEach(log => {
      console.log(log.name);
    });
  }
  printLogNames();
  // [END logging_list_logs]
}

async function listLogEntries(logName) {
  // [START logging_list_log_entries]
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following line to run the code.
   */
  // const logName = 'Name of the log from which to list entries, e.g. my-log';

  const log = logging.log(logName);

  async function printEntryMetadata() {
    // List the most recent entries for a given log
    // See https://googleapis.dev/nodejs/logging/latest/Logging.html#getEntries
    const [entries] = await log.getEntries();
    console.log('Logs:');
    entries.forEach(entry => {
      const metadata = entry.metadata;
      console.log(`${metadata.timestamp}:`, metadata[metadata.payload]);
    });
  }
  printEntryMetadata();
  // [END logging_list_log_entries]
}

async function listLogEntriesAdvanced(filter, pageSize, orderBy) {
  // [START logging_list_log_entries_advanced]
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following lines to run the code.
   *
   * Filter results, e.g. "severity=ERROR"
   * See https://cloud.google.com/logging/docs/view/advanced_filters for more
   * filter information.
   */
  // const filter = 'severity=ERROR';
  // const pageSize = 5;
  // const orderBy = 'timestamp desc';

  const options = {
    filter: filter,
    pageSize: pageSize,
    orderBy: orderBy,
  };

  async function printEntryMetadata() {
    // See https://googleapis.dev/nodejs/logging/latest/Logging.html#getEntries
    const [entries] = await logging.getEntries(options);
    console.log('Logs:');
    entries.forEach(entry => {
      const metadata = entry.metadata;
      console.log(`${metadata.timestamp}:`, metadata[metadata.payload]);
    });
  }
  printEntryMetadata();
  // [END logging_list_log_entries_advanced]
}

async function tailLogEntries(logName) {
  // [START logging_tail_log_entries]
  const {Logging} = require('@google-cloud/logging');
  const logging = new Logging();

  /**
   * TODO(developer): Replace logName with the name of your log.
   */
  const log = logging.log(logName);
  console.log('running tail log entries test');

  const stream = log
    .tailEntries({
      filter: 'timestamp > "2021-01-01T23:00:00Z"',
    })
    .on('error', console.error)
    .on('data', resp => {
      console.log(resp.entries);
      console.log(resp.suppressionInfo);
      // If you anticipate many results, you can end a stream early to prevent
      // unnecessary processing and API requests.
      stream.end();
    })
    .on('end', () => {
      console.log('log entry stream has ended');
    });

  // Note: to get all project logs, invoke logging.tailEntries
  // [END logging_tail_log_entries]
}

async function deleteLog(logName) {
  // [START logging_delete_log]
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following line to run the code.
   */
  // const logName = 'Name of the log to delete, e.g. my-log';

  const log = logging.log(logName);

  async function deleteLog() {
    // Deletes a logger and all its entries.
    // Note that a deletion can take several minutes to take effect.
    // See https://googleapis.dev/nodejs/logging/latest/Log.html#delete
    await log.delete();
    console.log(`Deleted log: ${logName}`);
  }
  deleteLog();
  // [END logging_delete_log]
}

async function main() {
  require('yargs')
    .demand(1)
    .command(
      'list',
      'Lists log entries, optionally filtering, limiting, and sorting results.',
      {
        filter: {
          alias: 'f',
          type: 'string',
          requiresArg: true,
          description: 'Only log entries matching the filter are written.',
        },
        limit: {
          alias: 'l',
          type: 'number',
          requiresArg: true,
          description: 'Maximum number of results to return.',
        },
        sort: {
          alias: 's',
          type: 'string',
          requiresArg: true,
          description: 'Sort results.',
        },
      },
      opts => {
        listLogEntriesAdvanced(opts.filter, opts.limit, opts.sort);
      }
    )
    .command('list-logs', 'Lists logs in your project.', {}, listLogs)
    .command('list-simple <logName>', 'Lists log entries.', {}, opts =>
      listLogEntries(opts.logName)
    )
    .command(
      'tail-logs <logName>',
      'Tails log entries for a specified log.',
      {},
      opts => tailLogEntries(opts.logName)
    )
    .command(
      'write-simple <logName>',
      'Writes a basic log entry to the specified log.',
      {},
      opts => {
        writeLogEntry(opts.logName);
      }
    )
    .command('delete <logName>', 'Deletes the specified Log.', {}, opts => {
      deleteLog(opts.logName);
    })
    .example('node $0 list', 'List all log entries.')
    .example(
      'node $0 list -f "severity=ERROR" -s "timestamp" -l 2',
      'List up to 2 error entries, sorted by timestamp ascending.'
    )
    .example(
      'node $0 list -f \'logName="my-log"\' -l 2',
      'List up to 2 log entries from the "my-log" log.'
    )
    .example(
      'node $0 write my-log \'{"type":"gae_app","labels":{"module_id":"default"}}\' \'"Hello World!"\'',
      'Write a string log entry.'
    )
    .example(
      'node $0 write my-log \'{"type":"global"}\' \'{"message":"Hello World!"}\'',
      'Write a JSON log entry.'
    )
    .example('node $0 delete my-log', 'Delete "my-log".')
    .wrap(120)
    .recommendCommands()
    .epilogue('For more information, see https://cloud.google.com/logging/docs')
    .help()
    .strict().argv;
}

main().catch(console.error);
