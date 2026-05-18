#!/bin/bash
# Build script for PassScan
# Run this from the PassScan directory

set -e

echo "=== Resolving SPM dependencies ==="
swift package resolve

echo ""
echo "=== Building for iOS device (arm64) ==="
xcodebuild build \
    -scheme PassScan \
    -destination 'generic/platform=iOS' \
    -skipPackagePluginValidation \
    -skipMacroValidation \
    2>&1 | tail -30

echo ""
echo "=== Build completed successfully ==="
