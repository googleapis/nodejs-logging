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
from pathlib import Path
import subprocess

logging.basicConfig(level=logging.DEBUG)

gapic = gcp.GAPICGenerator()

# tasks has two product names, and a poorly named artman yaml
v2_library = gapic.node_library(
    'logging', 'v2',
    config_path='/google/logging/artman_logging.yaml',
    artman_output_name='logging-v2')


# Copy all files except for 'README.md', 'package.json', and 'src/index.js'
s.copy(v2_library / 'protos')
s.copy(v2_library / 'src/v2')
s.copy(v2_library / 'test')
s.copy(v2_library / 'smoke-test')

'''
Node.js specific cleanup
'''
subprocess.run(['npm', 'install'])
subprocess.run(['npm', 'run', 'prettier'])
subprocess.run(['npm', 'run', 'lint'])
