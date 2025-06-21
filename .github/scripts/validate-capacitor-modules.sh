
#!/bin/bash
set -e

echo "=== VALIDATING CAPACITOR 7.x MODULES ==="

# Verificar se estamos no diretório correto (android)
if [ ! -f "build.gradle" ]; then
  echo "❌ Not in Android project directory"
  exit 1
fi

echo "Checking if essential Capacitor 7.x modules exist..."
CAPACITOR_MODULES_MISSING=false

# Módulo essencial - apenas verificar se o diretório existe (Capacitor 7.x)
ESSENTIAL_MODULE="../node_modules/@capacitor/android"

# Módulos opcionais - verificar apenas se os diretórios existem
OPTIONAL_MODULES=(
  "../node_modules/@capacitor/app"
  "../node_modules/@capacitor/haptics"
  "../node_modules/@capacitor/keyboard"
  "../node_modules/@capacitor/status-bar"
  "../node_modules/@capacitor/splash-screen"
  "../node_modules/@capacitor/core"
  "../node_modules/@capacitor/cli"
)

echo "=== Checking essential Capacitor 7.x module ==="
if [ ! -d "$ESSENTIAL_MODULE" ]; then
  echo "❌ Missing essential Capacitor Android module: $ESSENTIAL_MODULE"
  CAPACITOR_MODULES_MISSING=true
else
  echo "✅ Found essential Capacitor Android module: $ESSENTIAL_MODULE"
  echo "   📄 Contents:"
  ls -la "$ESSENTIAL_MODULE" | head -5
fi

echo "=== Checking optional Capacitor 7.x modules ==="
for module in "${OPTIONAL_MODULES[@]}"; do
  if [ -d "$module" ]; then
    echo "✅ Found optional Capacitor module: $module"
  else
    echo "⚠️  Optional Capacitor module not found: $module (will be skipped)"
  fi
done

if [ "$CAPACITOR_MODULES_MISSING" = true ]; then
  echo ""
  echo "❌ CRITICAL: Essential Capacitor modules are missing!"
  echo "   This usually indicates that npm dependencies were not installed correctly."
  echo ""
  
  # Try to provide debugging information
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
fi

echo "=== Verificando configuração final dos módulos Capacitor 7.x ==="
echo "Módulos incluídos no settings.gradle:"
if [ -f "settings.gradle" ]; then
  grep -A 10 "capacitor-android" settings.gradle | head -15 || echo "Capacitor Android configurado"
else
  echo "❌ settings.gradle não encontrado"
fi

echo ""
echo "Dependências no capacitor.build.gradle:"
if [ -f "app/capacitor.build.gradle" ]; then
  echo "✅ capacitor.build.gradle exists"
  grep -A 15 "dependencies {" app/capacitor.build.gradle | head -20 || echo "Dependências configuradas"
else
  echo "❌ capacitor.build.gradle não encontrado"
fi

echo "✅ Capacitor 7.x modules validation completed successfully"
