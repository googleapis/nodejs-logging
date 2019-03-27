[//]: # "This README.md file is auto-generated, all changes to this file will be lost."
[//]: # "To regenerate it, use `python -m synthtool`."
<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# [:  Client](https://github.com/)

None
[![npm version](https://img.shields.io/npm/v/@google-cloud/logging.svg)](https://www.npmjs.org/package/@google-cloud/logging)
[![codecov](https://img.shields.io/codecov/c/github//master.svg?style=flat)](https://codecov.io/gh/)


Stackdriver Logging Client Library for Node.js


* [Using the client library](#using-the-client-library)
* [Samples](#samples)
* [Versioning](#versioning)
* [Contributing](#contributing)
* [License](#license)

## Using the client library

1.  [Select or create a Cloud Platform project][projects].
1.  [Enable the  API][enable_api].
1.  [Set up authentication with a service account][auth] so you can access the
    API from your local workstation.

1. Install the client library:

        npm install @google-cloud/logging


1. Try an example:

```
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

Samples are in the [`samples/`](https://github.com//tree/master/samples) directory. The samples' `README.md`
has instructions for running the samples.

| Sample                      | Source Code                       | Try it |
| --------------------------- | --------------------------------- | ------ |
| Fluent | [source code](https://github.com//blob/master/samples/fluent.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/fluent.js,samples/README.md) |
| Logs | [source code](https://github.com//blob/master/samples/logs.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/logs.js,samples/README.md) |
| Sinks | [source code](https://github.com//blob/master/samples/sinks.js) | [![Open in Cloud Shell][shell_img]](https://console.cloud.google.com/cloudshell/open?git_repo=https://github.com/&page=editor&open_in_editor=samples/sinks.js,samples/README.md) |



The [  Client API Reference][client-docs] documentation
also contains samples.

## Versioning

This library follows [Semantic Versioning](http://semver.org/).






More Information: [Google Cloud Platform Launch Stages][launch_stages]

[launch_stages]: https://cloud.google.com/terms/launch-stages

## Contributing

Contributions welcome! See the [Contributing Guide](https://github.com//blob/master/CONTRIBUTING.md).

## License

Apache Version 2.0

See [LICENSE](https://github.com//blob/master/LICENSE)

## What's Next

* [ Documentation][product-docs]
* [  Client API Reference][client-docs]
* [github.com/](https://github.com/)

Read more about the client libraries for Cloud APIs, including the older
Google APIs Client Libraries, in [Client Libraries Explained][explained].

[explained]: https://cloud.google.com/apis/docs/client-libraries-explained

[client-docs]: 
[product-docs]: 
[shell_img]: https://gstatic.com/cloudssh/images/open-btn.png
[projects]: https://console.cloud.google.com/project
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[enable_api]: https://console.cloud.google.com/flows/enableapi?apiid=
[auth]: https://cloud.google.com/docs/authentication/getting-started