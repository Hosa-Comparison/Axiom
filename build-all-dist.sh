#!/bin/bash

set -e
mkdir -p dist_exe

echo "Building Axiom executables into dist_exe/..."

echo "→ Windows 64-bit..."
nexe cli/axiom-cli.js -t windows-x64 -o dist_exe/Axiom-windows-x64.exe
echo "→ Windows 32-bit..."
nexe cli/axiom-cli.js -t windows-x86 -o dist_exe/Axiom-windows-x86.exe

echo "→ macOS x64..."
nexe cli/axiom-cli.js -t mac-x64 -o dist_exe/Axiom-macos-x64
echo "→ macOS arm64..."
nexe cli/axiom-cli.js -t mac-arm64 -o dist_exe/Axiom-macos-arm64

echo "→ Linux x64..."
nexe cli/axiom-cli.js -t linux-x64 -o dist_exe/Axiom-linux-x64
echo "→ Linux arm64..."
nexe cli/axiom-cli.js -t linux-arm64 -o dist_exe/Axiom-linux-arm64

echo "All builds complete! Check the dist_exe/ folder."