
#!/usr/bin/env bash
set -e

echo "=== Preparing Gradle Environment (Local Capacitor Modules) ==="

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

# Check if Capacitor modules exist
echo "Checking for essential Capacitor modules..."
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

# Garante que o wrapper do Gradle esteja configurado
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "⚠️ gradle-wrapper.jar não encontrado. Gerando com Gradle do sistema..."
  gradle wrapper
fi

# Run all preparation scripts
echo "Running Gradle validation and setup scripts..."

# 1. Clean any previous cache issues
chmod +x ../.github/scripts/clean-gradle-cache.sh
../.github/scripts/clean-gradle-cache.sh

# 2. Validate Gradle wrapper
chmod +x ../.github/scripts/validate-gradle-wrapper.sh
../.github/scripts/validate-gradle-wrapper.sh

# 3. Validate Capacitor modules are present
chmod +x ../.github/scripts/validate-capacitor-modules.sh
../.github/scripts/validate-capacitor-modules.sh

# 4. Setup Capacitor modules
chmod +x ../.github/scripts/setup-capacitor-modules.sh
../.github/scripts/setup-capacitor-modules.sh

echo "✅ Gradle environment prepared successfully"
