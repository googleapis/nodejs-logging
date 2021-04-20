#!/bin/bash

# Copyright 2021 Google LLC
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

set +ex

# Only run this script if envvar PUBLISH_MIN indicates we're publishing the
# minified distribution.
if [ "$PUBLISH_MIN" = true ] ; then
  # Minify all subdirectories in /build
  for d in $(find ./build/ -maxdepth 8 -type d)
  do
    pushd $d
      for f in *.js; do
        [ -f "$f" ] || break
        # uglify all .js files
        uglifyjs "$f" --output "$f"
      done
    popd
  done

  # Update package.json version to min version
  # get published min library version... e.g. 10.0.0-min.0
  PUBLISHED_MIN_VERSION=$(npm dist-tag ls) | sed 's/\ /\n/g' | sed -n '/min:/{n;p;}'
  PUBLISHED_MIN_VERSION_PREFIX=PUBLISHED_MIN_VERSION | sed 's/-min.*//'
  PUBLISHED_MIN_VERSION_SUFFIX=PUBLISHED_MIN_VERSION | sed 's/.*-min.//'
  LOCAL_VERSION=$(node -pe "require('./package.json').version")

  if [ "$PUBLISHED_MIN_VERSION_PREFIX" == "$LOCAL_VERSION" ]; then
    # Then only the min package is getting updated
    nvm version PUBLISHED_MIN_VERSION_PREFIX-min......
  else
    # `min` distro is releasing alongside a `latest` release
    nvm version $LOCAL_VERSION-min.0
  fi



  nvm version 1.1.1-min.0

  # if master library version is different than current min. set

  #  if master library version is same, just increment the library patch version.

  # remove old tag if any
  # tag new distro with "min"
  npm dist-tag add @google-cloud/logging@10.0.0-min.0 min

fi
