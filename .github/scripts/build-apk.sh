
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK com correção forçada do settings.gradle..."

cd android

# FORÇA a correção do settings.gradle SEMPRE
echo "🔧 Forçando correção do settings.gradle..."
cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'
include ':capacitor-cordova-android-plugins'

println "=== Capacitor 7.x Module Detection ==="

// Caminho correto para node_modules fora da pasta android/
def nodeModulesRoot = new File(rootDir, '../node_modules')

println "Looking for node_modules at: ${nodeModulesRoot.absolutePath}"
println "Node modules exists: ${nodeModulesRoot.exists()}"

if (!nodeModulesRoot.exists()) {
    println "❌ node_modules directory not found at: ${nodeModulesRoot.absolutePath}"
    throw new GradleException("node_modules directory not found. Please run 'npm install' first.")
}

// Include the core Capacitor Android module
def capacitorAndroidDir = new File(nodeModulesRoot, '@capacitor/android')
println "Looking for Capacitor Android at: ${capacitorAndroidDir.absolutePath}"
println "Capacitor Android exists: ${capacitorAndroidDir.exists()}"

if (capacitorAndroidDir.exists()) {
    include ':capacitor-android'
    project(':capacitor-android').projectDir = capacitorAndroidDir
    println "✅ Included :capacitor-android (Capacitor 7.x core module)"
} else {
    println "❌ Missing :capacitor-android"
    throw new GradleException("Essential Capacitor Android module not found at: ${capacitorAndroidDir.absolutePath}")
}

// Include individual Capacitor plugin modules that the app uses
def pluginModules = [
    [name: ':capacitor-haptics', path: '@capacitor/haptics/android'],
    [name: ':capacitor-keyboard', path: '@capacitor/keyboard/android'],
    [name: ':capacitor-status-bar', path: '@capacitor/status-bar/android'],
    [name: ':capacitor-splash-screen', path: '@capacitor/splash-screen/android']
]

pluginModules.each { plugin ->
    def pluginDir = new File(nodeModulesRoot, plugin.path)
    println "Looking for ${plugin.name} at: ${pluginDir.absolutePath}"
    println "${plugin.name} exists: ${pluginDir.exists()}"
    
    if (pluginDir.exists()) {
        include plugin.name
        project(plugin.name).projectDir = pluginDir
        println "✅ Included ${plugin.name}"
    } else {
        println "⚠️  Plugin ${plugin.name} not found at ${pluginDir.absolutePath} (will be skipped)"
    }
}

println "=== Capacitor 7.x Module Detection Complete ==="
EOF

echo "✅ settings.gradle forçado com configuração correta"

# Verificar o conteúdo após a correção
echo "📋 Verificando conteúdo do settings.gradle após correção:"
cat settings.gradle

# Forçar também a correção do capacitor.build.gradle
echo "🔧 Verificando capacitor.build.gradle..."
if [ ! -f "app/capacitor.build.gradle" ]; then
    echo "⚠️ capacitor.build.gradle não encontrado, criando..."
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
    // Capacitor Core - required for all Capacitor apps
    implementation project(':capacitor-android')
    
    // Capacitor plugins that the app uses
    if (findProject(':capacitor-haptics') != null) {
        implementation project(':capacitor-haptics')
    }
    if (findProject(':capacitor-keyboard') != null) {
        implementation project(':capacitor-keyboard')
    }
    if (findProject(':capacitor-status-bar') != null) {
        implementation project(':capacitor-status-bar')
    }
    if (findProject(':capacitor-splash-screen') != null) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF
fi

# Criar diretório capacitor-cordova-android-plugins se não existir
echo "🔧 Verificando capacitor-cordova-android-plugins..."
if [ ! -d "capacitor-cordova-android-plugins" ]; then
    echo "⚠️ capacitor-cordova-android-plugins não encontrado, criando..."
    mkdir -p capacitor-cordova-android-plugins
    
    cat > capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
// Empty file - placeholder for Cordova variables
// This file can be used to define variables needed by Cordova plugins
EOF
fi

# Clear any remaining build artifacts
echo "🧹 Limpando artefatos de build remanescentes..."
./gradlew clean --no-daemon || echo "Gradle clean completou (pode ter avisos)"

# Test Gradle configuration before build
echo "🧪 Testando configuração do Gradle..."
if ./gradlew projects --stacktrace --no-daemon; then
    echo "✅ Configuração do Gradle válida"
    echo "📋 Projetos detectados:"
    ./gradlew projects --no-daemon | grep "Project" || echo "Listando todos os projetos..."
    ./gradlew projects --no-daemon
else
    echo "❌ Configuração do Gradle inválida"
    
    # Debug information
    echo "🔍 Informações de debug:"
    echo "Conteúdo do settings.gradle:"
    cat settings.gradle
    echo ""
    echo "Verificando se node_modules/@capacitor existe:"
    ls -la ../node_modules/@capacitor/ || echo "Diretório @capacitor não encontrado"
    
    exit 1
fi

# Attempt the build with enhanced error reporting
echo "🚀 Iniciando build do APK..."
if ./gradlew assembleRelease --stacktrace --no-daemon; then
    echo "✅ Build do Gradle completado com sucesso"
else
    echo "❌ Build do Gradle falhou"
    echo "🔍 Informações de debug finais:"
    echo "Módulos incluídos no settings.gradle:"
    grep "include" settings.gradle || echo "Nenhum include encontrado"
    echo "Estrutura do projeto Android:"
    find . -name "build.gradle" -type f | head -10
    
    # Mostrar os últimos logs de erro
    echo "📋 Últimos logs de build:"
    ls -la app/ || echo "Diretório app não encontrado"
    ls -la app/build/ || echo "Diretório app/build não encontrado"
    
    exit 1
fi

APK_PATH="app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  echo "✅ APK gerado com sucesso em $APK_PATH"

  cp "$APK_PATH" ../superleitor.apk

  echo "apk_found=true" >> "$GITHUB_OUTPUT"
  echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
  
  echo "📱 Informações do APK:"
  ls -lh "$APK_PATH"
  echo "📱 APK copiado para: ../superleitor.apk"
else
  echo "❌ APK não encontrado!"
  echo "📋 Listando conteúdo do diretório de saída:"
  find app/build/outputs/ -name "*.apk" -type f || echo "Nenhum APK encontrado"
  echo "apk_found=false" >> "$GITHUB_OUTPUT"
  exit 1
fi
