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
import synthtool.languages.node as node
import logging
import os

logging.basicConfig(level=logging.DEBUG)

AUTOSYNTH_MULTIPLE_COMMITS = True

s.metadata.set_track_obsolete_files(True)

gapic = gcp.GAPICBazel()
version='v2'
# tasks has two product names, and a poorly named artman yaml
v2_library = gapic.node_library("logging", version, proto_path=f'google/logging/{version}')
s.copy(v2_library, excludes=["src/index.ts", "README.md", "package.json", "system-test/fixtures/sample/src/index.js", "system-test/fixtures/sample/src/index.ts"])

# Copy in templated files
common_templates = gcp.CommonTemplates()
templates = common_templates.node_library(source_location='build/src')
s.copy(templates)

node.postprocess_gapic_library()
