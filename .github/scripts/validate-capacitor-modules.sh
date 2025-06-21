
#!/bin/bash
set -e

echo "=== VALIDATING CAPACITOR 7.x MODULES ==="

# Verificar se estamos no diretório correto (android)
if [ ! -f "build.gradle" ]; then
  echo "❌ Not in Android project directory"
  exit 1
fi

echo "Checking if essential Capacitor 7.x modules exist in node_modules..."

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

# Check if plugins exist as npm packages
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

# Check plugin Android directories
echo "=== Checking individual plugin Android directories ==="
PLUGIN_ANDROID_DIRS=(
  "../node_modules/@capacitor/haptics/android"
  "../node_modules/@capacitor/keyboard/android"
  "../node_modules/@capacitor/status-bar/android"
  "../node_modules/@capacitor/splash-screen/android"
)

for plugin_dir in "${PLUGIN_ANDROID_DIRS[@]}"; do
  if [ -d "$plugin_dir" ]; then
    echo "✅ Found plugin Android directory: $plugin_dir"
  else
    echo "⚠️  Plugin Android directory not found: $plugin_dir"
  fi
done

echo "=== Verificando se settings.gradle inclui os módulos necessários ==="
if [ -f "settings.gradle" ]; then
  echo "Módulos incluídos no settings.gradle:"
  grep "include " settings.gradle || echo "Nenhum include encontrado"
  
  # Check for core module
  if grep -q ":capacitor-android" settings.gradle; then
    echo "✅ Core module :capacitor-android incluído"
  else
    echo "❌ Core module :capacitor-android NÃO incluído"
    exit 1
  fi
  
  # Check for plugin modules (optional but recommended)
  EXPECTED_PLUGINS=(":capacitor-haptics" ":capacitor-keyboard" ":capacitor-status-bar" ":capacitor-splash-screen")
  for plugin in "${EXPECTED_PLUGINS[@]}"; do
    if grep -q "$plugin" settings.gradle; then
      echo "✅ Plugin module $plugin incluído"
    else
      echo "⚠️  Plugin module $plugin não incluído (pode ser opcional)"
    fi
  done
  
else
  echo "❌ settings.gradle não encontrado"
  exit 1
fi

echo ""
echo "Verificando capacitor.build.gradle..."
if [ -f "app/capacitor.build.gradle" ]; then
  echo "✅ capacitor.build.gradle exists"
  if grep -q "implementation project(':capacitor-android')" app/capacitor.build.gradle; then
    echo "✅ Core dependency configurada"
  else
    echo "❌ Core dependency não configurada"
    exit 1
  fi
else
  echo "❌ capacitor.build.gradle não encontrado"
  exit 1
fi

echo ""
echo "✅ Capacitor 7.x module validation completed successfully"
