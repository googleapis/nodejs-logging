// Copyright 2020 Google LLC
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

// Note: this file is purely for documentation. Any contents are not expected
// to be loaded as the JS file.

/**
 * Describes a repository of logs (Beta).
 *
 * @property {string} name
 *   The resource name of the bucket.
 *   For example:
 *   "projects/my-project-id/locations/my-location/buckets/my-bucket-id The
 *   supported locations are:
 *     "global"
 *     "us-central1"
 *
 *   For the location of `global` it is unspecified where logs are actually
 *   stored.
 *   Once a bucket has been created, the location can not be changed.
 *
 * @property {string} description
 *   Describes this bucket.
 *
 * @property {Object} createTime
 *   Output only. The creation timestamp of the bucket. This is not set for any of the
 *   default buckets.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @property {Object} updateTime
 *   Output only. The last update timestamp of the bucket.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @property {number} retentionDays
 *   Logs will be retained by default for this amount of time, after which they
 *   will automatically be deleted. The minimum retention period is 1 day.
 *   If this value is set to zero at bucket creation time, the default time of
 *   30 days will be used.
 *
 * @property {number} lifecycleState
 *   Output only. The bucket lifecycle state.
 *
 *   The number should be among the values of [LifecycleState]{@link google.logging.v2.LifecycleState}
 *
 * @typedef LogBucket
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogBucket definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const LogBucket = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Describes a sink used to export log entries to one of the following
 * destinations in any project: a Cloud Storage bucket, a BigQuery dataset, or a
 * Cloud Pub/Sub topic. A logs filter controls which log entries are exported.
 * The sink must be created within a project, organization, billing account, or
 * folder.
 *
 * @property {string} name
 *   Required. The client-assigned sink identifier, unique within the project. Example:
 *   `"my-syslog-errors-to-pubsub"`. Sink identifiers are limited to 100
 *   characters and can include only the following characters: upper and
 *   lower-case alphanumeric characters, underscores, hyphens, and periods.
 *   First character has to be alphanumeric.
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
 *   entries are not exported. For more information, see
 *   [Exporting Logs with Sinks](https://cloud.google.com/logging/docs/api/tasks/exporting-logs).
 *
 * @property {string} filter
 *   Optional. An [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced-queries). The only
 *   exported log entries are those that are in the resource owning the sink and
 *   that match the filter. For example:
 *
 *       logName="projects/[PROJECT_ID]/logs/[LOG_ID]" AND severity>=ERROR
 *
 * @property {string} description
 *   Optional. A description of this sink.
 *   The maximum length of the description is 8000 characters.
 *
 * @property {boolean} disabled
 *   Optional. If set to True, then this sink is disabled and it does not
 *   export any log entries.
 *
 * @property {number} outputVersionFormat
 *   Deprecated. The log entry format to use for this sink's exported log
 *   entries. The v2 format is used by default and cannot be changed.
 *
 *   The number should be among the values of [VersionFormat]{@link google.logging.v2.VersionFormat}
 *
 * @property {string} writerIdentity
 *   Output only. An IAM identity–a service account or group&mdash;under which Logging
 *   writes the exported log entries to the sink's destination. This field is
 *   set by sinks.create and
 *   sinks.update based on the
 *   value of `unique_writer_identity` in those methods.
 *
 *   Until you grant this identity write-access to the destination, log entry
 *   exports from this sink will fail. For more information,
 *   see [Granting Access for a
 *   Resource](https://cloud.google.com/iam/docs/granting-roles-to-service-accounts#granting_access_to_a_service_account_for_a_resource).
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
 * @property {Object} bigqueryOptions
 *   Optional. Options that affect sinks exporting data to BigQuery.
 *
 *   This object should have the same structure as [BigQueryOptions]{@link google.logging.v2.BigQueryOptions}
 *
 * @property {Object} createTime
 *   Output only. The creation timestamp of the sink.
 *
 *   This field may not be present for older sinks.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @property {Object} updateTime
 *   Output only. The last update timestamp of the sink.
 *
 *   This field may not be present for older sinks.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @typedef LogSink
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogSink definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const LogSink = {
  // This is for documentation. Actual contents will be loaded by gRPC.

  /**
   * Available log entry formats. Log entries can be written to
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
 * Options that change functionality of a sink exporting data to BigQuery.
 *
 * @property {boolean} usePartitionedTables
 *   Optional. Whether to use [BigQuery's partition
 *   tables](https://cloud.google.com/bigquery/docs/partitioned-tables). By default, Logging
 *   creates dated tables based on the log entries' timestamps, e.g.
 *   syslog_20170523. With partitioned tables the date suffix is no longer
 *   present and [special query
 *   syntax](https://cloud.google.com/bigquery/docs/querying-partitioned-tables) has to be used instead.
 *   In both cases, tables are sharded based on UTC timezone.
 *
 * @property {boolean} usesTimestampColumnPartitioning
 *   Output only. True if new timestamp column based partitioning is in use,
 *   false if legacy ingestion-time partitioning is in use.
 *   All new sinks will have this field set true and will use timestamp column
 *   based partitioning. If use_partitioned_tables is false, this value has no
 *   meaning and will be false. Legacy sinks using partitioned tables will have
 *   this field set to false.
 *
 * @typedef BigQueryOptions
 * @memberof google.logging.v2
 * @see [google.logging.v2.BigQueryOptions definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const BigQueryOptions = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `ListBuckets` (Beta).
 *
 * @property {string} parent
 *   Required. The parent resource whose buckets are to be listed:
 *
 *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]"
 *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]"
 *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]"
 *
 *   Note: The locations portion of the resource must be specified, but
 *   supplying the character `-` in place of [LOCATION_ID] will return all
 *   buckets.
 *
 * @property {string} pageToken
 *   Optional. If present, then retrieve the next batch of results from the
 *   preceding call to this method. `pageToken` must be the value of
 *   `nextPageToken` from the previous response. The values of other method
 *   parameters should be identical to those in the previous call.
 *
 * @property {number} pageSize
 *   Optional. The maximum number of results to return from this request.
 *   Non-positive values are ignored. The presence of `nextPageToken` in the
 *   response indicates that more results might be available.
 *
 * @typedef ListBucketsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListBucketsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListBucketsRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The response from ListBuckets (Beta).
 *
 * @property {Object[]} buckets
 *   A list of buckets.
 *
 *   This object should have the same structure as [LogBucket]{@link google.logging.v2.LogBucket}
 *
 * @property {string} nextPageToken
 *   If there might be more results than appear in this response, then
 *   `nextPageToken` is included. To get the next set of results, call the same
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListBucketsResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListBucketsResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListBucketsResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `UpdateBucket` (Beta).
 *
 * @property {string} name
 *   Required. The full resource name of the bucket to update.
 *
 *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *
 *   Example:
 *   `"projects/my-project-id/locations/my-location/buckets/my-bucket-id"`. Also
 *   requires permission "resourcemanager.projects.updateLiens" to set the
 *   locked property
 *
 * @property {Object} bucket
 *   Required. The updated bucket.
 *
 *   This object should have the same structure as [LogBucket]{@link google.logging.v2.LogBucket}
 *
 * @property {Object} updateMask
 *   Required. Field mask that specifies the fields in `bucket` that need an update. A
 *   bucket field will be overwritten if, and only if, it is in the update
 *   mask. `name` and output only fields cannot be updated.
 *
 *   For a detailed `FieldMask` definition, see
 *   https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.FieldMask
 *
 *   Example: `updateMask=retention_days`.
 *
 *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
 *
 * @typedef UpdateBucketRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateBucketRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const UpdateBucketRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `GetBucket` (Beta).
 *
 * @property {string} name
 *   Required. The resource name of the bucket:
 *
 *       "projects/[PROJECT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "organizations/[ORGANIZATION_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *       "folders/[FOLDER_ID]/locations/[LOCATION_ID]/buckets/[BUCKET_ID]"
 *
 *   Example:
 *   `"projects/my-project-id/locations/my-location/buckets/my-bucket-id"`.
 *
 * @typedef GetBucketRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.GetBucketRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const GetBucketRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
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
 *   preceding call to this method. `pageToken` must be the value of
 *   `nextPageToken` from the previous response. The values of other method
 *   parameters should be identical to those in the previous call.
 *
 * @property {number} pageSize
 *   Optional. The maximum number of results to return from this request.
 *   Non-positive values are ignored. The presence of `nextPageToken` in the
 *   response indicates that more results might be available.
 *
 * @typedef ListSinksRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListSinksRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListSinksRequest = {
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
 *   `nextPageToken` is included. To get the next set of results, call the same
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListSinksResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListSinksResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListSinksResponse = {
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
const GetSinkRequest = {
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
 *   in the new sink. If this value is omitted or set to false, and if the
 *   sink's parent is a project, then the value returned as `writer_identity` is
 *   the same group or service account used by Logging before the addition of
 *   writer identities to this API. The sink's destination must be in the same
 *   project as the sink itself.
 *
 *   If this field is set to true, or if the sink is owned by a non-project
 *   resource such as an organization, then the value of `writer_identity` will
 *   be a unique service account used only for exports from the new sink. For
 *   more information, see `writer_identity` in LogSink.
 *
 * @typedef CreateSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.CreateSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const CreateSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `UpdateSink`.
 *
 * @property {string} sinkName
 *   Required. The full resource name of the sink to update, including the parent
 *   resource and the sink identifier:
 *
 *       "projects/[PROJECT_ID]/sinks/[SINK_ID]"
 *       "organizations/[ORGANIZATION_ID]/sinks/[SINK_ID]"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/sinks/[SINK_ID]"
 *       "folders/[FOLDER_ID]/sinks/[SINK_ID]"
 *
 *   Example: `"projects/my-project-id/sinks/my-sink-id"`.
 *
 * @property {Object} sink
 *   Required. The updated sink, whose name is the same identifier that appears as part
 *   of `sink_name`.
 *
 *   This object should have the same structure as [LogSink]{@link google.logging.v2.LogSink}
 *
 * @property {boolean} uniqueWriterIdentity
 *   Optional. See sinks.create
 *   for a description of this field. When updating a sink, the effect of this
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
 * @property {Object} updateMask
 *   Optional. Field mask that specifies the fields in `sink` that need
 *   an update. A sink field will be overwritten if, and only if, it is
 *   in the update mask. `name` and output only fields cannot be updated.
 *
 *   An empty updateMask is temporarily treated as using the following mask
 *   for backwards compatibility purposes:
 *     destination,filter,includeChildren
 *   At some point in the future, behavior will be removed and specifying an
 *   empty updateMask will be an error.
 *
 *   For a detailed `FieldMask` definition, see
 *   https://developers.google.com/protocol-buffers/docs/reference/google.protobuf#google.protobuf.FieldMask
 *
 *   Example: `updateMask=filter`.
 *
 *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
 *
 * @typedef UpdateSinkRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateSinkRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const UpdateSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to `DeleteSink`.
 *
 * @property {string} sinkName
 *   Required. The full resource name of the sink to delete, including the parent
 *   resource and the sink identifier:
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
const DeleteSinkRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Specifies a set of log entries that are not to be stored in
 * Logging. If your GCP resource receives a large volume of logs, you can
 * use exclusions to reduce your chargeable logs. Exclusions are
 * processed after log sinks, so you can export log entries before they are
 * excluded. Note that organization-level and folder-level exclusions don't
 * apply to child resources, and that you can't exclude audit log entries.
 *
 * @property {string} name
 *   Required. A client-assigned identifier, such as `"load-balancer-exclusion"`.
 *   Identifiers are limited to 100 characters and can include only letters,
 *   digits, underscores, hyphens, and periods. First character has to be
 *   alphanumeric.
 *
 * @property {string} description
 *   Optional. A description of this exclusion.
 *
 * @property {string} filter
 *   Required. An [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced-queries)
 *   that matches the log entries to be excluded. By using the
 *   [sample function](https://cloud.google.com/logging/docs/view/advanced-queries#sample),
 *   you can exclude less than 100% of the matching log entries.
 *   For example, the following query matches 99% of low-severity log
 *   entries from Google Cloud Storage buckets:
 *
 *   `"resource.type=gcs_bucket severity<ERROR sample(insertId, 0.99)"`
 *
 * @property {boolean} disabled
 *   Optional. If set to True, then this exclusion is disabled and it does not
 *   exclude any log entries. You can update an
 *   exclusion to change the
 *   value of this field.
 *
 * @property {Object} createTime
 *   Output only. The creation timestamp of the exclusion.
 *
 *   This field may not be present for older exclusions.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @property {Object} updateTime
 *   Output only. The last update timestamp of the exclusion.
 *
 *   This field may not be present for older exclusions.
 *
 *   This object should have the same structure as [Timestamp]{@link google.protobuf.Timestamp}
 *
 * @typedef LogExclusion
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogExclusion definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const LogExclusion = {
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
 *   preceding call to this method. `pageToken` must be the value of
 *   `nextPageToken` from the previous response. The values of other method
 *   parameters should be identical to those in the previous call.
 *
 * @property {number} pageSize
 *   Optional. The maximum number of results to return from this request.
 *   Non-positive values are ignored. The presence of `nextPageToken` in the
 *   response indicates that more results might be available.
 *
 * @typedef ListExclusionsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListExclusionsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListExclusionsRequest = {
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
 *   `nextPageToken` is included. To get the next set of results, call the same
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListExclusionsResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListExclusionsResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const ListExclusionsResponse = {
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
const GetExclusionRequest = {
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
const CreateExclusionRequest = {
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
 *   Required. New values for the existing exclusion. Only the fields specified in
 *   `update_mask` are relevant.
 *
 *   This object should have the same structure as [LogExclusion]{@link google.logging.v2.LogExclusion}
 *
 * @property {Object} updateMask
 *   Required. A non-empty list of fields to change in the existing exclusion. New values
 *   for the fields are taken from the corresponding fields in the
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
const UpdateExclusionRequest = {
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
const DeleteExclusionRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to
 * GetCmekSettings.
 *
 * See [Enabling CMEK for Logs Router](https://cloud.google.com/logging/docs/routing/managed-encryption)
 * for more information.
 *
 * @property {string} name
 *   Required. The resource for which to retrieve CMEK settings.
 *
 *       "projects/[PROJECT_ID]/cmekSettings"
 *       "organizations/[ORGANIZATION_ID]/cmekSettings"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/cmekSettings"
 *       "folders/[FOLDER_ID]/cmekSettings"
 *
 *   Example: `"organizations/12345/cmekSettings"`.
 *
 *   Note: CMEK for the Logs Router can currently only be configured for GCP
 *   organizations. Once configured, it applies to all projects and folders in
 *   the GCP organization.
 *
 * @typedef GetCmekSettingsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.GetCmekSettingsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const GetCmekSettingsRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to
 * UpdateCmekSettings.
 *
 * See [Enabling CMEK for Logs Router](https://cloud.google.com/logging/docs/routing/managed-encryption)
 * for more information.
 *
 * @property {string} name
 *   Required. The resource name for the CMEK settings to update.
 *
 *       "projects/[PROJECT_ID]/cmekSettings"
 *       "organizations/[ORGANIZATION_ID]/cmekSettings"
 *       "billingAccounts/[BILLING_ACCOUNT_ID]/cmekSettings"
 *       "folders/[FOLDER_ID]/cmekSettings"
 *
 *   Example: `"organizations/12345/cmekSettings"`.
 *
 *   Note: CMEK for the Logs Router can currently only be configured for GCP
 *   organizations. Once configured, it applies to all projects and folders in
 *   the GCP organization.
 *
 * @property {Object} cmekSettings
 *   Required. The CMEK settings to update.
 *
 *   See [Enabling CMEK for Logs
 *   Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
 *
 *   This object should have the same structure as [CmekSettings]{@link google.logging.v2.CmekSettings}
 *
 * @property {Object} updateMask
 *   Optional. Field mask identifying which fields from `cmek_settings` should
 *   be updated. A field will be overwritten if and only if it is in the update
 *   mask. Output only fields cannot be updated.
 *
 *   See FieldMask for more information.
 *
 *   Example: `"updateMask=kmsKeyName"`
 *
 *   This object should have the same structure as [FieldMask]{@link google.protobuf.FieldMask}
 *
 * @typedef UpdateCmekSettingsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateCmekSettingsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const UpdateCmekSettingsRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Describes the customer-managed encryption key (CMEK) settings associated with
 * a project, folder, organization, billing account, or flexible resource.
 *
 * Note: CMEK for the Logs Router can currently only be configured for GCP
 * organizations. Once configured, it applies to all projects and folders in the
 * GCP organization.
 *
 * See [Enabling CMEK for Logs Router](https://cloud.google.com/logging/docs/routing/managed-encryption)
 * for more information.
 *
 * @property {string} name
 *   Output only. The resource name of the CMEK settings.
 *
 * @property {string} kmsKeyName
 *   The resource name for the configured Cloud KMS key.
 *
 *   KMS key name format:
 *       "projects/[PROJECT_ID]/locations/[LOCATION]/keyRings/[KEYRING]/cryptoKeys/[KEY]"
 *
 *   For example:
 *       `"projects/my-project-id/locations/my-region/keyRings/key-ring-name/cryptoKeys/key-name"`
 *
 *
 *
 *   To enable CMEK for the Logs Router, set this field to a valid
 *   `kms_key_name` for which the associated service account has the required
 *   `roles/cloudkms.cryptoKeyEncrypterDecrypter` role assigned for the key.
 *
 *   The Cloud KMS key used by the Log Router can be updated by changing the
 *   `kms_key_name` to a new valid key name. Encryption operations that are in
 *   progress will be completed with the key that was in use when they started.
 *   Decryption operations will be completed using the key that was used at the
 *   time of encryption unless access to that key has been revoked.
 *
 *   To disable CMEK for the Logs Router, set this field to an empty string.
 *
 *   See [Enabling CMEK for Logs
 *   Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
 *
 * @property {string} serviceAccountId
 *   Output only. The service account that will be used by the Logs Router to access your
 *   Cloud KMS key.
 *
 *   Before enabling CMEK for Logs Router, you must first assign the role
 *   `roles/cloudkms.cryptoKeyEncrypterDecrypter` to the service account that
 *   the Logs Router will use to access your Cloud KMS key. Use
 *   GetCmekSettings to
 *   obtain the service account ID.
 *
 *   See [Enabling CMEK for Logs
 *   Router](https://cloud.google.com/logging/docs/routing/managed-encryption) for more information.
 *
 * @typedef CmekSettings
 * @memberof google.logging.v2
 * @see [google.logging.v2.CmekSettings definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_config.proto}
 */
const CmekSettings = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * LogBucket lifecycle states (Beta).
 *
 * @enum {number}
 * @memberof google.logging.v2
 */
const LifecycleState = {

  /**
   * Unspecified state.  This is only used/useful for distinguishing
   * unset values.
   */
  LIFECYCLE_STATE_UNSPECIFIED: 0,

  /**
   * The normal and active state.
   */
  ACTIVE: 1,

  /**
   * The bucket has been marked for deletion by the user.
   */
  DELETE_REQUESTED: 2
};