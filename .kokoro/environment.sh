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

set -eo pipefail

printenv

if [[ -z "${ENVIRONMENT:-}" ]]; then
  echo "ENVIRONMENT not set. Exiting"
  exit 1
fi

# Setup service account credentials.
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secret_manager/long-door-651-kokoro-system-test-service-account
export GCLOUD_PROJECT=long-door-651
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

set -x

if [[ -z "${PROJECT_ROOT:-}"  ]]; then
    PROJECT_ROOT="github/nodejs-logging"
fi

# Set up local library, generates /build uploaded as a local dependency
npm install
npm run compile

# make sure submodule is up to date
git submodule update --init --recursive
cd "env-tests-logging/"

# Disable buffering, so that the logs stream through.
export PYTHONUNBUFFERED=1

export CLOUDSDK_PYTHON=python3

# Debug: show build environment
env | grep KOKORO

# Setup project id.
gcloud config set project $GCLOUD_PROJECT

# set a default zone.
gcloud config set compute/zone us-central1-b

# authenticate docker
gcloud auth configure-docker -q

# This block is executed only with Trampoline V2+.
if [[ -n "${TRAMPOLINE_VERSION:-}" ]]; then
  # Remove old nox
  python3 -m pip uninstall --yes --quiet nox-automation

  # Install nox as a user and add it to the PATH.
	python3 -m pip install --user nox
	export PATH="${PATH}:${HOME}/.local/bin"
fi

# create a unique id for this run
UUID=$(python  -c 'import uuid; print(uuid.uuid1())' | head -c 7)
export ENVCTL_ID=ci-$UUID
echo $ENVCTL_ID

# If App Engine, install app-engine-go component
if [[ $ENVIRONMENT == *"appengine"* ]]; then
  gcloud components install app-engine-go -q
fi

# If Kubernetes, install kubectl component
if [[ $ENVIRONMENT == *"kubernetes"* ]]; then
  gcloud components install kubectl -q
  gcloud components install gke-gcloud-auth-plugin -q
  export USE_GKE_GCLOUD_AUTH_PLUGIN=True
fi

# Run the specified environment test
set +e
nox --python 3.7 --session "tests(language='nodejs', platform='$ENVIRONMENT')"
TEST_STATUS_CODE=$?

# destroy resources
echo "cleaning up..."
./envctl/envctl nodejs $ENVIRONMENT destroy

# exit with proper status code
exit $TEST_STATUS_CODE
