# Changelog

[npm history][1]

[1]: https://www.npmjs.com/package/nodejs-logging?activeTab=versions

### [8.0.8](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.7...v8.0.8) (2020-10-06)


### Bug Fixes

* **deps:** upgrade @google-cloud/common ([#905](https://www.github.com/googleapis/nodejs-logging/issues/905)) ([228864b](https://www.github.com/googleapis/nodejs-logging/commit/228864b7c59c80f126c3dbd2d8c8cb4a20adcdf6))

### [8.0.7](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.6...v8.0.7) (2020-10-05)


### Bug Fixes

* **deps:** update dependency @google-cloud/common to v3 ([#892](https://www.github.com/googleapis/nodejs-logging/issues/892)) ([b7c0f96](https://www.github.com/googleapis/nodejs-logging/commit/b7c0f9676fd1bacfd336a42ffac53f8765d99e3e))
* **deps:** update dependency @google-cloud/projectify to v2 ([#895](https://www.github.com/googleapis/nodejs-logging/issues/895)) ([884e905](https://www.github.com/googleapis/nodejs-logging/commit/884e905f7f8cc1670174f507a80dfc011a962a3b))
* **deps:** update dependency gcp-metadata to v4 ([#893](https://www.github.com/googleapis/nodejs-logging/issues/893)) ([ce79a7c](https://www.github.com/googleapis/nodejs-logging/commit/ce79a7cdb345f0fa8bd87c82df400427c1a984ea))
* **deps:** update dependency google-auth-library to v6 ([#894](https://www.github.com/googleapis/nodejs-logging/issues/894)) ([d2bbe3c](https://www.github.com/googleapis/nodejs-logging/commit/d2bbe3c69595177f90eb19702534b77fc390e8aa))
* **deps:** update dependency type-fest to ^0.17.0 ([#901](https://www.github.com/googleapis/nodejs-logging/issues/901)) ([860b795](https://www.github.com/googleapis/nodejs-logging/commit/860b795331885da38d5f91d1af9b1b313d3a59a3))

### [8.0.6](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.5...v8.0.6) (2020-09-12)


### Bug Fixes

* **deps:** update dependency yargs to v16 ([#889](https://www.github.com/googleapis/nodejs-logging/issues/889)) ([08ee746](https://www.github.com/googleapis/nodejs-logging/commit/08ee746ddf08f38528d350cd394e903d41d1d621))

### [8.0.5](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.4...v8.0.5) (2020-08-18)


### Bug Fixes

* **deps:** require google-gax 2.7.0 ([#879](https://www.github.com/googleapis/nodejs-logging/issues/879)) ([50b4be0](https://www.github.com/googleapis/nodejs-logging/commit/50b4be07c971295d933c3f5833fa40b1c8fc8eaf))

### [8.0.4](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.3...v8.0.4) (2020-08-14)


### Bug Fixes

* make request batching work again ([#872](https://www.github.com/googleapis/nodejs-logging/issues/872)) ([a9a9567](https://www.github.com/googleapis/nodejs-logging/commit/a9a9567acc94dbef66830c96ecc363f23b076667))

### [8.0.3](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.2...v8.0.3) (2020-08-10)


### Bug Fixes

* **deps:** roll back dependency @google-cloud/logging to ^8.0.1 ([#867](https://www.github.com/googleapis/nodejs-logging/issues/867)) ([3bd950a](https://www.github.com/googleapis/nodejs-logging/commit/3bd950a3bbb3a1bb24165d1b2cb96fc35c06292d))

### [8.0.2](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.1...v8.0.2) (2020-08-06)


### Bug Fixes

* **docs:** jsdoc strings were malformed ([#864](https://www.github.com/googleapis/nodejs-logging/issues/864)) ([75cd541](https://www.github.com/googleapis/nodejs-logging/commit/75cd54196917a30edc922adcbac1e84bf019f720))

### [8.0.1](https://www.github.com/googleapis/nodejs-logging/compare/v8.0.0...v8.0.1) (2020-07-06)


### Bug Fixes

* **deps:** update dependency through2 to v4 ([#838](https://www.github.com/googleapis/nodejs-logging/issues/838)) ([9c9c302](https://www.github.com/googleapis/nodejs-logging/commit/9c9c3020a7fb3f11896b4024d1e7e6e62df68a46))
* **deps:** update dependency type-fest to ^0.16.0 ([#840](https://www.github.com/googleapis/nodejs-logging/issues/840)) ([1db672d](https://www.github.com/googleapis/nodejs-logging/commit/1db672d746b1e02e667213b32c45d0f0e1aab781))

## [8.0.0](https://www.github.com/googleapis/nodejs-logging/compare/v7.3.0...v8.0.0) (2020-06-12)


### ⚠ BREAKING CHANGES

* The library now supports Node.js v10+. The last version to support Node.js v8 is tagged legacy-8 on NPM.
* move API to Typescript generation (#758)
* proto annotations

### Features

* add Blunderbuss config ([#806](https://www.github.com/googleapis/nodejs-logging/issues/806)) ([7f1eb67](https://www.github.com/googleapis/nodejs-logging/commit/7f1eb6731208f99b530d9553da751dad04ec92a9))
* drop node8 support, support for async iterators ([#778](https://www.github.com/googleapis/nodejs-logging/issues/778)) ([ce29b49](https://www.github.com/googleapis/nodejs-logging/commit/ce29b498ebb357403c093053d1b9989f1a56f5af))
* move API to Typescript generation ([#758](https://www.github.com/googleapis/nodejs-logging/issues/758)) ([049ae83](https://www.github.com/googleapis/nodejs-logging/commit/049ae8367dcd2b63c951d7c730548c5e88f72fa7))
* move ts target to es2018 from es2016 ([#825](https://www.github.com/googleapis/nodejs-logging/issues/825)) ([8b73243](https://www.github.com/googleapis/nodejs-logging/commit/8b73243bea64f6026718af9f567e3af1bd151061))


### Bug Fixes

* explicit export of protobuf.roots ([#781](https://www.github.com/googleapis/nodejs-logging/issues/781)) ([12808be](https://www.github.com/googleapis/nodejs-logging/commit/12808be22cfc9e5fc8a0c8b24203d2584e812204))
* handle fallback option properly ([#832](https://www.github.com/googleapis/nodejs-logging/issues/832)) ([6355b20](https://www.github.com/googleapis/nodejs-logging/commit/6355b20a19d7224acf0e2cec103aa095fc62efce))
* linting and formatting ([#809](https://www.github.com/googleapis/nodejs-logging/issues/809)) ([739cc3a](https://www.github.com/googleapis/nodejs-logging/commit/739cc3a05d1085142ec96ec51f61401d03943876))
* proto annotations ([e31cc01](https://www.github.com/googleapis/nodejs-logging/commit/e31cc01d5be8a150b370cf5000eedb7cbf175d0c))
* remove eslint, update gax, fix generated protos, run the generator ([#789](https://www.github.com/googleapis/nodejs-logging/issues/789)) ([d1df1bd](https://www.github.com/googleapis/nodejs-logging/commit/d1df1bdc1d536d3626dc1b85d357cf6ec18f80e8))
* **deps:** update dependency @google-cloud/paginator to v3 ([#766](https://www.github.com/googleapis/nodejs-logging/issues/766)) ([58fe7b0](https://www.github.com/googleapis/nodejs-logging/commit/58fe7b02defa33e89ef980fc3234e47e72a08436))
* **deps:** update dependency @google-cloud/promisify to v2 ([#763](https://www.github.com/googleapis/nodejs-logging/issues/763)) ([d3fd09d](https://www.github.com/googleapis/nodejs-logging/commit/d3fd09dae00df3787122b24f25f3347e3653eb52))
* **deps:** update dependency @google-cloud/storage to v5 ([#812](https://www.github.com/googleapis/nodejs-logging/issues/812)) ([b1be6c4](https://www.github.com/googleapis/nodejs-logging/commit/b1be6c45e88d05204bfbbb05e31f16a3ef909e52))
* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.21 ([#771](https://www.github.com/googleapis/nodejs-logging/issues/771)) ([958d186](https://www.github.com/googleapis/nodejs-logging/commit/958d1868da318fd08b543350daca7d2d33f331a8))
* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.22 ([#822](https://www.github.com/googleapis/nodejs-logging/issues/822)) ([6f1d18e](https://www.github.com/googleapis/nodejs-logging/commit/6f1d18ec05bbdc9666dfd350b4125761fa4a984e))
* **deps:** update dependency type-fest to ^0.13.0 ([#782](https://www.github.com/googleapis/nodejs-logging/issues/782)) ([13dcb78](https://www.github.com/googleapis/nodejs-logging/commit/13dcb786dec3400afc8c7ef1753fe7c0840542e2))
* **deps:** update dependency type-fest to ^0.15.0 ([#814](https://www.github.com/googleapis/nodejs-logging/issues/814)) ([2fc7eed](https://www.github.com/googleapis/nodejs-logging/commit/2fc7eed13c55320688b79513541ae9348bcd9ae0))
* **sample-test:** we shouldn't delete node_modules after link ([aa4850b](https://www.github.com/googleapis/nodejs-logging/commit/aa4850b39411afd82977e0ecba7a7a4b821332bd))

## [7.3.0](https://www.github.com/googleapis/nodejs-logging/compare/v7.2.3...v7.3.0) (2020-03-11)


### Features

* export protos in src/index.ts ([0dbbe35](https://www.github.com/googleapis/nodejs-logging/commit/0dbbe351f3143e8103929ac5862bd7c2c8ff6716))


### Bug Fixes

* **deps:** update dependency type-fest to ^0.12.0 ([#741](https://www.github.com/googleapis/nodejs-logging/issues/741)) ([c011c7d](https://www.github.com/googleapis/nodejs-logging/commit/c011c7d62c23814b9abe9b8a6e6f6f493f8a5027))
* **docs:** documentation for overloaded methods ([#725](https://www.github.com/googleapis/nodejs-logging/issues/725)) ([06a2cea](https://www.github.com/googleapis/nodejs-logging/commit/06a2cea1845ec2de441e156df6fdea04fb7b8955)), closes [#723](https://www.github.com/googleapis/nodejs-logging/issues/723)

### [7.2.3](https://www.github.com/googleapis/nodejs-logging/compare/v7.2.2...v7.2.3) (2020-02-26)


### Bug Fixes

* **docs:** writeLog should be in async function ([498a2c3](https://www.github.com/googleapis/nodejs-logging/commit/498a2c3825644b2f6a71ac3e314ba2e3de9fac62)), closes [#693](https://www.github.com/googleapis/nodejs-logging/issues/693)

### [7.2.2](https://www.github.com/googleapis/nodejs-logging/compare/v7.2.1...v7.2.2) (2020-02-20)


### Bug Fixes

* **deps:** update dependency type-fest to ^0.11.0 ([#718](https://www.github.com/googleapis/nodejs-logging/issues/718)) ([17decd4](https://www.github.com/googleapis/nodejs-logging/commit/17decd4af5caa96f8508ebdf876277b1efbd5e66))

### [7.2.1](https://www.github.com/googleapis/nodejs-logging/compare/v7.2.0...v7.2.1) (2020-02-20)


### Bug Fixes

* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.20 ([#714](https://www.github.com/googleapis/nodejs-logging/issues/714)) ([865b19f](https://www.github.com/googleapis/nodejs-logging/commit/865b19f95af7e541dbe215cdf72bf34df2c6567d))

## [7.2.0](https://www.github.com/googleapis/nodejs-logging/compare/v7.1.0...v7.2.0) (2020-02-19)


### Features

* add CMEK config and update grpc config logic ([#700](https://www.github.com/googleapis/nodejs-logging/issues/700)) ([a3fb0f3](https://www.github.com/googleapis/nodejs-logging/commit/a3fb0f3b55583220883fb83504f94f57cf907267))
* add getLogs() and getLogsStream() ([#692](https://www.github.com/googleapis/nodejs-logging/issues/692)) ([d582eeb](https://www.github.com/googleapis/nodejs-logging/commit/d582eebb79d183a5fa1403764fc72816f2939b87))


### Bug Fixes

* **deps:** update dependency type-fest to ^0.10.0 ([#697](https://www.github.com/googleapis/nodejs-logging/issues/697)) ([395a31d](https://www.github.com/googleapis/nodejs-logging/commit/395a31db786bd416c9387e5b893803c839b39ae7))
* use logging api resource for metric ([#704](https://www.github.com/googleapis/nodejs-logging/issues/704)) ([0239b81](https://www.github.com/googleapis/nodejs-logging/commit/0239b81ed816412e2a06bcfaaa347552cb00dc29))
* **docs:** orderby samples and documentation ([#713](https://www.github.com/googleapis/nodejs-logging/issues/713)) ([e703c23](https://www.github.com/googleapis/nodejs-logging/commit/e703c23c4f4c9a49878a50013e6208e2f9aae2cf))
* **types:** write options dryRun and partialSuccess ([#711](https://www.github.com/googleapis/nodejs-logging/issues/711)) ([#712](https://www.github.com/googleapis/nodejs-logging/issues/712)) ([56a8ed8](https://www.github.com/googleapis/nodejs-logging/commit/56a8ed84ab5d9bad137e8b5ac779a2f1e24aed6a))

## [7.1.0](https://www.github.com/googleapis/nodejs-logging/compare/v7.0.1...v7.1.0) (2020-01-29)


### Features

* support uniqueWriterIdentity in Sink.create ([#686](https://www.github.com/googleapis/nodejs-logging/issues/686)) ([41c0346](https://www.github.com/googleapis/nodejs-logging/commit/41c0346199c2afba8a00b434f0eda886ebbaa5fa))


### Bug Fixes

* enum, bytes, and Long types now accept strings ([6605067](https://www.github.com/googleapis/nodejs-logging/commit/6605067b6570983b9fcedc1e971663795e6bc11d))

### [7.0.1](https://www.github.com/googleapis/nodejs-logging/compare/v7.0.0...v7.0.1) (2020-01-24)


### Bug Fixes

* **deps:** update dependency type-fest to ^0.9.0 ([#682](https://www.github.com/googleapis/nodejs-logging/issues/682)) ([e39c401](https://www.github.com/googleapis/nodejs-logging/commit/e39c401513327292c0cb8fef0a2aa9bb4e90287d))

## [7.0.0](https://www.github.com/googleapis/nodejs-logging/compare/v6.0.0...v7.0.0) (2020-01-09)


### ⚠ BREAKING CHANGES

* if using GKE, "Kubernetes Container" type is now properly populated, and logs will be grouped accordingly.

### Features

* **samples:** increase logging client scope ([#670](https://www.github.com/googleapis/nodejs-logging/issues/670)) ([5f35601](https://www.github.com/googleapis/nodejs-logging/commit/5f356014d72a523fc7061caf7bd0143166af6c91))


### Bug Fixes

* populate k8s_container rather than container ([#674](https://www.github.com/googleapis/nodejs-logging/issues/674)) ([fa32048](https://www.github.com/googleapis/nodejs-logging/commit/fa3204877cf6f6b943950994d49c0f7d7def5096))
* **docs:** point folks towards the appropriate client instantiation ([091d7dd](https://www.github.com/googleapis/nodejs-logging/commit/091d7dd28d5f50cb0cf274bb370b36cdf612d42a))
* **types:** extend constructor options from gax ([#676](https://www.github.com/googleapis/nodejs-logging/issues/676)) ([5156538](https://www.github.com/googleapis/nodejs-logging/commit/51565388f25ef16d7ab9c20c1d96e2a4adb78149))

## [6.0.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.5...v6.0.0) (2019-12-06)


### ⚠ BREAKING CHANGES

* properly depend on Long in protos (#640)

### Features

* **samples:** add example of including httpRequest metadata in log ([#650](https://www.github.com/googleapis/nodejs-logging/issues/650)) ([e6d293e](https://www.github.com/googleapis/nodejs-logging/commit/e6d293eab1294d4e3434dceade1f45b53060767b))


### Bug Fixes

* properly depend on Long in protos ([#640](https://www.github.com/googleapis/nodejs-logging/issues/640)) ([e22b695](https://www.github.com/googleapis/nodejs-logging/commit/e22b6959f81155989f7507c9450b5a93506bc83a))
* **deps:** TypeScript 3.7.0 causes breaking change in typings ([#654](https://www.github.com/googleapis/nodejs-logging/issues/654)) ([432fe5d](https://www.github.com/googleapis/nodejs-logging/commit/432fe5d8cf19f4bd6b3e9863fb995db8e35ae8d8))
* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.19 ([#644](https://www.github.com/googleapis/nodejs-logging/issues/644)) ([3eaca43](https://www.github.com/googleapis/nodejs-logging/commit/3eaca4367263d6302c3dbd53109c7ed5dd4367d3))
* **docs:** snippets are now replaced in jsdoc comments ([#634](https://www.github.com/googleapis/nodejs-logging/issues/634)) ([687fc81](https://www.github.com/googleapis/nodejs-logging/commit/687fc815c572adbab2611d3f08f7259bb91de8e6))

### [5.5.5](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.4...v5.5.5) (2019-11-08)


### Bug Fixes

* **deps:** update dependency eventid to v1 ([#628](https://www.github.com/googleapis/nodejs-logging/issues/628)) ([2128ef1](https://www.github.com/googleapis/nodejs-logging/commit/2128ef195538e8149d32a0c7cbb1ee5723b161d3))

### [5.5.4](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.3...v5.5.4) (2019-10-25)


### Bug Fixes

* **package:** add missing dependency google-auth-library ([#620](https://www.github.com/googleapis/nodejs-logging/issues/620)) ([5ef2377](https://www.github.com/googleapis/nodejs-logging/commit/5ef2377aacac94551a74d386cbb8084f3d5a7b53))

### [5.5.3](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.2...v5.5.3) (2019-10-22)


### Bug Fixes

* **deps:** bump google-gax to 1.7.5 ([#616](https://www.github.com/googleapis/nodejs-logging/issues/616)) ([5d73a06](https://www.github.com/googleapis/nodejs-logging/commit/5d73a06083552db6aa03be4e6cb5f1de97620eec))
* **deps:** update dependency @google-cloud/storage to v4 ([#613](https://www.github.com/googleapis/nodejs-logging/issues/613)) ([4ec4f18](https://www.github.com/googleapis/nodejs-logging/commit/4ec4f18a3e07b798882e5f17e642fae5d9f68912))

### [5.5.2](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.1...v5.5.2) (2019-10-17)


### Bug Fixes

* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.18 ([#605](https://www.github.com/googleapis/nodejs-logging/issues/605)) ([0dac747](https://www.github.com/googleapis/nodejs-logging/commit/0dac747ac18484d54d2d33dbd7424b2c0294dbb9))

### [5.5.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.5.0...v5.5.1) (2019-10-17)


### Bug Fixes

* truncate additional fields set by winston/bunyan ([#609](https://www.github.com/googleapis/nodejs-logging/issues/609)) ([27ac693](https://www.github.com/googleapis/nodejs-logging/commit/27ac693ec4f9afeec412e2edddf831226f2bcc60))

## [5.5.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.4.1...v5.5.0) (2019-10-16)


### Features

* introduce maxEntrySize, for enabling error message truncation ([#607](https://www.github.com/googleapis/nodejs-logging/issues/607)) ([49efd49](https://www.github.com/googleapis/nodejs-logging/commit/49efd491263b518ae5cd54c9a77e5603477f96d8))

### [5.4.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.4.0...v5.4.1) (2019-10-10)


### Bug Fixes

* **deps:** pin to newer version of grpc ([#602](https://www.github.com/googleapis/nodejs-logging/issues/602)) ([23bda1d](https://www.github.com/googleapis/nodejs-logging/commit/23bda1d))

## [5.4.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.3.1...v5.4.0) (2019-10-09)


### Bug Fixes

* use compatible version of google-gax ([7576ef2](https://www.github.com/googleapis/nodejs-logging/commit/7576ef2))
* **deps:** gcp-metadata now handles ENETUNREACH ([#600](https://www.github.com/googleapis/nodejs-logging/issues/600)) ([e3ed1d6](https://www.github.com/googleapis/nodejs-logging/commit/e3ed1d6))


### Features

* introduces startTime and endTime ([4406446](https://www.github.com/googleapis/nodejs-logging/commit/4406446))

### [5.3.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.3.0...v5.3.1) (2019-09-17)


### Bug Fixes

* **deps:** updates to metadata check to better work in all environments ([#581](https://www.github.com/googleapis/nodejs-logging/issues/581)) ([24b97e4](https://www.github.com/googleapis/nodejs-logging/commit/24b97e4))

## [5.3.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.2.2...v5.3.0) (2019-09-16)


### Bug Fixes

* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.17 ([#569](https://www.github.com/googleapis/nodejs-logging/issues/569)) ([7077e64](https://www.github.com/googleapis/nodejs-logging/commit/7077e64))
* add missing function overload ([#573](https://www.github.com/googleapis/nodejs-logging/issues/573)) ([8cd073b](https://www.github.com/googleapis/nodejs-logging/commit/8cd073b))
* use correct version for x-goog-api-client header ([#565](https://www.github.com/googleapis/nodejs-logging/issues/565)) ([7b60835](https://www.github.com/googleapis/nodejs-logging/commit/7b60835))
* use process versions object for client header ([#563](https://www.github.com/googleapis/nodejs-logging/issues/563)) ([2ec8662](https://www.github.com/googleapis/nodejs-logging/commit/2ec8662))
* **deps:** update dependency type-fest to ^0.8.0 ([#578](https://www.github.com/googleapis/nodejs-logging/issues/578)) ([422a0ed](https://www.github.com/googleapis/nodejs-logging/commit/422a0ed))


### Features

* load protos from JSON, grpc-fallback support ([#571](https://www.github.com/googleapis/nodejs-logging/issues/571)) ([41ef532](https://www.github.com/googleapis/nodejs-logging/commit/41ef532))

### [5.2.2](https://www.github.com/googleapis/nodejs-logging/compare/v5.2.1...v5.2.2) (2019-08-20)


### Bug Fixes

* add test for x-goog-api-client header ([#556](https://www.github.com/googleapis/nodejs-logging/issues/556)) ([f2cd5ea](https://www.github.com/googleapis/nodejs-logging/commit/f2cd5ea))
* **deps:** update dependency yargs to v14 ([bd8da51](https://www.github.com/googleapis/nodejs-logging/commit/bd8da51))

### [5.2.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.2.0...v5.2.1) (2019-08-05)


### Bug Fixes

* **deps:** update dependency @google-cloud/paginator to v2 ([#537](https://www.github.com/googleapis/nodejs-logging/issues/537)) ([ae14f59](https://www.github.com/googleapis/nodejs-logging/commit/ae14f59))
* **deps:** update dependency google-auth-library to v5 ([#539](https://www.github.com/googleapis/nodejs-logging/issues/539)) ([b8351a7](https://www.github.com/googleapis/nodejs-logging/commit/b8351a7))
* allow calls with no request, add JSON proto ([9313998](https://www.github.com/googleapis/nodejs-logging/commit/9313998))
* **deps:** update dependency type-fest to ^0.7.0 ([#554](https://www.github.com/googleapis/nodejs-logging/issues/554)) ([62362e6](https://www.github.com/googleapis/nodejs-logging/commit/62362e6))
* **docs:** add note about batching writes ([#528](https://www.github.com/googleapis/nodejs-logging/issues/528)) ([25ba962](https://www.github.com/googleapis/nodejs-logging/commit/25ba962))

## [5.2.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.1.3...v5.2.0) (2019-07-17)


### Features

* add path template parsing for billing, organizations, and folders ([#529](https://www.github.com/googleapis/nodejs-logging/issues/529)) ([1e8c67f](https://www.github.com/googleapis/nodejs-logging/commit/1e8c67f))

### [5.1.3](https://www.github.com/googleapis/nodejs-logging/compare/v5.1.2...v5.1.3) (2019-06-26)


### Bug Fixes

* **docs:** link to reference docs section on googleapis.dev ([#521](https://www.github.com/googleapis/nodejs-logging/issues/521)) ([971c1b6](https://www.github.com/googleapis/nodejs-logging/commit/971c1b6))

### [5.1.2](https://www.github.com/googleapis/nodejs-logging/compare/v5.1.1...v5.1.2) (2019-06-16)


### Bug Fixes

* there is a free tier for logging ([#513](https://www.github.com/googleapis/nodejs-logging/issues/513)) ([2079598](https://www.github.com/googleapis/nodejs-logging/commit/2079598))
* **deps:** update dependency pumpify to v2 ([#516](https://www.github.com/googleapis/nodejs-logging/issues/516)) ([11d8f34](https://www.github.com/googleapis/nodejs-logging/commit/11d8f34))

### [5.1.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.1.0...v5.1.1) (2019-06-14)


### Bug Fixes

* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.14 ([#509](https://www.github.com/googleapis/nodejs-logging/issues/509)) ([3cba4dc](https://www.github.com/googleapis/nodejs-logging/commit/3cba4dc))
* **deps:** update dependency snakecase-keys to v3 ([#510](https://www.github.com/googleapis/nodejs-logging/issues/510)) ([eb2193e](https://www.github.com/googleapis/nodejs-logging/commit/eb2193e))
* **docs:** move to new client docs URL ([#514](https://www.github.com/googleapis/nodejs-logging/issues/514)) ([9043cfa](https://www.github.com/googleapis/nodejs-logging/commit/9043cfa))

## [5.1.0](https://www.github.com/googleapis/nodejs-logging/compare/v5.0.1...v5.1.0) (2019-06-05)


### Features

* add .repo-metadata.json for docs generation ([#502](https://www.github.com/googleapis/nodejs-logging/issues/502)) ([4a3b80a](https://www.github.com/googleapis/nodejs-logging/commit/4a3b80a))
* support apiEndpoint override ([#501](https://www.github.com/googleapis/nodejs-logging/issues/501)) ([f701358](https://www.github.com/googleapis/nodejs-logging/commit/f701358))
* support apiEndpoint override in client constructor ([#505](https://www.github.com/googleapis/nodejs-logging/issues/505)) ([bda7124](https://www.github.com/googleapis/nodejs-logging/commit/bda7124))

### [5.0.1](https://www.github.com/googleapis/nodejs-logging/compare/v5.0.0...v5.0.1) (2019-05-21)


### Bug Fixes

* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.13 ([#489](https://www.github.com/googleapis/nodejs-logging/issues/489)) ([0f57adf](https://www.github.com/googleapis/nodejs-logging/commit/0f57adf))

## [5.0.0](https://www.github.com/googleapis/nodejs-logging/compare/v4.5.2...v5.0.0) (2019-05-17)


### Bug Fixes

* **deps:** update dependency @google-cloud/common-grpc to v1 ([#479](https://www.github.com/googleapis/nodejs-logging/issues/479)) ([58e6154](https://www.github.com/googleapis/nodejs-logging/commit/58e6154))
* **deps:** update dependency @google-cloud/paginator to v1 ([#467](https://www.github.com/googleapis/nodejs-logging/issues/467)) ([90d74bd](https://www.github.com/googleapis/nodejs-logging/commit/90d74bd))
* **deps:** update dependency @google-cloud/projectify to v1 ([#464](https://www.github.com/googleapis/nodejs-logging/issues/464)) ([f6ef399](https://www.github.com/googleapis/nodejs-logging/commit/f6ef399))
* **deps:** update dependency @google-cloud/promisify to v1 ([#465](https://www.github.com/googleapis/nodejs-logging/issues/465)) ([5871e4b](https://www.github.com/googleapis/nodejs-logging/commit/5871e4b))
* **deps:** update dependency @opencensus/propagation-stackdriver to v0.0.12 ([#483](https://www.github.com/googleapis/nodejs-logging/issues/483)) ([afe89de](https://www.github.com/googleapis/nodejs-logging/commit/afe89de))
* **deps:** update dependency gcp-metadata to v2 ([#474](https://www.github.com/googleapis/nodejs-logging/issues/474)) ([125b356](https://www.github.com/googleapis/nodejs-logging/commit/125b356))
* **deps:** update dependency google-auth-library to v4 ([#475](https://www.github.com/googleapis/nodejs-logging/issues/475)) ([558bfc5](https://www.github.com/googleapis/nodejs-logging/commit/558bfc5))
* **deps:** update dependency google-gax to ^0.26.0 ([#459](https://www.github.com/googleapis/nodejs-logging/issues/459)) ([7417dcb](https://www.github.com/googleapis/nodejs-logging/commit/7417dcb))
* **deps:** update dependency google-gax to v1 ([#477](https://www.github.com/googleapis/nodejs-logging/issues/477)) ([535aedb](https://www.github.com/googleapis/nodejs-logging/commit/535aedb))
* DEADLINE_EXCEEDED no longer listed as idempotent ([473d145](https://www.github.com/googleapis/nodejs-logging/commit/473d145))
* **deps:** update dependency type-fest to ^0.4.0 ([#455](https://www.github.com/googleapis/nodejs-logging/issues/455)) ([3c2324b](https://www.github.com/googleapis/nodejs-logging/commit/3c2324b))
* **deps:** update dependency type-fest to ^0.5.0 ([#482](https://www.github.com/googleapis/nodejs-logging/issues/482)) ([ee5d17f](https://www.github.com/googleapis/nodejs-logging/commit/ee5d17f))
* DEADLINE_EXCEEDED retry code is idempotent ([#478](https://www.github.com/googleapis/nodejs-logging/issues/478)) ([4fdb8c1](https://www.github.com/googleapis/nodejs-logging/commit/4fdb8c1))
* use originalUrl for Express middleware's request url ([#476](https://www.github.com/googleapis/nodejs-logging/issues/476)) ([0ee71bd](https://www.github.com/googleapis/nodejs-logging/commit/0ee71bd)), closes [#472](https://www.github.com/googleapis/nodejs-logging/issues/472)


### Build System

* upgrade engines field to >=8.10.0 ([#461](https://www.github.com/googleapis/nodejs-logging/issues/461)) ([641ce87](https://www.github.com/googleapis/nodejs-logging/commit/641ce87))


### BREAKING CHANGES

* upgrade engines field to >=8.10.0 (#461)

## v4.5.2

04-11-2019 14:26 PDT

This release has minor bug fixes:

- fix(types): improve types for LogEntry ([#448](https://github.com/googleapis/nodejs-logging/pull/448))
- fix: include 'x-goog-request-params' header in requests ([#439](https://github.com/googleapis/nodejs-logging/pull/439))

## v4.5.1

03-18-2019 19:32 PDT

### Bug Fixes
- fix(ts): do not require storage/pubsub types, add install test ([#430](https://github.com/googleapis/nodejs-logging/pull/430))

## v4.5.0

03-13-2019 22:25 PDT

### New Features
- feat: ability to detect service context ([#400](https://github.com/googleapis/nodejs-logging/pull/400))

### Bug Fixes
- fix: do not push duplicate scopes ([#414](https://github.com/googleapis/nodejs-logging/pull/414))
- fix: throw on invalid credentials ([#395](https://github.com/googleapis/nodejs-logging/pull/395))

### Dependencies
- fix(deps): update dependency @google-cloud/paginator to ^0.2.0 ([#419](https://github.com/googleapis/nodejs-logging/pull/419))
- fix(deps): update dependency gcp-metadata to v1 ([#402](https://github.com/googleapis/nodejs-logging/pull/402))
- fix(deps): update dependency @opencensus/propagation-stackdriver to v0.0.9 ([#394](https://github.com/googleapis/nodejs-logging/pull/394))
- fix(deps): update dependency @google-cloud/promisify to ^0.4.0 ([#398](https://github.com/googleapis/nodejs-logging/pull/398))

### Documentation
- docs: update links in contrib guide ([#399](https://github.com/googleapis/nodejs-logging/pull/399))

### Internal / Testing Changes
- chore(deps): update dependency @google-cloud/pubsub to ^0.28.0 ([#421](https://github.com/googleapis/nodejs-logging/pull/421))
- refactor: update json import paths ([#422](https://github.com/googleapis/nodejs-logging/pull/422))
- chore(deps): update dependency supertest to v4 ([#420](https://github.com/googleapis/nodejs-logging/pull/420))
- refactor: clean up types and imports ([#409](https://github.com/googleapis/nodejs-logging/pull/409))
- build: Add docuploader credentials to node publish jobs ([#415](https://github.com/googleapis/nodejs-logging/pull/415))
- build: use node10 to run samples-test, system-test etc ([#413](https://github.com/googleapis/nodejs-logging/pull/413))
- build: update release configuration
- chore(deps): update @google-cloud/pubsub to v0.27.0 ([#410](https://github.com/googleapis/nodejs-logging/pull/410))
- chore(deps): update dependency @google-cloud/pubsub to ^0.26.0 ([#407](https://github.com/googleapis/nodejs-logging/pull/407))
- refactor (typescript): noImplilcitAny ([#408](https://github.com/googleapis/nodejs-logging/pull/408))
- chore(deps): update dependency @google-cloud/pubsub to ^0.25.0 ([#405](https://github.com/googleapis/nodejs-logging/pull/405))
- chore: update proto docs and code style
- chore(deps): update dependency mocha to v6 ([#403](https://github.com/googleapis/nodejs-logging/pull/403))
- build: use linkinator for docs test ([#397](https://github.com/googleapis/nodejs-logging/pull/397))
- refactor: expose and improve types ([#393](https://github.com/googleapis/nodejs-logging/pull/393))
- fix(deps): update dependency yargs to v13 ([#392](https://github.com/googleapis/nodejs-logging/pull/392))
- chore: use proper enum for GCPEnv ([#389](https://github.com/googleapis/nodejs-logging/pull/389))

## v4.4.0

02-11-2019 17:40 PST

### New Features
- feat: include TypeScript types ([#387](https://github.com/googleapis/nodejs-logging/pull/387))

### Bug Fixes
- fix: stop exporting express types publicly ([#376](https://github.com/googleapis/nodejs-logging/pull/376))

### Documentation
- docs: update contributing path in README ([#383](https://github.com/googleapis/nodejs-logging/pull/383))
- chore: move CONTRIBUTING.md to root ([#382](https://github.com/googleapis/nodejs-logging/pull/382))
- docs: add lint/fix example to contributing guide ([#379](https://github.com/googleapis/nodejs-logging/pull/379))
- docs: fix example comments ([#378](https://github.com/googleapis/nodejs-logging/pull/378))

### Internal / Testing Changes
- build: create docs test npm scripts ([#385](https://github.com/googleapis/nodejs-logging/pull/385))
- build: test using @grpc/grpc-js in CI ([#384](https://github.com/googleapis/nodejs-logging/pull/384))
- refactor: improve generated code style. ([#377](https://github.com/googleapis/nodejs-logging/pull/377))

## v4.3.0

01-31-2019 12:49 PST


### Implementation Changes
- Modify retry settings for WriteLogEntries, update year in the license headers ([#366](https://github.com/googleapis/nodejs-logging/pull/366))

### Dependencies
- fix(deps): update dependency google-gax to ^0.25.0 ([#373](https://github.com/googleapis/nodejs-logging/pull/373))
- chore(deps): update dependency @google-cloud/pubsub to ^0.24.0 ([#371](https://github.com/googleapis/nodejs-logging/pull/371))
- fix(deps): update dependency @google-cloud/common-grpc to ^0.10.0 ([#372](https://github.com/googleapis/nodejs-logging/pull/372))
- chore(deps): update dependency eslint-config-prettier to v4 ([#370](https://github.com/googleapis/nodejs-logging/pull/370))
- fix(deps): update dependency google-gax to ^0.24.0 ([#369](https://github.com/googleapis/nodejs-logging/pull/369))
- chore(deps): update dependency @google-cloud/pubsub to ^0.23.0 ([#367](https://github.com/googleapis/nodejs-logging/pull/367))
- fix(deps): update dependency google-auth-library to v3 ([#365](https://github.com/googleapis/nodejs-logging/pull/365))
- fix(deps): update dependency google-gax to ^0.23.0 ([#364](https://github.com/googleapis/nodejs-logging/pull/364))

### Documentation
- build: ignore googleapis.com in doc link check ([#368](https://github.com/googleapis/nodejs-logging/pull/368))
- fix(docs): removed unused gRPC message types

### Internal / Testing Changes
- build: check broken links in generated docs ([#358](https://github.com/googleapis/nodejs-logging/pull/358))

## v4.2.0

01-02-2019 12:43 PST

### New Features
- feat: cache detected environment's default resource ([#359](https://github.com/googleapis/nodejs-logging/pull/359))

### Dependencies
- fix(deps): update dependency @opencensus/propagation-stackdriver to v0.0.8 ([#354](https://github.com/googleapis/nodejs-logging/pull/354))

### Internal / Testing Changes
- refactor: modernize the sample tests ([#356](https://github.com/googleapis/nodejs-logging/pull/356))
- refactor(ts): improve typescript types ([#309](https://github.com/googleapis/nodejs-logging/pull/309))
- chore(build): inject yoshi automation key ([#352](https://github.com/googleapis/nodejs-logging/pull/352))
- chore: update nyc and eslint configs ([#351](https://github.com/googleapis/nodejs-logging/pull/351))
- chore: fix publish.sh permission +x ([#348](https://github.com/googleapis/nodejs-logging/pull/348))
- fix(build): fix Kokoro release script ([#347](https://github.com/googleapis/nodejs-logging/pull/347))
- build: add Kokoro configs for autorelease ([#346](https://github.com/googleapis/nodejs-logging/pull/346))
- chore: always nyc report before calling codecov ([#342](https://github.com/googleapis/nodejs-logging/pull/342))
- chore: nyc ignore build/test by default ([#341](https://github.com/googleapis/nodejs-logging/pull/341))

## v4.1.1

12-05-2018 13:12 PST

### Implementation Changes
TypeScript related changes:
- refactor(ts): generate logging types from proto ([#314](https://github.com/googleapis/nodejs-logging/pull/314))
- refactor(ts): use es imports and exports ([#307](https://github.com/googleapis/nodejs-logging/pull/307))

### Dependencies
- chore(deps): update dependency typescript to ~3.2.0 ([#331](https://github.com/googleapis/nodejs-logging/pull/331))
- chore(deps): update dependency @google-cloud/pubsub to ^0.22.0 ([#333](https://github.com/googleapis/nodejs-logging/pull/333))
- fix(deps): update dependency google-gax to ^0.22.0 ([#323](https://github.com/googleapis/nodejs-logging/pull/323))
- fix(deps): update dependency @opencensus/propagation-stackdriver to v0.0.7 ([#322](https://github.com/googleapis/nodejs-logging/pull/322))
- chore(deps): update dependency @google-cloud/pubsub to ^0.21.0 ([#324](https://github.com/googleapis/nodejs-logging/pull/324))
- chore(deps): update dependency gts to ^0.9.0 ([#321](https://github.com/googleapis/nodejs-logging/pull/321))
- chore(deps): update dependency bignumber.js to v8 ([#301](https://github.com/googleapis/nodejs-logging/pull/301))
- chore(deps): update dependency @types/is to v0.0.21 ([#315](https://github.com/googleapis/nodejs-logging/pull/315))
- chore(deps): update dependency @google-cloud/nodejs-repo-tools to v3 ([#318](https://github.com/googleapis/nodejs-logging/pull/318))
- fix(deps): update dependency through2 to v3 ([#311](https://github.com/googleapis/nodejs-logging/pull/311))

### Documentation
- docs(samples): updated samples code to use async await ([#329](https://github.com/googleapis/nodejs-logging/pull/329))
- docs: update directory for docs generation ([#312](https://github.com/googleapis/nodejs-logging/pull/312))

### Internal / Testing Changes
- fix(docs): const logging = require.. contains binary ([#338](https://github.com/googleapis/nodejs-logging/pull/338))
- chore: update license file ([#337](https://github.com/googleapis/nodejs-logging/pull/337))
- docs: update readme badges ([#335](https://github.com/googleapis/nodejs-logging/pull/335))
- fix(build): fix system key decryption ([#332](https://github.com/googleapis/nodejs-logging/pull/332))
- chore: add synth.metadata
- chore: update eslintignore config ([#320](https://github.com/googleapis/nodejs-logging/pull/320))
- chore: drop contributors from multiple places ([#316](https://github.com/googleapis/nodejs-logging/pull/316))
- chore: use latest npm on Windows ([#313](https://github.com/googleapis/nodejs-logging/pull/313))
- chore(build): use the latest npm on windows for tests ([#304](https://github.com/googleapis/nodejs-logging/pull/304))
- refactor: go back to prettier, use generated gapic tests ([#308](https://github.com/googleapis/nodejs-logging/pull/308))

## v4.1.0

### New Features
- feat: export middleware helpers ([#289](https://github.com/googleapis/nodejs-logging/pull/289))
- feat: Introduce middleware directory ([#248](https://github.com/googleapis/nodejs-logging/pull/248))

### Bug fixes
- fix(metadata): include zone on GAE descriptor ([#298](https://github.com/googleapis/nodejs-logging/pull/298))
- fix(middleware): tweak the middleware api ([#291](https://github.com/googleapis/nodejs-logging/pull/291))
- fix: resolve compile errors ([#287](https://github.com/googleapis/nodejs-logging/pull/287))
- fix(deps): move nock to devDependencies ([#276](https://github.com/googleapis/nodejs-logging/pull/276))

### Dependencies
- fix(deps): update dependency @opencensus/propagation-stackdriver to v0.0.6 ([#283](https://github.com/googleapis/nodejs-logging/pull/283))
- chore(deps): update dependency eslint-plugin-node to v8 ([#284](https://github.com/googleapis/nodejs-logging/pull/284))
- fix(deps): update dependency gcp-metadata to ^0.9.0 ([#279](https://github.com/googleapis/nodejs-logging/pull/279))
- fix(deps): update dependency snakecase-keys to v2 ([#259](https://github.com/googleapis/nodejs-logging/pull/259))
- refactor: remove async, methmeth, propprop ([#253](https://github.com/googleapis/nodejs-logging/pull/253))
- fix(deps): update dependency google-proto-files to ^0.17.0 ([#242](https://github.com/googleapis/nodejs-logging/pull/242))
- chore(deps): update dependency sinon to v7 ([#243](https://github.com/googleapis/nodejs-logging/pull/243))
- chore(deps): update dependency eslint-plugin-prettier to v3 ([#238](https://github.com/googleapis/nodejs-logging/pull/238))
- chore(deps): update dependency @google-cloud/pubsub to v0.20.1 ([#236](https://github.com/googleapis/nodejs-logging/pull/236))
- fix(samples): update dependency @google-cloud/logging-winston to ^0.10.0 ([#235](https://github.com/googleapis/nodejs-logging/pull/235))

### Documentation
- docs: update reference documentation

### Internal / Testing Changes
- chore: update CircleCI config ([#302](https://github.com/googleapis/nodejs-logging/pull/302))
- chore: remove a few unused deps ([#299](https://github.com/googleapis/nodejs-logging/pull/299))
- fix: fix system tests by choosing semver range for BigQuery ([#297](https://github.com/googleapis/nodejs-logging/pull/297))
- fix: disable skipLibCheck in the tsconfig ([#296](https://github.com/googleapis/nodejs-logging/pull/296))
- refactor(metadata): use async/await ([#295](https://github.com/googleapis/nodejs-logging/pull/295))
- chore: include build in eslintignore ([#292](https://github.com/googleapis/nodejs-logging/pull/292))
- fix(tsconfig): disable allowJs, enable declaration ([#288](https://github.com/googleapis/nodejs-logging/pull/288))
- refactor(ts): convert tests to typescript ([#282](https://github.com/googleapis/nodejs-logging/pull/282))
- test: fix the system tests with cleanup ([#281](https://github.com/googleapis/nodejs-logging/pull/281))
- fix(fix): no fix for samples/node_modules ([#278](https://github.com/googleapis/nodejs-logging/pull/278))
- chore: update github issue templates ([#274](https://github.com/googleapis/nodejs-logging/pull/274))
- chore: remove old issue template ([#270](https://github.com/googleapis/nodejs-logging/pull/270))
- build: run tests on node11 ([#268](https://github.com/googleapis/nodejs-logging/pull/268))
- chore(typescript): convert src/ to typescript ([#258](https://github.com/googleapis/nodejs-logging/pull/258))
- fix(synth): s.replace import syntax of code samples in autogenerated code ([#266](https://github.com/googleapis/nodejs-logging/pull/266))
- chore: use gts for samples; jettison prettier ([#255](https://github.com/googleapis/nodejs-logging/pull/255))
- chores(build): do not collect sponge.xml from windows builds ([#257](https://github.com/googleapis/nodejs-logging/pull/257))
- chores(build): run codecov on continuous builds ([#256](https://github.com/googleapis/nodejs-logging/pull/256))
- chore: run gts fix ([#252](https://github.com/googleapis/nodejs-logging/pull/252))
- refactor: introduce typescript compiler ([#246](https://github.com/googleapis/nodejs-logging/pull/246))
- fix(test): block auth during public system tests ([#249](https://github.com/googleapis/nodejs-logging/pull/249))
- build: fix codecov uploading on Kokoro ([#244](https://github.com/googleapis/nodejs-logging/pull/244))
- test: remove appveyor config ([#234](https://github.com/googleapis/nodejs-logging/pull/234))

## v4.0.1

### Implementation Changes
- fix(deps): Upgrade to @google-cloud/common-grpc 0.9.0 ([#232](https://github.com/googleapis/nodejs-logging/pull/232))

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
