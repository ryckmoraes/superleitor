
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK com configuração simplificada..."

cd android

# FORÇA a correção do settings.gradle com configuração mínima e funcional
echo "🔧 Criando settings.gradle simplificado..."
cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

println "=== Capacitor Core Module Detection ==="

def nodeModulesRoot = new File(rootDir, '../node_modules')
println "Looking for node_modules at: ${nodeModulesRoot.absolutePath}"
println "Node modules exists: ${nodeModulesRoot.exists()}"

if (!nodeModulesRoot.exists()) {
    println "❌ node_modules directory not found"
    throw new GradleException("node_modules directory not found. Please run 'npm install' first.")
}

// Include only the core Capacitor Android module
def capacitorAndroidDir = new File(nodeModulesRoot, '@capacitor/android')
println "Looking for Capacitor Android at: ${capacitorAndroidDir.absolutePath}"

if (capacitorAndroidDir.exists()) {
    include ':capacitor-android'
    project(':capacitor-android').projectDir = capacitorAndroidDir
    println "✅ Included :capacitor-android"
} else {
    println "⚠️ Capacitor Android module not found, continuing without it"
}

println "=== Module Detection Complete ==="
EOF

echo "✅ settings.gradle criado com configuração simplificada"

# Verificar o conteúdo após a correção
echo "📋 Verificando conteúdo do settings.gradle:"
cat settings.gradle

# Criar capacitor.build.gradle simplificado
echo "🔧 Criando capacitor.build.gradle simplificado..."
cat > app/capacitor.build.gradle << 'EOF'
android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17
      targetCompatibility JavaVersion.VERSION_17
  }
}

dependencies {
    // Core Capacitor dependency - only if the module exists
    if (findProject(':capacitor-android') != null) {
        implementation project(':capacitor-android')
        println "✅ Added Capacitor Android dependency"
    } else {
        println "⚠️ Capacitor Android module not available"
    }
}

if (hasProperty('postBuildExtras')) {
    postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle criado"

# Remover diretórios de build antigos completamente
echo "🧹 Limpando completamente builds anteriores..."
rm -rf .gradle/ || echo "Sem cache gradle local para limpar"
rm -rf build/ || echo "Sem diretório build para limpar"
rm -rf app/build/ || echo "Sem diretório app/build para limpar"

# Limpar cache Gradle
echo "🧹 Limpando cache do Gradle..."
./gradlew clean --no-daemon --quiet || echo "Gradle clean completou"

# Testar configuração do Gradle antes do build
echo "🧪 Testando configuração básica do Gradle..."
if ./gradlew help --no-daemon --quiet; then
    echo "✅ Gradle está funcionando"
else
    echo "❌ Gradle não está funcionando corretamente"
    exit 1
fi

# Testar detecção de projetos
echo "🧪 Testando detecção de projetos..."
./gradlew projects --no-daemon --quiet || echo "Comando projects executado"

# Build do APK com configuração mínima
echo "🚀 Iniciando build do APK..."
if ./gradlew assembleRelease --no-daemon --stacktrace; then
    echo "✅ Build do APK completado com sucesso"
else
    echo "❌ Build do APK falhou"
    
    # Informações de debug
    echo "🔍 Debug final:"
    echo "Conteúdo do settings.gradle:"
    cat settings.gradle
    echo ""
    echo "Verificando se app/build.gradle existe:"
    ls -la app/build.gradle || echo "app/build.gradle não encontrado"
    echo ""
    echo "Estrutura do diretório android:"
    find . -name "*.gradle" -type f | head -10
    
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
    echo "📋 Procurando APKs gerados:"
    find app/build/outputs/ -name "*.apk" -type f 2>/dev/null || echo "Nenhum APK encontrado"
    echo "apk_found=false" >> "$GITHUB_OUTPUT"
    exit 1
fi
