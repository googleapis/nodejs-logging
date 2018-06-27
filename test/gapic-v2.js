// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const assert = require('assert');

const loggingModule = require('../src');

var FAKE_STATUS_CODE = 1;
var error = new Error();
error.code = FAKE_STATUS_CODE;

describe('LoggingServiceV2Client', () => {
  describe('deleteLog', () => {
    it('invokes deleteLog without error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedLogName = client.logPath('[PROJECT]', '[LOG]');
      var request = {
        logName: formattedLogName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteLog = mockSimpleGrpcMethod(request);

      client.deleteLog(request, err => {
        assert.ifError(err);
        done();
      });
    });

    it('invokes deleteLog with error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedLogName = client.logPath('[PROJECT]', '[LOG]');
      var request = {
        logName: formattedLogName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteLog = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.deleteLog(request, err => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        done();
      });
    });
  });

  describe('writeLogEntries', () => {
    it('invokes writeLogEntries without error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var entries = [];
      var request = {
        entries: entries,
      };

      // Mock response
      var expectedResponse = {};

      // Mock Grpc layer
      client._innerApiCalls.writeLogEntries = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.writeLogEntries(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes writeLogEntries with error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var entries = [];
      var request = {
        entries: entries,
      };

      // Mock Grpc layer
      client._innerApiCalls.writeLogEntries = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.writeLogEntries(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('listLogEntries', () => {
    it('invokes listLogEntries without error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedResourceNames = [];
      var request = {
        resourceNames: formattedResourceNames,
      };

      // Mock response
      var nextPageToken = '';
      var entriesElement = {};
      var entries = [entriesElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        entries: entries,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogEntries = (
        actualRequest,
        options,
        callback
      ) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.entries);
      };

      client.listLogEntries(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.entries);
        done();
      });
    });

    it('invokes listLogEntries with error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedResourceNames = [];
      var request = {
        resourceNames: formattedResourceNames,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogEntries = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listLogEntries(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('listMonitoredResourceDescriptors', () => {
    it('invokes listMonitoredResourceDescriptors without error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var request = {};

      // Mock response
      var nextPageToken = '';
      var resourceDescriptorsElement = {};
      var resourceDescriptors = [resourceDescriptorsElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        resourceDescriptors: resourceDescriptors,
      };

      // Mock Grpc layer
      client._innerApiCalls.listMonitoredResourceDescriptors = (
        actualRequest,
        options,
        callback
      ) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.resourceDescriptors);
      };

      client.listMonitoredResourceDescriptors(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.resourceDescriptors);
        done();
      });
    });

    it('invokes listMonitoredResourceDescriptors with error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var request = {};

      // Mock Grpc layer
      client._innerApiCalls.listMonitoredResourceDescriptors = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listMonitoredResourceDescriptors(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('listLogs', () => {
    it('invokes listLogs without error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock response
      var nextPageToken = '';
      var logNamesElement = 'logNamesElement-1079688374';
      var logNames = [logNamesElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        logNames: logNames,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogs = (actualRequest, options, callback) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.logNames);
      };

      client.listLogs(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.logNames);
        done();
      });
    });

    it('invokes listLogs with error', done => {
      var client = new loggingModule.v2.LoggingServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogs = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listLogs(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });
});
describe('ConfigServiceV2Client', () => {
  describe('listSinks', () => {
    it('invokes listSinks without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock response
      var nextPageToken = '';
      var sinksElement = {};
      var sinks = [sinksElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        sinks: sinks,
      };

      // Mock Grpc layer
      client._innerApiCalls.listSinks = (actualRequest, options, callback) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.sinks);
      };

      client.listSinks(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.sinks);
        done();
      });
    });

    it('invokes listSinks with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock Grpc layer
      client._innerApiCalls.listSinks = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listSinks(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('getSink', () => {
    it('invokes getSink without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var request = {
        sinkName: formattedSinkName,
      };

      // Mock response
      var name = 'name3373707';
      var destination = 'destination-1429847026';
      var filter = 'filter-1274492040';
      var writerIdentity = 'writerIdentity775638794';
      var includeChildren = true;
      var expectedResponse = {
        name: name,
        destination: destination,
        filter: filter,
        writerIdentity: writerIdentity,
        includeChildren: includeChildren,
      };

      // Mock Grpc layer
      client._innerApiCalls.getSink = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.getSink(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes getSink with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var request = {
        sinkName: formattedSinkName,
      };

      // Mock Grpc layer
      client._innerApiCalls.getSink = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.getSink(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('createSink', () => {
    it('invokes createSink without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var sink = {};
      var request = {
        parent: formattedParent,
        sink: sink,
      };

      // Mock response
      var name = 'name3373707';
      var destination = 'destination-1429847026';
      var filter = 'filter-1274492040';
      var writerIdentity = 'writerIdentity775638794';
      var includeChildren = true;
      var expectedResponse = {
        name: name,
        destination: destination,
        filter: filter,
        writerIdentity: writerIdentity,
        includeChildren: includeChildren,
      };

      // Mock Grpc layer
      client._innerApiCalls.createSink = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.createSink(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes createSink with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var sink = {};
      var request = {
        parent: formattedParent,
        sink: sink,
      };

      // Mock Grpc layer
      client._innerApiCalls.createSink = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.createSink(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('updateSink', () => {
    it('invokes updateSink without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var sink = {};
      var updateMask = {};
      var request = {
        sinkName: formattedSinkName,
        sink: sink,
        updateMask: updateMask,
      };

      // Mock response
      var name = 'name3373707';
      var destination = 'destination-1429847026';
      var filter = 'filter-1274492040';
      var writerIdentity = 'writerIdentity775638794';
      var includeChildren = true;
      var expectedResponse = {
        name: name,
        destination: destination,
        filter: filter,
        writerIdentity: writerIdentity,
        includeChildren: includeChildren,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateSink = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.updateSink(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes updateSink with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var sink = {};
      var updateMask = {};
      var request = {
        sinkName: formattedSinkName,
        sink: sink,
        updateMask: updateMask,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateSink = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.updateSink(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('deleteSink', () => {
    it('invokes deleteSink without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var request = {
        sinkName: formattedSinkName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteSink = mockSimpleGrpcMethod(request);

      client.deleteSink(request, err => {
        assert.ifError(err);
        done();
      });
    });

    it('invokes deleteSink with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedSinkName = client.sinkPath('[PROJECT]', '[SINK]');
      var request = {
        sinkName: formattedSinkName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteSink = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.deleteSink(request, err => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        done();
      });
    });
  });

  describe('listExclusions', () => {
    it('invokes listExclusions without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock response
      var nextPageToken = '';
      var exclusionsElement = {};
      var exclusions = [exclusionsElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        exclusions: exclusions,
      };

      // Mock Grpc layer
      client._innerApiCalls.listExclusions = (
        actualRequest,
        options,
        callback
      ) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.exclusions);
      };

      client.listExclusions(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.exclusions);
        done();
      });
    });

    it('invokes listExclusions with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock Grpc layer
      client._innerApiCalls.listExclusions = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listExclusions(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('getExclusion', () => {
    it('invokes getExclusion without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var request = {
        name: formattedName,
      };

      // Mock response
      var name2 = 'name2-1052831874';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var disabled = true;
      var expectedResponse = {
        name: name2,
        description: description,
        filter: filter,
        disabled: disabled,
      };

      // Mock Grpc layer
      client._innerApiCalls.getExclusion = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.getExclusion(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes getExclusion with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var request = {
        name: formattedName,
      };

      // Mock Grpc layer
      client._innerApiCalls.getExclusion = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.getExclusion(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('createExclusion', () => {
    it('invokes createExclusion without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var exclusion = {};
      var request = {
        parent: formattedParent,
        exclusion: exclusion,
      };

      // Mock response
      var name = 'name3373707';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var disabled = true;
      var expectedResponse = {
        name: name,
        description: description,
        filter: filter,
        disabled: disabled,
      };

      // Mock Grpc layer
      client._innerApiCalls.createExclusion = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.createExclusion(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes createExclusion with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var exclusion = {};
      var request = {
        parent: formattedParent,
        exclusion: exclusion,
      };

      // Mock Grpc layer
      client._innerApiCalls.createExclusion = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.createExclusion(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('updateExclusion', () => {
    it('invokes updateExclusion without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var exclusion = {};
      var updateMask = {};
      var request = {
        name: formattedName,
        exclusion: exclusion,
        updateMask: updateMask,
      };

      // Mock response
      var name2 = 'name2-1052831874';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var disabled = true;
      var expectedResponse = {
        name: name2,
        description: description,
        filter: filter,
        disabled: disabled,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateExclusion = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.updateExclusion(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes updateExclusion with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var exclusion = {};
      var updateMask = {};
      var request = {
        name: formattedName,
        exclusion: exclusion,
        updateMask: updateMask,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateExclusion = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.updateExclusion(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('deleteExclusion', () => {
    it('invokes deleteExclusion without error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var request = {
        name: formattedName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteExclusion = mockSimpleGrpcMethod(request);

      client.deleteExclusion(request, err => {
        assert.ifError(err);
        done();
      });
    });

    it('invokes deleteExclusion with error', done => {
      var client = new loggingModule.v2.ConfigServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedName = client.exclusionPath('[PROJECT]', '[EXCLUSION]');
      var request = {
        name: formattedName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteExclusion = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.deleteExclusion(request, err => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        done();
      });
    });
  });
});
describe('MetricsServiceV2Client', () => {
  describe('listLogMetrics', () => {
    it('invokes listLogMetrics without error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock response
      var nextPageToken = '';
      var metricsElement = {};
      var metrics = [metricsElement];
      var expectedResponse = {
        nextPageToken: nextPageToken,
        metrics: metrics,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogMetrics = (
        actualRequest,
        options,
        callback
      ) => {
        assert.deepStrictEqual(actualRequest, request);
        callback(null, expectedResponse.metrics);
      };

      client.listLogMetrics(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse.metrics);
        done();
      });
    });

    it('invokes listLogMetrics with error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var request = {
        parent: formattedParent,
      };

      // Mock Grpc layer
      client._innerApiCalls.listLogMetrics = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.listLogMetrics(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('getLogMetric', () => {
    it('invokes getLogMetric without error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var request = {
        metricName: formattedMetricName,
      };

      // Mock response
      var name = 'name3373707';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var valueExtractor = 'valueExtractor2047672534';
      var expectedResponse = {
        name: name,
        description: description,
        filter: filter,
        valueExtractor: valueExtractor,
      };

      // Mock Grpc layer
      client._innerApiCalls.getLogMetric = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.getLogMetric(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes getLogMetric with error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var request = {
        metricName: formattedMetricName,
      };

      // Mock Grpc layer
      client._innerApiCalls.getLogMetric = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.getLogMetric(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('createLogMetric', () => {
    it('invokes createLogMetric without error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var metric = {};
      var request = {
        parent: formattedParent,
        metric: metric,
      };

      // Mock response
      var name = 'name3373707';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var valueExtractor = 'valueExtractor2047672534';
      var expectedResponse = {
        name: name,
        description: description,
        filter: filter,
        valueExtractor: valueExtractor,
      };

      // Mock Grpc layer
      client._innerApiCalls.createLogMetric = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.createLogMetric(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes createLogMetric with error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedParent = client.projectPath('[PROJECT]');
      var metric = {};
      var request = {
        parent: formattedParent,
        metric: metric,
      };

      // Mock Grpc layer
      client._innerApiCalls.createLogMetric = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.createLogMetric(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('updateLogMetric', () => {
    it('invokes updateLogMetric without error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var metric = {};
      var request = {
        metricName: formattedMetricName,
        metric: metric,
      };

      // Mock response
      var name = 'name3373707';
      var description = 'description-1724546052';
      var filter = 'filter-1274492040';
      var valueExtractor = 'valueExtractor2047672534';
      var expectedResponse = {
        name: name,
        description: description,
        filter: filter,
        valueExtractor: valueExtractor,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateLogMetric = mockSimpleGrpcMethod(
        request,
        expectedResponse
      );

      client.updateLogMetric(request, (err, response) => {
        assert.ifError(err);
        assert.deepStrictEqual(response, expectedResponse);
        done();
      });
    });

    it('invokes updateLogMetric with error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var metric = {};
      var request = {
        metricName: formattedMetricName,
        metric: metric,
      };

      // Mock Grpc layer
      client._innerApiCalls.updateLogMetric = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.updateLogMetric(request, (err, response) => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        assert(typeof response === 'undefined');
        done();
      });
    });
  });

  describe('deleteLogMetric', () => {
    it('invokes deleteLogMetric without error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var request = {
        metricName: formattedMetricName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteLogMetric = mockSimpleGrpcMethod(request);

      client.deleteLogMetric(request, err => {
        assert.ifError(err);
        done();
      });
    });

    it('invokes deleteLogMetric with error', done => {
      var client = new loggingModule.v2.MetricsServiceV2Client({
        credentials: {client_email: 'bogus', private_key: 'bogus'},
        projectId: 'bogus',
      });

      // Mock request
      var formattedMetricName = client.metricPath('[PROJECT]', '[METRIC]');
      var request = {
        metricName: formattedMetricName,
      };

      // Mock Grpc layer
      client._innerApiCalls.deleteLogMetric = mockSimpleGrpcMethod(
        request,
        null,
        error
      );

      client.deleteLogMetric(request, err => {
        assert(err instanceof Error);
        assert.equal(err.code, FAKE_STATUS_CODE);
        done();
      });
    });
  });
});

function mockSimpleGrpcMethod(expectedRequest, response, error) {
  return function(actualRequest, options, callback) {
    assert.deepStrictEqual(actualRequest, expectedRequest);
    if (error) {
      callback(error);
    } else if (response) {
      callback(null, response);
    } else {
      callback(null);
    }
  };
}
