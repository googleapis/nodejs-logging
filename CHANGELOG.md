# Changelog

[npm history][1]

[1]: https://www.npmjs.com/package/nodejs-logging?activeTab=versions

## v4.0.0

**This release has breaking changes**. This library is now compatible with es module import syntax.

#### Old Code
```js
const logging = require('@google-cloud/logging')();
// or...
const Logging = require('@google-cloud/logging');
const logging = new Logging();
```

#### New Code
```js
const {Logging} = require('@google-cloud/logging');
const logging = new Logging();
```

### Breaking changes
- Use es classes ([#219](https://github.com/googleapis/nodejs-logging/pull/219))

### Bug Fixes
- fix(gce): instance id can be a big number ([#222](https://github.com/googleapis/nodejs-logging/pull/222))
- fix(deps): update dependency @google-cloud/storage to v2 ([#213](https://github.com/googleapis/nodejs-logging/pull/213))
- fix(GCE): add zone label in GCE descriptor ([#215](https://github.com/googleapis/nodejs-logging/pull/215))
- fix(deps): update dependency google-auth-library to v2 ([#210](https://github.com/googleapis/nodejs-logging/pull/210))

### Internal / Testing Changes
- build: write logs to separate file ([#230](https://github.com/googleapis/nodejs-logging/pull/230))
- Enable prefer-const in the eslint config ([#229](https://github.com/googleapis/nodejs-logging/pull/229))
- fix(deps): roll back dependency @google-cloud/logging to ^3.0.2 ([#224](https://github.com/googleapis/nodejs-logging/pull/224))
- Enable no-var in eslint ([#228](https://github.com/googleapis/nodejs-logging/pull/228))
- Use arrow functions ([#227](https://github.com/googleapis/nodejs-logging/pull/227))
- Switch to let/const ([#221](https://github.com/googleapis/nodejs-logging/pull/221))
- fix(deps): update dependency google-gax to ^0.20.0 ([#220](https://github.com/googleapis/nodejs-logging/pull/220))
- Use let and const ([#217](https://github.com/googleapis/nodejs-logging/pull/217))
- Update CI config ([#218](https://github.com/googleapis/nodejs-logging/pull/218))
- Retry npm install in CI ([#214](https://github.com/googleapis/nodejs-logging/pull/214))
- add templates to synth.py and run it ([#211](https://github.com/googleapis/nodejs-logging/pull/211))

## v3.0.2

This release contains a variety of minor internal changes.

### Internal / Testing Changes
- chore: upgrade to the latest common-grpc (#203)
- Re-generate library using /synth.py (#202)
- chore(deps): update dependency nyc to v13 (#200)
- chore(deps): update samples dependency @google-cloud/logging-bunyan to ^0.9.0 (#199)
- fix(deps): update dependency google-gax to ^0.19.0 (#198)
- chore: use mocha for sample tests (#197)

## v3.0.1

### Fixes
- fix(deps): update dependency @google-cloud/logging to v3 (#195)
- fix(gke): correctly detect kubernetes engine (#193)

## v3.0.0

**This should not have been a semver major release.  There are no breaking changes.**

### Bug fixes
- fix(gke): include namespace_id in resource (#191)
- fix: drop support for node.js 4.x and 9.x (#161)
- Re-generate library using /synth.py (#154)

### Keepin' the lights on
- chore(deps): update dependency eslint-config-prettier to v3 (#190)
- chore: do not use npm ci (#189)
- chore: ignore package-lock.json (#186)
- chore: update renovate config (#184)
- remove that whitespace (#183)
- fix(deps): update dependency google-gax to ^0.18.0 (#182)
- chore(deps): lock file maintenance (#181)
- setup: just npm ci in synth.py (#180)
- chore: move mocha options to mocha.opts (#177)
- chore: require node 8 for samples (#179)
- fix(deps): update dependency fluent-logger to v3 (#172)
- fix: get eslint passing (#174)
- chore(deps): update dependency eslint-plugin-node to v7 (#169)
- test: use strictEqual in tests (#170)
- fix(deps): update dependency gcp-metadata to ^0.7.0 (#166)
- fix(deps): update dependency @google-cloud/logging to v2 (#157)

