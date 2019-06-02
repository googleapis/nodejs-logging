[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [Stackdriver Logging: Node.js Client](https://github.com/googleapis/nodejs-logging)

[![release level](https://img.shields.io/badge/release%20level-general%20availability%20%28GA%29-brightgreen.svg?style=flat)](https://cloud.google.com/terms/launch-stages)
[![npm version](https://img.shields.io/npm/v/@google-cloud/logging.svg)](https://www.npmjs.org/package/@google-cloud/logging)
[![codecov](https://img.shields.io/codecov/c/github/googleapis/nodejs-logging/master.svg?style=flat)](https://codecov.io/gh/googleapis/nodejs-logging)




[Stackdriver Logging](https://cloud.google.com/logging/docs) allows you to store, search, analyze,
monitor, and alert on log data and events from Google Cloud Platform and Amazon Web Services.


* [Stackdriver Logging Node.js Client API Reference][client-docs]
* [Stackdriver Logging Documentation][product-docs]
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
1.  [Enable billing for your project][billing].
1.  [Enable the Stackdriver Logging API][enable_api].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

### Installing the client library

```bash
npm install @google-cloud/logging
```


### Using the client library

```javascript
async function quickstart(
  projectId = 'YOUR_PROJECT_ID', // Your Google Cloud Platform project ID
  logName = 'my-log' // The name of the log to write to
) {
  // Imports the Google Cloud client library
  const {Logging} = require('@google-cloud/logging');

  // Creates a client
  const logging = new Logging({projectId});

  // Selects the log to write to
  const log = logging.log(logName);

  // The data to write to the log
  const text = 'Hello, world!';

  // The metadata associated with the entry
  const metadata = {
    resource: {type: 'global'},
  };

  // Prepares a log entry
  const entry = log.entry(metadata, text);

  // Writes the log entry
  await log.write(entry);
  console.log(`Logged: ${text}`);
}

```



## Samples

Samples are in the [`samples/`](https://github.com/googleapis/nodejs-logging/tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Fluent | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/fluent.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/fluent.js,samples/README.md) |
| Logs | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/logs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/logs.js,samples/README.md) |
| Quickstart | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/quickstart.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/quickstart.js,samples/README.md) |
| Sinks | [source code](https://github.com/googleapis/nodejs-logging/blob/master/samples/sinks.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/googleapis/nodejs-logging&page=editor&open_in_editor=samples/sinks.js,samples/README.md) |



The [Stackdriver Logging Node.js Client API Reference][client-docs] documentation
also contains samples.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).


This library is considered to be **General Availability (GA)**. This means it
is stable; the code surface will not change in backwards-incompatible ways
unless absolutely necessary (e.g. because of critical security issues) or with
an extensive deprecation period. Issues and requests against **GA** libraries
are addressed with the highest priority.





More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com/googleapis/nodejs-logging/blob/master/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com/googleapis/nodejs-logging/blob/master/LICENSE)

[client-docs]: https://cloud.google.com/nodejs/docs/reference/logging/latest/
[product-docs]: https://cloud.google.com/logging/docs
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=logging.googleapis.com
[auth]: https://cloud.google.com/docs/authentication/getting-started