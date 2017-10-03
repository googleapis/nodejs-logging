<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Stackdriver Logging: Node.js Client

[![Greenkeeper badge](https://badges.greenkeeper.io/googleapis/nodejs-logging.svg)](https://greenkeeper.io/)

[![release level](https://img.shields.io/badge/release%20level-general%20availability%20%28GA%29-brightgreen.svg?style&#x3D;flat)](https://cloud.google.com/terms/launch-stages)
[![CircleCI](https://img.shields.io/circleci/project/github/googleapis/nodejs-logging.svg?style=flat)](https://circleci.com/gh/googleapis/nodejs-logging)
[![AppVeyor](https://ci.appveyor.com/api/projects/status/github/googleapis/nodejs-logging?svg=true)](https://ci.appveyor.com/project/googleapis/nodejs-logging)
[![codecov](https://img.shields.io/codecov/c/github/googleapis/nodejs-logging/repo-migration.svg?style=flat)](https://codecov.io/gh/googleapis/nodejs-logging)

> Node.js idiomatic client for [Logging][product-docs].

[Stackdriver Logging](https://cloud.google.com/logging/docs) allows you to store, search, analyze, monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.

* [Logging Node.js Client API Reference][client-docs]
* [Logging Documentation][product-docs]

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

**Table of contents:**

* [QuickStart](#quickstart)
  * [Before you begin](#before-you-begin)
  * [Installing the client library](#installing-the-client-library)
  * [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Quickstart

### Before you begin

1.  Select or create a Cloud Platform project.

    [Go to the projects page][projects]

1.  Enable billing for your project.

    [Enable billing][billing]

1.  Enable the Stackdriver Logging API.

    [Enable the API][enable_api]

1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=
[auth]: https://cloud.google.com/docs/authentication/getting-started

### Installing the client library

    npm install --save @google-cloud/logging

### Using the client library

```javascript
// Imports the Google Cloud client library
const Logging = require('@google-cloud/logging');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const logging = Logging({
  projectId: projectId
});

// The name of the log to write to
const logName = 'my-log';
// Selects the log to write to
const log = logging.log(logName);

// The data to write to the log
const text = 'Hello, world!';
// The metadata associated with the entry
const metadata = { resource: { type: 'global' } };
// Prepares a log entry
const entry = log.entry(metadata, text);

// Writes the log entry
log.write(entry)
  .then(() => {
    console.log(`Logged: ${text}`);
  })
  .catch((err) => {
    console.error('ERROR:', err);
  });
```

## Samples

Samples are in the [`samples/`](https://github.com/blob/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Documentation                      | Source Code                       |
| --------------------------- | ---------------------------------- | --------------------------------- |
| Logs | [documentation](https://cloud.google.com/logging/docs) | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/logs.js) |
| Sinks | [documentation](https://cloud.google.com/logging/docs) | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/sinks.js) |

## Versioning

This library follows [Semantic Versioning](http://semver.org/).

This library is considered to be **General Availability (GA)**. This means it
is stable; the code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **GA** libraries
are addressed with the highest priority.

Please note that the auto-generated portions of the **GA** libraries (the ones
in modules such as `v1` or `v2`) are considered to be of **Beta** quality, even
if the libraries that wrap them are **GA**.

More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](.github/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](LICENSE)

[client-docs]: https://cloud.google.com/nodejs/docs/reference/logging/latest/
[product-docs]: https://cloud.google.com/logging/docs
