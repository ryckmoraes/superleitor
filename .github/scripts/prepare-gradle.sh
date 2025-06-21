
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

echo "=== CLEANING ALL CACHES AND TEMP FILES ==="

# Limpar cache do Gradle completamente
echo "Cleaning Gradle cache..."
rm -rf ~/.gradle/caches/ || echo "No gradle cache to clean"
rm -rf .gradle/ || echo "No local gradle cache to clean"
rm -rf build/ || echo "No build directory to clean"
rm -rf app/build/ || echo "No app build directory to clean"

# Limpar arquivos temporários do Capacitor
echo "Cleaning Capacitor temp files..."
rm -rf capacitor-cordova-android-plugins/build/ || echo "No capacitor plugins build to clean"

echo "Checking Android project structure..."
ls -la

# Verificar arquivos essenciais do Gradle Wrapper
echo "Checking Gradle Wrapper files..."

WRAPPER_FILES_MISSING=false

if [ ! -f "gradlew" ]; then
  echo "❌ gradlew missing"
  WRAPPER_FILES_MISSING=true
fi

if [ ! -f "gradlew.bat" ]; then
  echo "❌ gradlew.bat missing"
  WRAPPER_FILES_MISSING=true
fi

if [ ! -f "gradle/wrapper/gradle-wrapper.properties" ]; then
  echo "❌ gradle-wrapper.properties missing"
  WRAPPER_FILES_MISSING=true
fi

if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "❌ gradle-wrapper.jar missing"
  WRAPPER_FILES_MISSING=true
fi

# Se arquivos wrapper estiverem ausentes, tentar gerá-los
if [ "$WRAPPER_FILES_MISSING" = true ]; then
  echo "⚠️  Some Gradle Wrapper files are missing. Attempting to generate them..."
  
  # Tentar usar Gradle instalado do sistema para gerar wrapper
  if command -v gradle >/dev/null 2>&1; then
    echo "Found system Gradle, generating wrapper..."
    gradle wrapper --gradle-version 8.2.1 --distribution-type bin
  else
    echo "System Gradle not found, downloading wrapper manually..."
    
    # Criar diretórios necessários
    mkdir -p gradle/wrapper
    
    # Baixar gradle-wrapper.jar
    echo "Downloading gradle-wrapper.jar..."
    curl -L -o gradle/wrapper/gradle-wrapper.jar \
      "https://github.com/gradle/gradle/raw/v8.2.1/gradle/wrapper/gradle-wrapper.jar" || {
      echo "❌ Failed to download gradle-wrapper.jar"
      exit 1
    }
    
    # Verificar se gradlew existe e tem conteúdo
    if [ ! -s "gradlew" ]; then
      echo "❌ gradlew is missing or empty after generation attempt"
      exit 1
    fi
  fi
fi

echo "Making gradlew executable..."
chmod +x ./gradlew

# Verificar se gradlew é executável
if [ ! -x "./gradlew" ]; then
  echo "❌ gradlew is not executable after chmod"
  exit 1
fi

echo "=== ENSURING CAPACITOR.BUILD.GRADLE EXISTS ==="

# Always ensure capacitor.build.gradle exists with conditional logic
echo "Creating/updating capacitor.build.gradle with conditional module loading..."

cat > app/capacitor.build.gradle << 'EOF'
// IMPORTANT: Do not modify this file directly.
// This file is managed by the 'npx cap sync' command.

android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17
      targetCompatibility JavaVersion.VERSION_17
  }
}

apply from: '../capacitor-cordova-android-plugins/cordova.variables.gradle'

dependencies {
    // Capacitor Core - always required
    implementation project(':capacitor-android')
    
    // Optional modules - only if they exist
    def capacitorAppDir = new File('../node_modules/@capacitor/app/android')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics/android')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard/android')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar/android')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen/android')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle created with conditional logic"

echo "=== FORCING CAPACITOR SYNC TO REGENERATE LOCAL MODULES ==="
cd ..
echo "Running npx cap sync android to regenerate local module configuration..."
npx cap sync android || {
  echo "❌ Capacitor sync failed"
  exit 1
}
cd android

# Verificar se o arquivo ainda existe após o sync
if [ ! -f "app/capacitor.build.gradle" ]; then
  echo "⚠️  capacitor.build.gradle was removed by sync, recreating..."
  
  cat > app/capacitor.build.gradle << 'EOF'
// IMPORTANT: Do not modify this file directly.
// This file is managed by the 'npx cap sync' command.

android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17
      targetCompatibility JavaVersion.VERSION_17
  }
}

apply from: '../capacitor-cordova-android-plugins/cordova.variables.gradle'

dependencies {
    // Capacitor Core - always required
    implementation project(':capacitor-android')
    
    // Optional modules - only if they exist
    def capacitorAppDir = new File('../node_modules/@capacitor/app/android')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics/android')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard/android')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar/android')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen/android')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF
  
  echo "✅ capacitor.build.gradle recreated after sync"
fi

echo "Testing gradlew connectivity with clean cache..."
./gradlew --version --no-daemon || {
  echo "❌ gradlew test failed - checking detailed error..."
  
  # Tentar diagnosticar o problema
  echo "Checking Java environment..."
  java -version || echo "Java not found"
  echo "JAVA_HOME: $JAVA_HOME"
  
  echo "Checking gradlew file..."
  ls -la gradlew
  file gradlew 2>/dev/null || echo "file command not available"
  
  echo "Checking gradle-wrapper.jar..."
  ls -la gradle/wrapper/gradle-wrapper.jar
  
  echo "Checking gradle-wrapper.properties..."
  cat gradle/wrapper/gradle-wrapper.properties
  
  exit 1
}

echo "Gradle Wrapper is working correctly with clean cache"

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

echo "=== Gradle preparation completed successfully with available Capacitor modules ==="
