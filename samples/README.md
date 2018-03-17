<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Stackdriver Logging: Node.js Samples

[![Open in Cloud Shell][shell_img]][shell_link]

[Stackdriver Logging](https://cloud.google.com/logging/docs) allows you to store, search, analyze, monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.

## Table of Contents

* [Before you begin](#before-you-begin)
* [Samples](#samples)
  * [Logs](#logs)
  * [Sinks](#sinks)

## Before you begin

Before running the samples, make sure you've followed the steps in the
[Before you begin section](../README.md#before-you-begin) of the client
library's README.

## Samples

### Logs

View the [source code][logs_0_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/logs.js,samples/README.md)

__Usage:__ `node logs --help`

```
logs <command>

Commands:
  logs list                                Lists log entries, optionally filtering, limiting, and sorting results.
  logs list-simple <logName>               Lists log entries.
  logs write <logName> <resource> <entry>  Writes a log entry to the specified log.
  logs write-simple <logName>              Writes a basic log entry to the specified log.
  logs delete <logName>                    Deletes the specified Log.

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  node logs list                                                List all log entries.
  node logs list -f "severity=ERROR" -s "timestamp" -l 2        List up to 2 error entries, sorted by timestamp
                                                                ascending.
  node logs list -f 'logName="my-log"' -l 2                     List up to 2 log entries from the "my-log" log.
  node logs write my-log                                        Write a string log entry.
  '{"type":"gae_app","labels":{"module_id":"default"}}'
  '"Hello World!"'
  node logs write my-log '{"type":"global"}'                    Write a JSON log entry.
  '{"message":"Hello World!"}'
  node logs delete my-log                                       Delete "my-log".

For more information, see https://cloud.google.com/logging/docs
```

[logs_0_docs]: https://cloud.google.com/logging/docs
[logs_0_code]: logs.js

### Sinks

View the [source code][sinks_1_code].

[![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/sinks.js,samples/README.md)

__Usage:__ `node sinks --help`

```
sinks <command>

Commands:
  sinks create <sinkName> <bucketName> [filter]  Creates a new sink with the given name to the specified bucket with an
                                                 optional filter.
  sinks get <sinkName>                           Gets the metadata for the specified sink.
  sinks list                                     Lists all sinks.
  sinks update <sinkName> <filter>               Updates the filter for the specified sink.
  sinks delete <sinkName>                        Deletes the specified sink.

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  node sinks create export-errors app-error-logs         Create a new sink named "export-errors" that exports logs to a
                                                         bucket named "app-error-logs".
  node sinks get export-errors                           Get the metadata for a sink name "export-errors".
  node sinks list                                        List all sinks.
  node sinks update export-errors "severity >= WARNING"  Update the filter for a sink named "export-errors".
  node sinks delete export-errors                        Delete a sink named "export-errors".

For more information, see https://cloud.google.com/logging/docs
```

[sinks_1_docs]: https://cloud.google.com/logging/docs
[sinks_1_code]: sinks.js

[shell_img]: //gstatic.com/cloudssh/images/open-btn.png
[shell_link]: https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/README.md
