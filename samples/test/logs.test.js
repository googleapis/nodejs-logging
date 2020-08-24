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

const {assert} = require('chai');
const {describe, it, after} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const {Logging} = require('@google-cloud/logging');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cmd = 'node logs';
const TESTS_PREFIX = 'nodejs-docs-samples-test';
const logName = `${TESTS_PREFIX}-${Date.now()}-${uuid.v4().split('-').pop()}`;
const projectId = process.env.GCLOUD_PROJECT;
const logging = new Logging({projectId});
const message = 'Hello world!';

describe('logs', () => {
  after(async () => {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    await deleteLogs();

    async function deleteLogs() {
      const maxPatienceMs = 300000; // 5 minutes.
      let logs;

      try {
        [logs] = await logging.getLogs({
          pageSize: 10000,
        });
      } catch (e) {
        console.warn('Error retrieving logs:');
        console.warn(`  ${e.message}`);
        console.warn('No test logs were deleted');
        return;
      }

      const logsToDelete = logs.filter(log => {
        return (
          log.name.startsWith(TESTS_PREFIX) &&
          getDateFromGeneratedName(log.name) < oneHourAgo
        );
      });

      if (logsToDelete.length > 0) {
        console.log('Deleting', logsToDelete.length, 'test logs...');
      }

      let numLogsDeleted = 0;
      for (const log of logsToDelete) {
        console.log(log.name);
        try {
          await log.delete();
          numLogsDeleted++;

          // A one second gap is preferred between delete calls to avoid rate
          // limiting.
          let timeoutMs = 1000;
          if (numLogsDeleted * 1000 > maxPatienceMs) {
            // This is taking too long. If we hit the rate limit, we'll
            // hopefully scoop up the stragglers on a future test run.
            timeoutMs = 10;
          }
          await new Promise(res => setTimeout(res, timeoutMs));
        } catch (e) {
          if (e.code === 8) {
            console.warn(
              'Rate limit reached. The next test run will attempt to delete the rest'
            );
            break;
          }
          if (e.code !== 5) {
            // Log exists, but couldn't be deleted.
            console.warn(`Deleting ${log.name} failed:`, e.message);
          }
        }
      }

      if (logsToDelete.length > 0) {
        console.log(`${numLogsDeleted}/${logsToDelete.length} logs deleted`);
      }
    }
  });

  it('should write a log entry', () => {
    const output = execSync(
      `${cmd} write ${logName} '{"type":"global"}' '{"message":"${message}"}'`
    );
    assert.include(output, `Wrote to ${logName}`);
  });

  it('should write a simple log entry', () => {
    const output = execSync(`${cmd} write-simple ${logName}`);
    assert.include(output, `Wrote to ${logName}`);
  });
});

// Parse the time the resource was created using the resource id
// Format 1: ${TESTS_PREFIX}-${date}-${uuid}
function getDateFromGeneratedName(name) {
  const timeCreated = name.substr(TESTS_PREFIX.length + 1).split(/-/g)[0];
  return new Date(Number(timeCreated));
}
