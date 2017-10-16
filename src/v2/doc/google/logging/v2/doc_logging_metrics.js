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
 * Describes a logs-based metric.  The value of the metric is the
 * number of log entries that match a logs filter in a given time interval.
 *
 * A logs-based metric can also be used to extract values from logs and create a
 * a distribution of the values. The distribution records the statistics of the
 * extracted values along with an optional histogram of the values as specified
 * by the bucket options.
 *
 * @property {string} name
 *   Required. The client-assigned metric identifier.
 *   Examples: `"error_count"`, `"nginx/requests"`.
 *
 *   Metric identifiers are limited to 100 characters and can include
 *   only the following characters: `A-Z`, `a-z`, `0-9`, and the
 *   special characters `_-.,+!*',()%/`.  The forward-slash character
 *   (`/`) denotes a hierarchy of name pieces, and it cannot be the
 *   first character of the name.
 *
 *   The metric identifier in this field must not be
 *   [URL-encoded](https://en.wikipedia.org/wiki/Percent-encoding).
 *   However, when the metric identifier appears as the `[METRIC_ID]`
 *   part of a `metric_name` API parameter, then the metric identifier
 *   must be URL-encoded. Example:
 *   `"projects/my-project/metrics/nginx%2Frequests"`.
 *
 * @property {string} description
 *   Optional. A description of this metric, which is used in documentation.
 *
 * @property {string} filter
 *   Required. An [advanced logs filter](https://cloud.google.com/logging/docs/view/advanced_filters)
 *   which is used to match log entries.
 *   Example:
 *
 *       "resource.type=gae_app AND severity>=ERROR"
 *
 *   The maximum length of the filter is 20000 characters.
 *
 * @property {Object} metricDescriptor
 *   Optional. The metric descriptor associated with the logs-based metric.
 *   If unspecified, it uses a default metric descriptor with a DELTA metric
 *   kind, INT64 value type, with no labels and a unit of "1". Such a metric
 *   counts the number of log entries matching the `filter` expression.
 *
 *   The `name`, `type`, and `description` fields in the `metric_descriptor`
 *   are output only, and is constructed using the `name` and `description`
 *   field in the LogMetric.
 *
 *   To create a logs-based metric that records a distribution of log values, a
 *   DELTA metric kind with a DISTRIBUTION value type must be used along with
 *   a `value_extractor` expression in the LogMetric.
 *
 *   Each label in the metric descriptor must have a matching label
 *   name as the key and an extractor expression as the value in the
 *   `label_extractors` map.
 *
 *   The `metric_kind` and `value_type` fields in the `metric_descriptor` cannot
 *   be updated once initially configured. New labels can be added in the
 *   `metric_descriptor`, but existing labels cannot be modified except for
 *   their description.
 *
 *   This object should have the same structure as [MetricDescriptor]{@link google.api.MetricDescriptor}
 *
 * @property {string} valueExtractor
 *   Optional. A `value_extractor` is required when using a distribution
 *   logs-based metric to extract the values to record from a log entry.
 *   Two functions are supported for value extraction: `EXTRACT(field)` or
 *   `REGEXP_EXTRACT(field, regex)`. The argument are:
 *     1. field: The name of the log entry field from which the value is to be
 *        extracted.
 *     2. regex: A regular expression using the Google RE2 syntax
 *        (https://github.com/google/re2/wiki/Syntax) with a single capture
 *        group to extract data from the specified log entry field. The value
 *        of the field is converted to a string before applying the regex.
 *        It is an error to specify a regex that does not include exactly one
 *        capture group.
 *
 *   The result of the extraction must be convertible to a double type, as the
 *   distribution always records double values. If either the extraction or
 *   the conversion to double fails, then those values are not recorded in the
 *   distribution.
 *
 *   Example: `REGEXP_EXTRACT(jsonPayload.request, ".*quantity=(\d+).*")`
 *
 * @property {Object.<string, string>} labelExtractors
 *   Optional. A map from a label key string to an extractor expression which is
 *   used to extract data from a log entry field and assign as the label value.
 *   Each label key specified in the LabelDescriptor must have an associated
 *   extractor expression in this map. The syntax of the extractor expression
 *   is the same as for the `value_extractor` field.
 *
 *   The extracted value is converted to the type defined in the label
 *   descriptor. If the either the extraction or the type conversion fails,
 *   the label will have a default value. The default value for a string
 *   label is an empty string, for an integer label its 0, and for a boolean
 *   label its `false`.
 *
 *   Note that there are upper bounds on the maximum number of labels and the
 *   number of active time series that are allowed in a project.
 *
 * @property {Object} bucketOptions
 *   Optional. The `bucket_options` are required when the logs-based metric is
 *   using a DISTRIBUTION value type and it describes the bucket boundaries
 *   used to create a histogram of the extracted values.
 *
 *   This object should have the same structure as [BucketOptions]{@link google.api.BucketOptions}
 *
 * @property {number} version
 *   Deprecated. The API version that created or updated this metric.
 *   The v2 format is used by default and cannot be changed.
 *
 *   The number should be among the values of [ApiVersion]{@link google.logging.v2.ApiVersion}
 *
 * @typedef LogMetric
 * @memberof google.logging.v2
 * @see [google.logging.v2.LogMetric definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var LogMetric = {
  // This is for documentation. Actual contents will be loaded by gRPC.

  /**
   * Stackdriver Logging API version.
   *
   * @enum {number}
   * @memberof google.logging.v2
   */
  ApiVersion: {

    /**
     * Stackdriver Logging API v2.
     */
    V2: 0,

    /**
     * Stackdriver Logging API v1.
     */
    V1: 1
  }
};

/**
 * The parameters to ListLogMetrics.
 *
 * @property {string} parent
 *   Required. The name of the project containing the metrics:
 *
 *       "projects/[PROJECT_ID]"
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
 * @typedef ListLogMetricsRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListLogMetricsRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var ListLogMetricsRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * Result returned from ListLogMetrics.
 *
 * @property {Object[]} metrics
 *   A list of logs-based metrics.
 *
 *   This object should have the same structure as [LogMetric]{@link google.logging.v2.LogMetric}
 *
 * @property {string} nextPageToken
 *   If there might be more results than appear in this response, then
 *   `nextPageToken` is included.  To get the next set of results, call this
 *   method again using the value of `nextPageToken` as `pageToken`.
 *
 * @typedef ListLogMetricsResponse
 * @memberof google.logging.v2
 * @see [google.logging.v2.ListLogMetricsResponse definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var ListLogMetricsResponse = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to GetLogMetric.
 *
 * @property {string} metricName
 *   The resource name of the desired metric:
 *
 *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
 *
 * @typedef GetLogMetricRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.GetLogMetricRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var GetLogMetricRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to CreateLogMetric.
 *
 * @property {string} parent
 *   The resource name of the project in which to create the metric:
 *
 *       "projects/[PROJECT_ID]"
 *
 *   The new metric must be provided in the request.
 *
 * @property {Object} metric
 *   The new logs-based metric, which must not have an identifier that
 *   already exists.
 *
 *   This object should have the same structure as [LogMetric]{@link google.logging.v2.LogMetric}
 *
 * @typedef CreateLogMetricRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.CreateLogMetricRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var CreateLogMetricRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to UpdateLogMetric.
 *
 * @property {string} metricName
 *   The resource name of the metric to update:
 *
 *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
 *
 *   The updated metric must be provided in the request and it's
 *   `name` field must be the same as `[METRIC_ID]` If the metric
 *   does not exist in `[PROJECT_ID]`, then a new metric is created.
 *
 * @property {Object} metric
 *   The updated metric.
 *
 *   This object should have the same structure as [LogMetric]{@link google.logging.v2.LogMetric}
 *
 * @typedef UpdateLogMetricRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.UpdateLogMetricRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var UpdateLogMetricRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};

/**
 * The parameters to DeleteLogMetric.
 *
 * @property {string} metricName
 *   The resource name of the metric to delete:
 *
 *       "projects/[PROJECT_ID]/metrics/[METRIC_ID]"
 *
 * @typedef DeleteLogMetricRequest
 * @memberof google.logging.v2
 * @see [google.logging.v2.DeleteLogMetricRequest definition in proto format]{@link https://github.com/googleapis/googleapis/blob/master/google/logging/v2/logging_metrics.proto}
 */
var DeleteLogMetricRequest = {
  // This is for documentation. Actual contents will be loaded by gRPC.
};