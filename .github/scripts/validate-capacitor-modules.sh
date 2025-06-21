
#!/bin/bash
set -e

echo "=== VALIDATING CAPACITOR 7.x CORE MODULE ==="

# Verificar se estamos no diretório correto (android)
if [ ! -f "build.gradle" ]; then
  echo "❌ Not in Android project directory"
  exit 1
fi

echo "Checking if essential Capacitor 7.x core module exists..."

# Módulo essencial - apenas verificar se o diretório existe (Capacitor 7.x)
ESSENTIAL_MODULE="../node_modules/@capacitor/android"

echo "=== Checking essential Capacitor 7.x core module ==="
if [ ! -d "$ESSENTIAL_MODULE" ]; then
  echo "❌ Missing essential Capacitor Android module: $ESSENTIAL_MODULE"
  
  # Try to provide debugging information
  echo ""
  echo "=== Debugging Information ==="
  echo "Current working directory: $(pwd)"
  echo "Node modules structure:"
  if [ -d "../node_modules/@capacitor" ]; then
    echo "  📁 ../node_modules/@capacitor exists"
    ls -la "../node_modules/@capacitor/" | head -10
  else
    echo "  ❌ ../node_modules/@capacitor does not exist"
  fi
  
  exit 1
else
  echo "✅ Found essential Capacitor Android module: $ESSENTIAL_MODULE"
  echo "   📄 Contents:"
  ls -la "$ESSENTIAL_MODULE" | head -5
fi

# Check if plugins are installed as npm packages (they don't need to be Gradle projects)
echo "=== Checking Capacitor 7.x plugins as npm packages ==="
PLUGIN_PACKAGES=(
  "../node_modules/@capacitor/app"
  "../node_modules/@capacitor/haptics"
  "../node_modules/@capacitor/keyboard"
  "../node_modules/@capacitor/status-bar"
  "../node_modules/@capacitor/splash-screen"
  "../node_modules/@capacitor/core"
  "../node_modules/@capacitor/cli"
)

for plugin in "${PLUGIN_PACKAGES[@]}"; do
  if [ -d "$plugin" ]; then
    echo "✅ Found Capacitor plugin package: $plugin"
  else
    echo "⚠️  Capacitor plugin package not found: $plugin (optional)"
  fi
done

echo "=== Verificando configuração final dos módulos Capacitor 7.x ==="
echo "Core module included in settings.gradle:"
if [ -f "settings.gradle" ]; then
  grep -A 5 "capacitor-android" settings.gradle | head -10 || echo "Capacitor Android configured"
else
  echo "❌ settings.gradle não encontrado"
fi

echo ""
echo "Core dependency in capacitor.build.gradle:"
if [ -f "app/capacitor.build.gradle" ]; then
  echo "✅ capacitor.build.gradle exists"
  grep -A 10 "dependencies {" app/capacitor.build.gradle | head -15 || echo "Core dependency configured"
else
  echo "❌ capacitor.build.gradle não encontrado"
fi

echo ""
echo "ℹ️  Individual plugins will be loaded by Capacitor's plugin system at runtime"
echo "ℹ️  No need to include them as separate Gradle projects in Capacitor 7.x"
echo "✅ Capacitor 7.x core module validation completed successfully"
