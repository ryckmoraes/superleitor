
#!/usr/bin/env bash
set -e

echo "=== Preparing Gradle Environment (Capacitor 7.x) ==="

cd android

# Verify that we're in the right directory
if [ ! -f "build.gradle" ]; then
    echo "❌ Not in Android project directory"
    exit 1
fi

# Check if node_modules exists at parent level
if [ ! -d "../node_modules" ]; then
    echo "❌ node_modules not found at parent level"
    echo "Available directories at parent level:"
    ls -la ../
    exit 1
fi

# Check if essential Capacitor 7.x modules exist
echo "Checking for essential Capacitor 7.x modules..."
if [ ! -d "../node_modules/@capacitor" ]; then
    echo "❌ @capacitor directory not found in node_modules"
    echo "Available modules in node_modules:"
    ls -la ../node_modules/ | head -20
    exit 1
fi

if [ ! -d "../node_modules/@capacitor/android" ]; then
    echo "❌ @capacitor/android not found"
    echo "Available @capacitor modules:"
    ls -la ../node_modules/@capacitor/
    exit 1
fi

# Verify Capacitor 7.x structure
echo "✅ Found Capacitor 7.x modules:"
ls -la ../node_modules/@capacitor/

# Garante que o wrapper do Gradle esteja configurado
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "⚠️ gradle-wrapper.jar não encontrado. Gerando com Gradle do sistema..."
  gradle wrapper
fi

# Run all preparation scripts for Capacitor 7.x
echo "Running Gradle validation and setup scripts for Capacitor 7.x..."

# 1. Clean any previous cache issues
chmod +x ../.github/scripts/clean-gradle-cache.sh
../.github/scripts/clean-gradle-cache.sh

# 2. Validate Gradle wrapper
chmod +x ../.github/scripts/validate-gradle-wrapper.sh
../.github/scripts/validate-gradle-wrapper.sh

# 3. Validate Capacitor 7.x modules are present
chmod +x ../.github/scripts/validate-capacitor-modules.sh
../.github/scripts/validate-capacitor-modules.sh

# 4. Setup Capacitor 7.x modules
chmod +x ../.github/scripts/setup-capacitor-modules.sh
../.github/scripts/setup-capacitor-modules.sh

echo "✅ Gradle environment prepared successfully for Capacitor 7.x"
