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
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following line to run the code.
   */
  // const logName = 'Name of the log to write to, e.g. my-log';

  const log = logging.log(logName);

  // Modify this resource to match a resource in your project
  // See
  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  const resource = {
    // This example targets the "global" resource for simplicity
    type: 'global',
  };

  // A text log entry
  const entry = log.entry({resource}, 'Hello, world!');

  // A structured log entry
  const secondEntry = log.entry(
    {resource: resource},
    {
      name: 'King Arthur',
      quest: 'Find the Holy Grail',
      favorite_color: 'Blue',
    }
  );

  // Save the two log entries. You can write entries one at a time, but it is
  // best to write multiple entires together in a batch.
  await log.write([entry, secondEntry]);
  console.log(`Wrote to ${logName}`);

  // [END logging_write_log_entry]
}

async function writeLogEntryAdvanced(logName, options) {
  // [START logging_write_log_entry_advanced]
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging();

  /**
   * TODO(developer): Uncomment the following lines to run the code.
   */
  // const logName = 'Name of the log to write to, e.g. my-log';
  // const options = {
  //   resource: {...}, // TODO(developer): Fill this in
  //   entry: 'Hello, world!'
  // };

  const log = logging.log(logName);

  // Prepare the entry
  const entry = log.entry({resource: options.resource}, options.entry);

  // See
  // https://googlecloudplatform.github.io/google-cloud-node/#/docs/logging/latest/logging/log?method=write
  await log.write(entry);
  console.log(`Wrote to ${logName}`);

  // [END logging_write_log_entry_advanced]
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

  // List the most recent entries for a given log
  // See
  // https://googlecloudplatform.github.io/google-cloud-node/#/docs/logging/latest/logging?method=getEntries
  const [entries] = await log.getEntries();
  console.log('Logs:');
  entries.forEach(entry => {
    const metadata = entry.metadata;
    console.log(`${metadata.timestamp}:`, metadata[metadata.payload]);
  });

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
  // const orderBy = 'timestamp';

  const options = {
    filter: filter,
    pageSize: pageSize,
    orderBy: orderBy,
  };

  // See
  // https://googlecloudplatform.github.io/google-cloud-node/#/docs/logging/latest/logging?method=getEntries
  const [entries] = await logging.getEntries(options);
  console.log('Logs:');
  entries.forEach(entry => {
    const metadata = entry.metadata;
    console.log(`${metadata.timestamp}:`, metadata[metadata.payload]);
  });

  // [START logging_list_log_entries_advanced]
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

  // Deletes a logger and all its entries.
  // Note that a deletion can take several minutes to take effect.
  // See
  // https://googlecloudplatform.github.io/google-cloud-node/#/docs/logging/latest/logging/log?method=delete
  await log.delete();
  console.log(`Deleted log: ${logName}`);

  // [END logging_delete_log]
}

async function main() {
  require(`yargs`)
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
      'write <logName> <resource> <entry>',
      'Writes a log entry to the specified log.',
      {},
      opts => {
        try {
          opts.resource = JSON.parse(opts.resource);
        } catch (err) {
          console.error('"resource" must be a valid JSON string!');
          return;
        }

        try {
          opts.entry = JSON.parse(opts.entry);
        } catch (err) {
          console.error('"entry" must be a valid JSON string!');
          return;
        }

        writeLogEntryAdvanced(opts.logName, opts);
      }
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
      `node $0 list -f 'logName="my-log"' -l 2`,
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
    .epilogue(`For more information, see https://cloud.google.com/logging/docs`)
    .help()
    .strict().argv;
}

main().catch(console.error);
