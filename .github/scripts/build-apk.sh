
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK com validação aprimorada..."

cd android

# Final validation before build - check what's actually included
echo "Realizando validação final antes do build..."
echo "Verificando módulos incluídos no settings.gradle..."

if [ -f "settings.gradle" ]; then
    echo "Conteúdo do settings.gradle:"
    cat settings.gradle
    
    # Check if core Capacitor module is included
    if ! grep -q ":capacitor-android" settings.gradle; then
        echo "❌ ERRO CRÍTICO: Módulo :capacitor-android não está incluído!"
        echo "Tentando corrigir o settings.gradle..."
        
        # Force regenerate the correct settings.gradle
        cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

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
        echo "✅ settings.gradle corrigido"
    else
        echo "✅ Módulo :capacitor-android encontrado"
    fi
    
    # Show what modules are actually included
    echo "Módulos incluídos:"
    grep "include " settings.gradle || echo "Nenhum include encontrado"
    
else
    echo "❌ settings.gradle não encontrado"
    exit 1
fi

# Clear any remaining build artifacts
echo "Limpando artefatos de build remanescentes..."
./gradlew clean || echo "Gradle clean completado com avisos"

# Test Gradle configuration before build
echo "Testando configuração do Gradle..."
if ./gradlew projects --stacktrace; then
    echo "✅ Configuração do Gradle válida"
    echo "Projetos detectados:"
    ./gradlew projects | grep "Project" || echo "Nenhum projeto adicional detectado"
else
    echo "❌ Configuração do Gradle inválida"
    exit 1
fi

# Attempt the build with enhanced error reporting
echo "Iniciando build do APK..."
if ./gradlew assembleRelease --stacktrace; then
    echo "✅ Build do Gradle completado com sucesso"
else
    echo "❌ Build do Gradle falhou"
    echo "Informações de debug:"
    echo "Módulos incluídos no settings.gradle:"
    grep "include" settings.gradle || echo "Nenhum include encontrado"
    echo "Estrutura do projeto Android:"
    find . -name "build.gradle" -type f | head -10
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
  echo "Listando conteúdo do diretório de saída:"
  find app/build/outputs/ -name "*.apk" -type f || echo "Nenhum APK encontrado"
  echo "apk_found=false" >> "$GITHUB_OUTPUT"
  exit 1
fi
