#!/bin/bash
cd "$(dirname "$(realpath "$0")")";

echo "BUILDING DESKTOP APP"

# Copy editor files in order to embed them inside golang
cp -r ../../editor ./editor

echo "Building for Linux..."
GOARCH="amd64" GOOS="linux"   go build -ldflags="-s -w" -o ../../dist/magebook-linux main.go && upx ../../dist/magebook-linux

echo "Building for Windows..."
GOARCH="amd64" GOOS="windows" go build -ldflags="-s -w -H windowsgui" -o ../../dist/magebook-windows.exe main.go && upx ../../dist/magebook-windows.exe

echo "Building for MacOs Darwin..."
GOARCH="amd64" GOOS="darwin"  go build -ldflags="-s -w" -o ../../dist/magebook-macos main.go

echo "Done!"


