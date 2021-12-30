[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Cloud Logging: Node.js Client](https://github.com/googleapis/nodejs-logging)


[![npm version](https://img.shields.io/npm/v/@google-cloud/logging.svg)](https://www.npmjs.org/package/@google-cloud/logging)
[![codecov](https://img.shields.io/codecov/c/github/googleapis/nodejs-logging/main.svg?style=flat)](https://codecov.io/gh/googleapis/nodejs-logging)




[Google Cloud Logging](https://cloud.google.com/logging/docs) allows you to store, search, analyze,
monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.

If you require lightweight dependencies, an experimental, minified version of
this library is available at [@google-cloud/logging-min](https://www.npmjs.com/package/@google-cloud/logging-min).
Note: `logging-min` is experimental, and its feature surface is subject to
change.


A comprehensive list of changes in each version may be found in
[the CHANGELOG](https://github.com/googleapis/nodejs-logging/blob/main/CHANGELOG.md).

* [Cloud Logging Node.js Client API Reference][client-docs]
* [Cloud Logging Documentation][product-docs]
* [github.com/googleapis/nodejs-logging](https://github.com/googleapis/nodejs-logging)

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

**Table of contents:**


* [Quickstart](#quickstart)
  * [Before you begin](#before-you-begin)
  * [Installing the client library](#installing-the-client-library)
  * [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Quickstart

### Before you begin

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable the Cloud Logging API][enable_api].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

### Installing the client library

```bash
npm install @google-cloud/logging
```


### Using the client library

```javascript
// Imports the Google Cloud client library
const {Logging} = require('@google-cloud/logging');

async function quickstart(
  projectId = 'YOUR_PROJECT_ID', // Your Google Cloud Platform project ID
  logName = 'my-log' // The name of the log to write to
) {
  // Creates a client
  const logging = new Logging({projectId});

  // Selects the log to write to
  const log = logging.log(logName);

  // The data to write to the log
  const text = 'Hello, world!';

  // The metadata associated with the entry
  const metadata = {
    resource: {type: 'global'},
    // See: https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#logseverity
    severity: 'INFO',
  };

  // Prepares a log entry
  const entry = log.entry(metadata, text);

  async function writeLog() {
    // Writes the log entry
    await log.write(entry);
    console.log(`Logged: ${text}`);
  }
  writeLog();
}

```
## Batching Writes

High throughput applications should avoid awaiting calls to the logger:

```js
await log.write(logEntry1);
await log.write(logEntry2);
```

Rather, applications should use a _fire and forget_ approach:

```js
log.write(logEntry1);
log.write(logEntry2);
```

The `@google-cloud/logging` library will handle batching and dispatching
these log lines to the API.

## Writing to Stdout

The `LogSync` class helps users easily write context-rich structured logs to
`stdout` or any custom transport. It extracts additional log properties like
trace context from HTTP headers and can be used as an on/off toggle between
writing to the API or to `stdout` during local development.

Logs written to `stdout` are then picked up, out-of-process, by a Logging
agent in the respective GCP environment. Logging agents can add more
properties to each entry before streaming it to the Logging API.

Read more about [Logging agents](https://cloud.google.com/logging/docs/agent/logging).

Serverless applications like Cloud Functions, Cloud Run, and App Engine
are highly recommended to use the `LogSync` class as async logs may be dropped
due to lack of CPU.

Read more about [structured logging](https://cloud.google.com/logging/docs/structured-logging).

```js
// Optional: Create and configure a client
const logging = new Logging();
await logging.setProjectId()
await logging.setDetectedResource()

// Create a LogSync transport, defaulting to `process.stdout`
const log = logging.logSync(logname);
const meta = { // optional field overrides here };
const entry = log.entry(meta, 'Your log message');
log.write(entry);

// Syntax sugar for logging at a specific severity
log.alert(entry);
log.warning(entry);
```

## Populating Http request metadata

Metadata about Http request is a part of the [structured log info](https://cloud.google.com/logging/docs/structured-logging)
that can be captured within each log entry. It can provide a context for the application logs and
is used to group multiple log entries under the load balancer request logs. See the [sample](https://github.com/googleapis/nodejs-logging/blob/master/samples/http-request.js)
how to populate the Http request metadata for log entries.

If you already have a "raw" Http `request` object you can assign it to `entry.metadata.httpRequest` directly. More information about
how the `request` is interpreted as raw can be found in the [code](https://github.com/googleapis/nodejs-logging/blob/15849160116a814ab71113138cb211c2e0c2d4b4/src/entry.ts#L224-L238).


## Samples

Samples are in the [`samples/`](https://github.com/googleapis/nodejs-logging/tree/main/samples) directory. Each sample's `README.md` has instructions for running its sample.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Fluent | [source code](https://github.com/googleapis/nodejs-logging/blob/main/samples/fluent.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/fluent.js,samples/README.md) |
| Log HTTP Request | [source code](https://github.com/googleapis/nodejs-logging/blob/main/samples/http-request.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/http-request.js,samples/README.md) |
| Logs | [source code](https://github.com/googleapis/nodejs-logging/blob/main/samples/logs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/logs.js,samples/README.md) |
| Quickstart | [source code](https://github.com/googleapis/nodejs-logging/blob/main/samples/quickstart.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/quickstart.js,samples/README.md) |
| Sinks | [source code](https://github.com/googleapis/nodejs-logging/blob/main/samples/sinks.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/sinks.js,samples/README.md) |



The [Cloud Logging Node.js Client API Reference][client-docs] documentation
also contains samples.

## Supported Node.js Versions

Our client libraries follow the [Node.js release schedule](https://nodejs.org/en/about/releases/).
Libraries are compatible with all current _active_ and _maintenance_ versions of
Node.js.

Client libraries targeting some end-of-life versions of Node.js are available, and
can be installed via npm [dist-tags](https://docs.npmjs.com/cli/dist-tag).
The dist-tags follow the naming convention `legacy-(version)`.

_Legacy Node.js versions are supported as a best effort:_

* Legacy versions will not be tested in continuous integration.
* Some security patches may not be able to be backported.
* Dependencies will not be kept up-to-date, and features will not be backported.

#### Legacy tags available

* `legacy-8`: install client libraries from this dist-tag for versions
  compatible with Node.js 8.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).



This library is considered to be **stable**. The code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **stable** libraries
are addressed with the highest priority.






More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com/googleapis/nodejs-logging/blob/main/CONTRIBUTING.md).

Please note that this `README.md`, the `samples/README.md`,
and a variety of configuration files in this repository (including `.nycrc` and `tsconfig.json`)
are generated from a central template. To edit one of these files, make an edit
to its templates in
[directory](https://github.com/googleapis/synthtool).

## License

Apache Version 2.0

See [LICENSE](https://github.com/googleapis/nodejs-logging/blob/main/LICENSE)

[client-docs]: https://cloud.google.com/nodejs/docs/reference/logging/latest
[product-docs]: https://cloud.google.com/logging/docs
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=logging.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started
