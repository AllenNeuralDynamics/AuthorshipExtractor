#!/bin/bash
# build.sh — Build MyST site and copy widget files to theme public dir
# The theme server (port 3000+) only serves files from its own public/ dir.
# Widget ESM/CSS are built into _build/site/public/ (content server).
# This script copies them so the theme server can serve them too.

set -e
cd "$(dirname "$0")"

npx mystmd build </dev/null "$@"

# Copy anywidget files to theme's public directory
cp _build/site/public/authorship-widget-*.mjs \
   _build/site/public/authorship-widget-*.css \
   _build/templates/site/myst/book-theme/public/ 2>/dev/null || true

echo "✅ Widget files copied to theme public dir"
