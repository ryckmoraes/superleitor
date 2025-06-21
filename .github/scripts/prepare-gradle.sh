#!/bin/bash

echo "=== Preparing Gradle Environment (Local Capacitor Modules) ==="

echo "Checking project structure in root..."
ls -la

echo "Verifying Capacitor modules availability..."
if [ -d "node_modules/@capacitor/android" ]; then
  echo "✅ Capacitor modules found in node_modules"
else
  echo "❌ Capacitor modules not found in node_modules"
  exit 1
fi

echo "Checking Android project structure..."
ls -la android

echo "=== CLEANING ALL CACHES AND TEMP FILES ==="
./android/gradlew --project-dir android clean || echo "⚠️ Gradle clean failed (continuing)"
rm -rf ~/.gradle/caches/
rm -rf android/.gradle/
rm -rf android/build/
rm -rf android/app/build/
echo "✅ Cache cleanup completed"

echo "=== VALIDATING GRADLE WRAPPER ==="
if [ ! -f android/gradle/wrapper/gradle-wrapper.jar ]; then
  echo "❌ gradle-wrapper.jar missing"
  echo "⚠️ Generating Gradle wrapper using system Gradle..."
  cd android
  gradle wrapper --gradle-version 8.4
  cd ..
else
  echo "✅ gradle-wrapper.jar exists"
fi