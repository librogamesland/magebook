#!/bin/bash
cd "$(dirname "$(realpath "$0")")";

rm -f ./editor/build/*.map

GOARCH="amd64" GOOS="linux"   go build -ldflags="-s -w" -o dist/magebook-linux main.go && upx dist/magebook-linux

GOARCH="amd64" GOOS="windows" go build -ldflags="-s -w -H windowsgui" -o dist/magebook-windows.exe main.go && upx dist/magebook-windows.exe

GOARCH="amd64" GOOS="darwin"  go build -ldflags="-s -w" -o dist/magebook-macos main.go

