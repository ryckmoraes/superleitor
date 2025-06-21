
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
