#!/bin/bash
set -e

echo "=== Preparing Gradle Environment ==="

echo "Checking project structure in root..."
ls -la

echo "Making gradlew executable..."
chmod +x ./gradlew

echo "Testing gradlew..."
./gradlew --version

echo "=== Gradle preparation completed successfully ==="