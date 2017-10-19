// Copyright 2017, Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Note: this file is purely for documentation. Any contents are not expected
// to be loaded as the JS file.

/**
 * Describes a sink used to export log entries to one of the following
 * destinations in any project: a Cloud Storage bucket, a BigQuery dataset, or a
 * Cloud Pub/Sub topic.  A logs filter controls which log entries are
 * exported. The sink must be created within a project, organization, billing
 * account, or folder.
 *
 * @property {string} name
 *   Required. The client-assigned sink identifier, unique within the
 *   project. Example: `"my-syslog-errors-to-pubsub"`.  Sink identifiers are
 *   limited to 100 characters and can include only the following characters:
 *   upper and lower-case alphanumeric characters, underscores, hyphens, and
 *   periods.
 *
 * @property {string} destination
 *   Required. The export destination:
 *
 *       "storage.googleapis.com/[GCS_BUCKET]"
 *       "bigquery.googleapis.com/projects/[PROJECT_ID]/datasets/[DATASET]"
 *       "pubsub.googleapis.com/projects/[PROJECT_ID]/topics/[TOPIC_ID]"
 *
 *   The sink's `writer_identity`, set when the sink is created, must
 *   have permission to write to the destination or else the log
 *   entries are not exported.  For more information, see
 *   [Exporting Logs With Sinks](https://cloud.google.com/logging/docs/api/tasks/exporting-logs).
 *
 * @property {string} filter
 *   Optional.
 *   An [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced_filters).  The only
 *   exported log entries are those that are in the resource owning the sink and
 *   that match the filter. The filter must use the log entry format specified
 *   by the `output_version_format` parameter.  For example, in the v2 format:
 *
 *       logName="projects/[PROJECT_ID]/logs/[LOG_ID]" AND severity>=ERROR
 *
 * @property {number} outputVersionFormat
 *   Deprecated. The log entry format to use for this sink's exported log
 *   entries.  The v2 format is used by default and cannot be changed.
 *
 *   The number should be among the values of [VersionFormat]{@link google.logging.v2.VersionFormat}
 *
 * @property {string} writerIdentity
 *   Output only. An IAM identity&mdash;a service account or group&mdash;under
 *   which Stackdriver Logging writes the exported log entries to the sink's
 *   destination.  This field is set by
 *   [sinks.create](https://cloud.google.com/logging/docs/api/reference/rest/v2/projects.sinks/create)
 *   and
 *   [sinks.update](https://cloud.google.com/logging/docs/api/reference/rest/v2/projects.sinks/update),
 *   based on the setting of `unique_writer_identity` in those methods.
 *
 *   Until you grant this identity write-access to the destination, log entry
 *   exports from this sink will fail. For more information,
 *   see [Granting access for a
 *   resource](https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource).
 *   Consult the destination service's documentation to determine the
 *   appropriate IAM roles to assign to the identity.
 *
 * @property {boolean} includeChildren
 *   Optional. This field applies only to sinks owned by organizations and
 *   folders. If the field is false, the default, only the logs owned by the
 *   sink's parent resource are available for export. If the field is true, then
 *   logs from all the projects, folders, and billing accounts contained in the
 *   sink's parent resource are also available for export. Whether a particular
 *   log entry from the children is exported depends on the sink's filter
 *   expression. For example, if this field is true, then the filter
 *   `resource.type=gce_instance` would export all Compute Engine VM instance
 *   log entries from all projects in the sink's parent. To only export entries
 *   from certain child projects, filter on the project part of the log name:
 *
 *       logName:("projects/test-project1/" OR "projects/test-project2/") AND
 *       resource.type=gce_instance
 *
 * @property {Object} startTime
 *   Optional. The time at which this sink will begin exporting log entries.
 *   Log entries are exported only if their timestamp is not earlier than the
 *   start time.  The default value of this field is the time the sink is
 *   created or updated.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @property {Object} endTime
 *   Optional. The time at which this sink will stop exporting log entries.  Log
 *   entries are exported only if their timestamp is earlier than the end time.
 *   If this field is not supplied, there is no end time.  If both a start time
 *   and an end time are provided, then the end time must be later than the
 *   start time.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @typedef LogSink
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogSink definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var LogSink = {
  // This is for documentation. Actual contents will be loaded by gRPC.

  /**
   * Available log entry formats. Log entries can be written to Stackdriver
   * Logging in either format and can be exported in either format.
   * Version 2 is the preferred format.
   *
   * @enum {number}
   * @memberof google.logging.v2
   */
  VersionFormat: {

    /**
     * An unspecified format version that will default to V2.
     */
    VERSION_FORMAT_UNSPECIFIED: 0,

    /**
     * `LogEntry` version 2 format.
     */
    V2: 1,

    /**
     * `LogEntry` version 1 format.
     */
    V1: 2
  }
};

/**
 * The parameters to `ListSinks`.
 *
 * @property {string} parent
 *   Required. The parent resource whose sinks are to be listed:
 *
 *       "projects/[PROJECT_ID]"
 *       "organizations/[ORGANIZATION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]"
 *       "folders/[FOLDER_ID]"
 *
 * @property {string} pageToken
 *   Optional. If present, then retrieve the next batch of results from the
 *   preceding call to this method.  `pageToken` must be the value of
 *   `nextPageToken` from the previous response.  The values of other method
 *   parameters should be identical to those in the previous call.
 *
 * @property {number} pageSize
 *   Optional. The maximum number of results to return from this request.
 *   Non-positive values are ignored.  The presence of `nextPageToken` in the
 *   response indicates that more results might be available.
 *
 * @typedef ListSinksRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListSinksRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var ListSinksRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Result returned from `ListSinks`.
 *
 * @property {Object[]} sinks
 *   A list of sinks.
 *
 *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
 *
 * @property {string} nextPageToken
 *   If there might be more results than appear in this response, then
 *   `nextPageToken` is included.  To get the next set of results, call the same
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListSinksResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListSinksResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var ListSinksResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `GetSink`.
 *
 * @property {string} sinkName
 *   Required. The resource name of the sink:
 *
 *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
 *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
 *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
 *
 *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
 *
 * @typedef GetSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.GetSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var GetSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `CreateSink`.
 *
 * @property {string} parent
 *   Required. The resource in which to create the sink:
 *
 *       "projects/[PROJECT_ID]"
 *       "organizations/[ORGANIZATION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]"
 *       "folders/[FOLDER_ID]"
 *
 *   Examples: `"projects/my-logging-project"`, `"organizations/123456789"`.
 *
 * @property {Object} sink
 *   Required. The new sink, whose `name` parameter is a sink identifier that
 *   is not already in use.
 *
 *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
 *
 * @property {boolean} uniqueWriterIdentity
 *   Optional. Determines the kind of IAM identity returned as `writer_identity`
 *   in the new sink.  If this value is omitted or set to false, and if the
 *   sink's parent is a project, then the value returned as `writer_identity` is
 *   the same group or service account used by Stackdriver Logging before the
 *   addition of writer identities to this API. The sink's destination must be
 *   in the same project as the sink itself.
 *
 *   If this field is set to true, or if the sink is owned by a non-project
 *   resource such as an organization, then the value of `writer_identity` will
 *   be a unique service account used only for exports from the new sink.  For
 *   more information, see `writer_identity` in LogSink.
 *
 * @typedef CreateSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.CreateSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var CreateSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `UpdateSink`.
 *
 * @property {string} sinkName
 *   Required. The full resource name of the sink to update, including the
 *   parent resource and the sink identifier:
 *
 *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
 *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
 *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
 *
 *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
 *
 * @property {Object} sink
 *   Required. The updated sink, whose name is the same identifier that appears
 *   as part of `sink_name`.
 *
 *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
 *
 * @property {boolean} uniqueWriterIdentity
 *   Optional. See
 *   [sinks.create](https://cloud.google.com/logging/docs/api/reference/rest/v2/projects.sinks/create)
 *   for a description of this field.  When updating a sink, the effect of this
 *   field on the value of `writer_identity` in the updated sink depends on both
 *   the old and new values of this field:
 *
 *   +   If the old and new values of this field are both false or both true,
 *       then there is no change to the sink's `writer_identity`.
 *   +   If the old value is false and the new value is true, then
 *       `writer_identity` is changed to a unique service account.
 *   +   It is an error if the old value is true and the new value is
 *       set to false or defaulted to false.
 *
 * @typedef UpdateSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var UpdateSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `DeleteSink`.
 *
 * @property {string} sinkName
 *   Required. The full resource name of the sink to delete, including the
 *   parent resource and the sink identifier:
 *
 *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
 *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
 *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
 *
 *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
 *
 * @typedef DeleteSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.DeleteSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var DeleteSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Specifies a set of log entries that are not to be stored in Stackdriver
 * Logging. If your project receives a large volume of logs, you might be able
 * to use exclusions to reduce your chargeable logs. Exclusions are processed
 * after log sinks, so you can export log entries before they are excluded.
 * Audit log entries and log entries from Amazon Web Services are never
 * excluded.
 *
 * @property {string} name
 *   Required. A client-assigned identifier, such as
 *   `"load-balancer-exclusion"`. Identifiers are limited to 100 characters and
 *   can include only letters, digits, underscores, hyphens, and periods.
 *
 * @property {string} description
 *   Optional. A description of this exclusion.
 *
 * @property {string} filter
 *   Required.
 *   An [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced_filters)
 *   that matches the log entries to be excluded. By using the
 *   [sample function](https://cloud.google.com/logging/docs/view/advanced_filters#sample),
 *   you can exclude less than 100% of the matching log entries.
 *   For example, the following filter matches 99% of low-severity log
 *   entries from load balancers:
 *
 *       "resource.type=http_load_balancer severity<ERROR sample(insertId, 0.99)"
 *
 * @property {boolean} disabled
 *   Optional. If set to True, then this exclusion is disabled and it does not
 *   exclude any log entries. You can use
 *   [exclusions.patch](https://cloud.google.com/logging/docs/alpha-exclusion/docs/reference/v2/rest/v2/projects.exclusions/patch)
 *   to change the value of this field.
 *
 * @typedef LogExclusion
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogExclusion definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var LogExclusion = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `ListExclusions`.
 *
 * @property {string} parent
 *   Required. The parent resource whose exclusions are to be listed.
 *
 *       "projects/[PROJECT_ID]"
 *       "organizations/[ORGANIZATION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]"
 *       "folders/[FOLDER_ID]"
 *
 * @property {string} pageToken
 *   Optional. If present, then retrieve the next batch of results from the
 *   preceding call to this method.  `pageToken` must be the value of
 *   `nextPageToken` from the previous response.  The values of other method
 *   parameters should be identical to those in the previous call.
 *
 * @property {number} pageSize
 *   Optional. The maximum number of results to return from this request.
 *   Non-positive values are ignored.  The presence of `nextPageToken` in the
 *   response indicates that more results might be available.
 *
 * @typedef ListExclusionsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListExclusionsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var ListExclusionsRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Result returned from `ListExclusions`.
 *
 * @property {Object[]} exclusions
 *   A list of exclusions.
 *
 *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
 *
 * @property {string} nextPageToken
 *   If there might be more results than appear in this response, then
 *   `nextPageToken` is included.  To get the next set of results, call the same
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListExclusionsResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListExclusionsResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var ListExclusionsResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `GetExclusion`.
 *
 * @property {string} name
 *   Required. The resource name of an existing exclusion:
 *
 *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
 *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
 *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
 *
 *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
 *
 * @typedef GetExclusionRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.GetExclusionRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var GetExclusionRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `CreateExclusion`.
 *
 * @property {string} parent
 *   Required. The parent resource in which to create the exclusion:
 *
 *       "projects/[PROJECT_ID]"
 *       "organizations/[ORGANIZATION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]"
 *       "folders/[FOLDER_ID]"
 *
 *   Examples: `"projects/my-logging-project"`, `"organizations/123456789"`.
 *
 * @property {Object} exclusion
 *   Required. The new exclusion, whose `name` parameter is an exclusion name
 *   that is not already used in the parent resource.
 *
 *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
 *
 * @typedef CreateExclusionRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.CreateExclusionRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var CreateExclusionRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `UpdateExclusion`.
 *
 * @property {string} name
 *   Required. The resource name of the exclusion to update:
 *
 *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
 *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
 *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
 *
 *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
 *
 * @property {Object} exclusion
 *   Required. New values for the existing exclusion. Only the fields specified
 *   in `update_mask` are relevant.
 *
 *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
 *
 * @property {Object} updateMask
 *   Required. A nonempty list of fields to change in the existing exclusion.
 *   New values for the fields are taken from the corresponding fields in the
 *   LogExclusion included in this request. Fields not mentioned in
 *   `update_mask` are not changed and are ignored in the request.
 *
 *   For example, to change the filter and description of an exclusion,
 *   specify an `update_mask` of `"filter,description"`.
 *
 *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
 *
 * @typedef UpdateExclusionRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateExclusionRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var UpdateExclusionRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `DeleteExclusion`.
 *
 * @property {string} name
 *   Required. The resource name of an existing exclusion to delete:
 *
 *       "projects/[PROJECT_ID]/exclusions/[EXCLUSION_ID]"
 *       "organizations/[ORGANIZATION_ID]/exclusions/[EXCLUSION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/exclusions/[EXCLUSION_ID]"
 *       "folders/[FOLDER_ID]/exclusions/[EXCLUSION_ID]"
 *
 *   Example: `"projects/my-project-id/exclusions/my-exclusion-id"`.
 *
 * @typedef DeleteExclusionRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.DeleteExclusionRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
var DeleteExclusionRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};