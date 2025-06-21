
#!/bin/bash
set -e

echo "=== VALIDATING CAPACITOR MODULES ==="

# Verificar se estamos no diretório correto (android)
if [ ! -f "build.gradle" ]; then
  echo "❌ Not in Android project directory"
  exit 1
fi

echo "Checking if essential Capacitor modules exist..."
CAPACITOR_MODULES_MISSING=false

# Módulos essenciais - devem ter build.gradle
ESSENTIAL_MODULES=(
  "../node_modules/@capacitor/android/build.gradle"
  "../node_modules/@capacitor/core/android/build.gradle"
)

# Módulos opcionais - verificar se existem antes de validar
OPTIONAL_MODULES=(
  "../node_modules/@capacitor/app/android/build.gradle"
  "../node_modules/@capacitor/haptics/android/build.gradle"
  "../node_modules/@capacitor/keyboard/android/build.gradle"
  "../node_modules/@capacitor/status-bar/android/build.gradle"
  "../node_modules/@capacitor/splash-screen/android/build.gradle"
)

echo "=== Checking essential Capacitor modules ==="
for module in "${ESSENTIAL_MODULES[@]}"; do
  if [ ! -f "$module" ]; then
    echo "❌ Missing essential Capacitor module build.gradle: $module"
    
    # Try to find the directory structure
    module_dir=$(dirname "$module")
    if [ -d "$module_dir" ]; then
      echo "   📁 Directory exists: $module_dir"
      echo "   📄 Contents:"
      ls -la "$module_dir" | head -10
    else
      echo "   ❌ Directory does not exist: $module_dir"
    fi
    
    CAPACITOR_MODULES_MISSING=true
  else
    echo "✅ Found essential Capacitor module: $module"
  fi
done

echo "=== Checking optional Capacitor modules ==="
for module in "${OPTIONAL_MODULES[@]}"; do
  if [ -f "$module" ]; then
    echo "✅ Found optional Capacitor module: $module"
  else
    module_dir=$(dirname "$module")
    if [ -d "$module_dir" ]; then
      echo "⚠️  Optional module directory exists but build.gradle missing: $module"
      echo "   📄 Contents of $module_dir:"
      ls -la "$module_dir" | head -5
    else
      echo "⚠️  Optional Capacitor module not found: $module (will be skipped)"
    fi
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
  
  if [ -d "../node_modules" ]; then
    echo "  📁 ../node_modules exists, searching for capacitor..."
    find "../node_modules" -name "*capacitor*" -type d | head -10
  else
    echo "  ❌ ../node_modules does not exist"
  fi
  
  exit 1
fi

echo "=== Verificando configuração final dos módulos ==="
echo "Módulos incluídos no settings.gradle:"
if [ -f "settings.gradle" ]; then
  grep -A 20 "Incluir projetos Capacitor\|capacitor-android" settings.gradle | head -15 || echo "Nenhuma configuração Capacitor encontrada em settings.gradle"
else
  echo "❌ settings.gradle não encontrado"
fi

echo ""
echo "Dependências no capacitor.build.gradle:"
if [ -f "app/capacitor.build.gradle" ]; then
  echo "✅ capacitor.build.gradle exists"
  grep -A 15 "dependencies {" app/capacitor.build.gradle | head -20 || echo "Não foi possível ler dependencies"
else
  echo "❌ capacitor.build.gradle não encontrado"
fi

echo "✅ Capacitor modules validation completed successfully"
