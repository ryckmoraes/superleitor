#!/bin/bash
set -e

echo "=== Preparing Gradle Environment ==="

cd android

echo "Checking Android project structure..."
ls -la

echo "Making gradlew executable..."
chmod +x ./gradlew

echo "Testing gradlew..."
./gradlew --version

echo "=== Gradle preparation completed successfully ==="