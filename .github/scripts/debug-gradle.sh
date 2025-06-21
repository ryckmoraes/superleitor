
#!/bin/bash
set -e

echo "=== Debugging Gradle Configuration ==="

cd android

echo "Checking settings.gradle:"
cat settings.gradle

echo ""
echo "Checking app/capacitor.build.gradle:"
cat app/capacitor.build.gradle

echo ""
echo "Checking for any other gradle files that might reference capacitor plugins:"
find . -name "*.gradle" -exec grep -l "capacitor-haptics\|capacitor-splash-screen\|capacitor-status-bar" {} \; || echo "No other references found"

echo ""
echo "Running gradle projects to see what's included:"
./gradlew projects || echo "Gradle projects command failed"

echo ""
echo "Cleaning gradle cache:"
./gradlew clean || echo "Gradle clean failed"

