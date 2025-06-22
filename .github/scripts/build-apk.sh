
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK com configuração robusta..."

cd android

# Limpar completamente builds anteriores
echo "🧹 Limpando builds anteriores..."
rm -rf .gradle/ build/ app/build/ || true

# Criar settings.gradle simplificado e funcional
echo "🔧 Criando settings.gradle minimalista..."
cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

// Verificação básica de node_modules
def nodeModulesRoot = new File(rootDir, '../node_modules')
if (!nodeModulesRoot.exists()) {
    throw new GradleException("node_modules not found. Run 'npm install' first.")
}

// Apenas incluir Capacitor Android se existir
def capacitorAndroidDir = new File(nodeModulesRoot, '@capacitor/android')
if (capacitorAndroidDir.exists()) {
    include ':capacitor-android'
    project(':capacitor-android').projectDir = capacitorAndroidDir
    println "✅ Capacitor Android included"
} else {
    println "⚠️ Capacitor Android not found - building without it"
}
EOF

echo "✅ settings.gradle criado"

# Criar capacitor.build.gradle minimalista
echo "🔧 Criando capacitor.build.gradle minimalista..."
cat > app/capacitor.build.gradle << 'EOF'
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    // Apenas incluir Capacitor se o projeto existir
    if (findProject(':capacitor-android') != null) {
        implementation project(':capacitor-android')
        println "✅ Capacitor Android dependency added"
    } else {
        println "⚠️ Building without Capacitor Android"
    }
}

// Evitar erro se postBuildExtras não existir
if (hasProperty('postBuildExtras')) {
    postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle criado"

# Verificar se cordova.variables.gradle existe, se não, criar
if [ ! -f "capacitor-cordova-android-plugins/cordova.variables.gradle" ]; then
    echo "🔧 Criando cordova.variables.gradle..."
    mkdir -p capacitor-cordova-android-plugins
    cat > capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
// Cordova plugin variables
ext {
    minSdkVersion = hasProperty('cdvMinSdkVersion') ? cdvMinSdkVersion : 24
    compileSdkVersion = hasProperty('cdvCompileSdkVersion') ? cdvCompileSdkVersion : 34
    targetSdkVersion = hasProperty('cdvTargetSdkVersion') ? cdvTargetSdkVersion : 34
    buildToolsVersion = hasProperty('cdvBuildToolsVersion') ? cdvBuildToolsVersion : '34.0.0'
}
EOF
    echo "✅ cordova.variables.gradle criado"
fi

# Verificar se gradle wrapper funciona
echo "🧪 Testando Gradle wrapper..."
if ! ./gradlew --version --no-daemon --quiet; then
    echo "❌ Gradle wrapper com problema"
    exit 1
fi

echo "✅ Gradle wrapper funcionando"

# Limpar cache e testar configuração
echo "🧹 Limpando cache do Gradle..."
./gradlew clean --no-daemon --quiet || echo "Clean executado"

# Testar se os projetos são reconhecidos
echo "🧪 Testando configuração de projetos..."
if ./gradlew projects --no-daemon --quiet; then
    echo "✅ Configuração de projetos OK"
else
    echo "❌ Problema na configuração de projetos"
    echo "Debug da configuração:"
    cat settings.gradle
    exit 1
fi

# Build do APK
echo "🚀 Iniciando build do APK..."
if ./gradlew assembleRelease --no-daemon --stacktrace --info; then
    echo "✅ Build do APK completado"
else
    echo "❌ Build falhou"
    
    # Debug detalhado
    echo "🔍 Informações de debug:"
    echo "Conteúdo do settings.gradle:"
    cat settings.gradle
    echo ""
    echo "Conteúdo do capacitor.build.gradle:"
    cat app/capacitor.build.gradle
    echo ""
    echo "Estrutura dos arquivos:"
    find . -name "*.gradle" -type f | head -10
    
    exit 1
fi

# Verificar se APK foi gerado
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK gerado com sucesso"
    cp "$APK_PATH" ../superleitor.apk
    echo "apk_found=true" >> "$GITHUB_OUTPUT"
    echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
    echo "📱 APK copiado para: ../superleitor.apk"
    ls -lh "$APK_PATH"
else
    echo "❌ APK não encontrado"
    echo "📋 Procurando APKs:"
    find app/build/outputs/ -name "*.apk" -type f 2>/dev/null || echo "Nenhum APK encontrado"
    echo "apk_found=false" >> "$GITHUB_OUTPUT"
    exit 1
fi
