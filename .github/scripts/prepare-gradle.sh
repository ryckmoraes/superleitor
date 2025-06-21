
#!/bin/bash
set -e

echo "=== Preparing Gradle Environment (Local Capacitor Modules) ==="

echo "Checking project structure in root..."
ls -la

# Verificar se estamos no diretório correto
if [ ! -d "android" ]; then
  echo "❌ Android directory not found"
  exit 1
fi

# Verificar se node_modules existe e tem Capacitor
echo "Verifying Capacitor modules availability..."
if [ ! -d "node_modules/@capacitor" ]; then
  echo "❌ Capacitor modules not found in node_modules"
  echo "Attempting to install missing dependencies..."
  
  npm install @capacitor/core @capacitor/android @capacitor/cli --legacy-peer-deps || {
    echo "❌ Failed to install Capacitor dependencies"
    exit 1
  }
  
  echo "Re-checking Capacitor modules after installation..."
  if [ ! -d "node_modules/@capacitor" ]; then
    echo "❌ Capacitor modules still not available after installation"
    exit 1
  fi
fi

echo "✅ Capacitor modules found in node_modules"

cd android

echo "Checking Android project structure..."
ls -la

# Execute cleanup
source ../.github/scripts/clean-gradle-cache.sh

# Validate and setup Gradle wrapper
source ../.github/scripts/validate-gradle-wrapper.sh

# Setup Capacitor modules
source ../.github/scripts/setup-capacitor-modules.sh

# Validate Capacitor modules
source ../.github/scripts/validate-capacitor-modules.sh

echo "=== Gradle preparation completed successfully with available Capacitor modules ==="
