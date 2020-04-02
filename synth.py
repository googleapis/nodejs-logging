# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

"""This script is used to synthesize generated parts of this library."""

import synthtool as s
import synthtool.gcp as gcp
import logging
import subprocess
import os

logging.basicConfig(level=logging.DEBUG)
s.metadata.set_track_obsolete_files(True)

gapic = gcp.GAPICMicrogenerator()
version='v2'
# tasks has two product names, and a poorly named artman yaml
v2_library = gapic.typescript_library(
    "logging",
    version,
    generator_args={
        "grpc-service-config": f"google/logging/{version}/logging_grpc_service_config.json",
        "package-name": f"@google-cloud/logging",
        "main-service": f"logging",
        "bundle-config": f"google/logging/{version}/logging_gapic.yaml"
        },
        proto_path=f'/google/logging/{version}',
        extra_proto_files=['google/cloud/common_resources.proto'],
)
s.copy(v2_library, excludes=["src/index.ts", "README.md", "package.json"])
# fix incorrect docs link
s.replace('src/v2/config_service_v2_client.ts', '/logging/docs/routing/managed-encryption', 'https://cloud.google.com/logging/docs/routing/managed-encryption')
s.replace('src/v2/logging_service_v2_client.ts', '/logging/docs/', 'https://cloud.google.com/logging/docs/')
s.replace('src/v2/logging_service_v2_client.ts', '/logging/quota-policy', 'https://cloud.google.com/logging/quota-policy')

# Copy in templated files
common_templates = gcp.CommonTemplates()
templates = common_templates.node_library(source_location='build/src')
s.copy(templates)

# Node.js specific cleanup
subprocess.run(["npm", "install"])
subprocess.run(["npm", "run", "fix"])
subprocess.run(["npx", "compileProtos", "src"])
