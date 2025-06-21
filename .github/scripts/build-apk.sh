#!/bin/bash

echo "=== Starting APK Build ==="
cd android

./gradlew assembleDebug

APK_PATH=$(find app/build/outputs/apk/debug -name "*.apk" | head -n 1)

if [ -f "$APK_PATH" ]; then
  echo "✅ APK built: $APK_PATH"
  cp "$APK_PATH" ../superleitor.apk
  echo "apk_found=true" >> $GITHUB_OUTPUT
  echo "apk_path=$APK_PATH" >> $GITHUB_OUTPUT
else
  echo "❌ APK not found"
  echo "apk_found=false" >> $GITHUB_OUTPUT
fi