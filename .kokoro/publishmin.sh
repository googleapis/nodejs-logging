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

  # Get current published min library version, e.g. 10.0.0-min.0
  PUBLISHED_MIN=$(npm dist-tag ls) | sed 's/\ /\n/g' | sed -n '/min:/{n;p;}'
  PUBLISHED_MIN_PREFIX=PUBLISHED_MIN | sed 's/-min.*//'
  PUBLISHED_MIN_SUFFIX=PUBLISHED_MIN | sed 's/.*-min.//'
  LOCAL_VERSION=$(node -pe "require('./package.json').version")

  if [ "$PUBLISHED_MIN_PREFIX" == "$LOCAL_VERSION" ]; then
    # Patch the `min` distro, e.g. 10.0.0-min.1
    nvm version $PUBLISHED_MIN_VERSION-min.$(($PUBLISHED_MIN_SUFFIX + 1))
  else
    # Release a new `min` distro version, e.g. 10.0.1-min.0
    nvm version $LOCAL_VERSION-min.0
  fi
fi
