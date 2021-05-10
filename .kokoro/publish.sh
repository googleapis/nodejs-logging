#!/bin/bash

# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eo pipefail

export NPM_CONFIG_PREFIX=${HOME}/.npm-global

# Start the releasetool reporter
python3 -m pip install gcp-releasetool
python3 -m releasetool publish-reporter-script > /tmp/publisher-script; source /tmp/publisher-script

cd $(dirname $0)/..

NPM_TOKEN=$(cat $KOKORO_GFILE_DIR/secret_manager/npm_publish_token)
echo "//wombat-dressing-room.appspot.com/:_authToken=${NPM_TOKEN}" > ~/.npmrc

npm install

# Publish the default package
npm publish --access=public --registry=https://wombat-dressing-room.appspot.com

# Uglify /build to publish a smaller package
for d in $(find ./build/ -maxdepth 8 -type d)
do
  pushd $d
    for f in *.js; do
      [ -f "$f" ] || break

      if [ -f "$f.map" ]; then
        # Keep original .ts source mappings
        uglifyjs --source-map "content='$f.map', url='$f.map'" "$f" --output "$f"
      else
        uglifyjs "$f" --output "$f"
      fi
    done
  popd
done

# Change and publish under package name `@google-cloud/logging-min`
sed -i -e 's/"name": "@google-cloud\/logging"/"name": "@google-cloud\/logging-min"/' package.json
if [ -f "package.json-e" ]; then
  rm package.json-e
fi

npm publish --access=public --registry=https://wombat-dressing-room.appspot.com
