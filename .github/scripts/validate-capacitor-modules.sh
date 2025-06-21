
#!/bin/bash
set -e

echo "=== VALIDATING CAPACITOR MODULES ==="

# Verificar apenas os módulos essenciais do Capacitor
echo "Checking if essential Capacitor modules exist..."
CAPACITOR_MODULES_MISSING=false

ESSENTIAL_MODULES=(
  "../node_modules/@capacitor/android"
  "../node_modules/@capacitor/core"
)

# Módulos opcionais - verificar se existem antes de validar
OPTIONAL_MODULES=(
  "../node_modules/@capacitor/app/android"
  "../node_modules/@capacitor/haptics/android"
  "../node_modules/@capacitor/keyboard/android"
  "../node_modules/@capacitor/status-bar/android"
  "../node_modules/@capacitor/splash-screen/android"
)

for module in "${ESSENTIAL_MODULES[@]}"; do
  if [ ! -d "$module" ]; then
    echo "❌ Missing essential Capacitor module: $module"
    CAPACITOR_MODULES_MISSING=true
  else
    echo "✅ Found essential Capacitor module: $module"
  fi
done

for module in "${OPTIONAL_MODULES[@]}"; do
  if [ -d "$module" ]; then
    echo "✅ Found optional Capacitor module: $module"
  else
    echo "⚠️  Optional Capacitor module not found: $module (will be skipped)"
  fi
done

if [ "$CAPACITOR_MODULES_MISSING" = true ]; then
  echo "❌ Some essential Capacitor modules are missing from node_modules"
  exit 1
fi

echo "=== Verificando configuração final dos módulos ==="
echo "Módulos incluídos no settings.gradle:"
grep -A 20 "Incluir projetos Capacitor" settings.gradle || echo "Não foi possível ler settings.gradle"

echo ""
echo "Dependências no capacitor.build.gradle:"
if [ -f "app/capacitor.build.gradle" ]; then
  grep -A 10 "dependencies {" app/capacitor.build.gradle || echo "Não foi possível ler dependencies"
else
  echo "❌ capacitor.build.gradle não encontrado"
fi

echo "✅ Capacitor modules validation completed"
