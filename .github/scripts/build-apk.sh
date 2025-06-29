
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando processo de build do APK..."

# Construir assets da web primeiro
echo "🌐 Construindo assets da web..."
npm run build

# Verificar se o diretório dist existe e tem conteúdo
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Build da web falhou - diretório dist não encontrado ou sem index.html"
    exit 1
fi

echo "✅ Build da web bem-sucedido"
ls -la dist/

# Copiar ícones corretos antes de tudo
echo "🚩 Copiando ícones corretos..."
for dir in android/app/src/main/res/mipmap-*; do
    if [ -d "$dir" ]; then
        echo "Copiando ícone para $dir"
        cp "$GITHUB_WORKSPACE/.github/resources/ic_launcher_round.png" "$dir/ic_launcher_round.png" || true
        
        # Verificar se o ícone principal existe, se não, copiar o round como principal
        if [ ! -f "$dir/ic_launcher.png" ]; then
            cp "$GITHUB_WORKSPACE/.github/resources/ic_launcher_round.png" "$dir/ic_launcher.png" || true
        fi
    fi
done

# Preparar assets Android
echo "📱 Preparando assets Android..."
mkdir -p android/app/src/main/assets
rm -rf android/app/src/main/assets/* || true

# Copiar todos os arquivos da build para assets
cp -r dist/* android/app/src/main/assets/

echo "✅ Assets copiados para projeto Android"
ls -la android/app/src/main/assets/

# Verificar se index.html existe nos assets
if [ ! -f "android/app/src/main/assets/index.html" ]; then
    echo "❌ index.html não encontrado nos assets Android"
    exit 1
fi

cd android

# Limpeza completa de builds anteriores
echo "🧹 Limpeza profunda de builds anteriores..."
rm -rf .gradle/ build/ app/build/ || true
rm -rf ~/.gradle/caches/ || true

# Garantir permissões do gradle wrapper
chmod +x ./gradlew

# Verificar e baixar Gradle wrapper se necessário
echo "📦 Verificando Gradle wrapper..."
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "Baixando gradle-wrapper.jar..."
    mkdir -p gradle/wrapper
    curl -L -o gradle/wrapper/gradle-wrapper.jar \
      "https://github.com/gradle/gradle/raw/v8.2.1/gradle/wrapper/gradle-wrapper.jar"
fi

# Testar Gradle wrapper
echo "🧪 Testando Gradle wrapper..."
./gradlew --version --no-daemon --warning-mode=all

# Limpar com refresh de dependências
echo "🧹 Limpando projeto..."
./gradlew clean --no-daemon --refresh-dependencies --warning-mode=all

# Construir APK com logging detalhado
echo "🚀 Construindo APK..."
./gradlew assembleRelease --no-daemon --refresh-dependencies --info --stacktrace

# Definir caminho esperado do APK
APK_PATH="app/build/outputs/apk/release/superleitor_01-release.apk"

# Verificar se o APK foi gerado
if [ -f "$APK_PATH" ]; then
    echo "✅ APK gerado com sucesso: $APK_PATH"
    ls -lh "$APK_PATH"

    # Saída para GitHub Actions
    if [ -n "$GITHUB_OUTPUT" ]; then
        echo "apk_found=true" >> "$GITHUB_OUTPUT"
        echo "apk_path=$APK_PATH" >> "$GITHUB_OUTPUT"
    fi
else
    echo "❌ APK não encontrado no local esperado: $APK_PATH"
    echo "🔍 Arquivos APK disponíveis:"
    find . -name "*.apk" -type f || echo "Nenhum APK encontrado"
    
    if [ -n "$GITHUB_OUTPUT" ]; then
        echo "apk_found=false" >> "$GITHUB_OUTPUT"
    fi

    exit 1
fi
