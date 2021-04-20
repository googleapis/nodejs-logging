#!/bin/bash
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

  # Update package version to min version
  npm version 10.0.0-min.0

#  # Update dist-tags
#  npm dist-tag ls [<pkg>]
#
#  npm dist-tag add <pkg>@<version> [<tag>]
# edit package.json version to 1.1.1.min
  # remove previous tag, increment it, or if normal version is the same, increment the last num. npm dist-tag rm <pkg> <tag>

fi
