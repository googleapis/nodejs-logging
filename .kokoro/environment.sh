set -eox pipefail

if [[ -z "${ENVIRONMENT:-}" ]]; then
  echo "ENVIRONMENT not set. Exiting"
  exit 1
fi

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
