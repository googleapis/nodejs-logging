set -eox pipefail

if [[ -z "${ENVIRONMENT:-}" ]]; then
  echo "ENVIRONMENT not set. Exiting"
  exit 1
fi

# Setup service account credentials.
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/service-account.json
export GCLOUD_PROJECT=long-door-651
gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS

if [[ -z "${PROJECT_ROOT:-}"  ]]; then
    PROJECT_ROOT="github/nodejs-logging"
fi

# Add the test module as a submodule to the repo root
cd "${KOKORO_ARTIFACTS_DIR}/github/nodejs-logging/"
git submodule add https://github.com/googleapis/env-tests-logging
cd "env-tests-logging/"

# Disable buffering, so that the logs stream through.
export PYTHONUNBUFFERED=1

# Debug: show build environment
env | grep KOKORO

# Setup project id.
gcloud config set project $GCLOUD_PROJECT

# set a default zone.
gcloud config set compute/zone us-central1-b

# authenticate docker
gcloud auth configure-docker -q

# Remove old nox
python3.7 -m pip uninstall --yes --quiet nox-automation

# Install nox
python3.7 -m pip install --upgrade --quiet nox
python3.7 -m nox --version

# create a unique id for this run
UUID=$(python  -c 'import uuid; print(uuid.uuid1())' | head -c 7)
export ENVCTL_ID=ci-$UUID
echo $ENVCTL_ID

# Run the specified environment test
set +e
python3.7 -m nox --session "tests(language='nodejs', platform='$ENVIRONMENT')"
TEST_STATUS_CODE=$?

# destroy resources
echo "cleaning up..."
${PROJECT_ROOT}/tests/environment/envctl/envctl nodejs $ENVIRONMENT destroy

# exit with proper status code
exit $TEST_STATUS_CODE
