#!/bin/bash

rm -rf bin
mkdir -p bin/macos
pkg -t node12-macos-x64 -o bin/macos/mergit .
pkg -t node12-linux-x64 -o bin/linux/mergit .
