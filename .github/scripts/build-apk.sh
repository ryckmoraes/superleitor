
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

# Copiar e verificar ícones ANTES de preparar assets Android
echo "🚩 Copiando e verificando ícones..."
ICON_SOURCE="$GITHUB_WORKSPACE/.github/resources/ic_launcher_round.png"

if [ ! -f "$ICON_SOURCE" ]; then
    echo "❌ Arquivo de ícone fonte não encontrado: $ICON_SOURCE"
    exit 1
fi

echo "✅ Arquivo de ícone fonte encontrado: $ICON_SOURCE"

# Copiar para todos os diretórios mipmap
for dir in android/app/src/main/res/mipmap-*; do
    if [ -d "$dir" ]; then
        echo "📱 Copiando ícone para $dir"
        
        # Copiar como ic_launcher_round.png
        cp "$ICON_SOURCE" "$dir/ic_launcher_round.png"
        
        # Copiar também como ic_launcher.png se não existir
        if [ ! -f "$dir/ic_launcher.png" ]; then
            cp "$ICON_SOURCE" "$dir/ic_launcher.png"
        fi
        
        # Verificar se foram copiados
        if [ -f "$dir/ic_launcher_round.png" ]; then
            echo "  ✅ ic_launcher_round.png copiado"
        else
            echo "  ❌ Falha ao copiar ic_launcher_round.png"
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

echo "✅ index.html confirmado nos assets Android"

cd android

# Limpeza e preparação do Gradle
echo "🧹 Limpeza e preparação..."
rm -rf .gradle/ build/ app/build/ || true

# Garantir permissões do gradle wrapper
chmod +x ./gradlew

# Verificar Gradle wrapper
echo "📦 Verificando Gradle wrapper..."
./gradlew --version --no-daemon

# Limpar projeto
echo "🧹 Limpando projeto..."
./gradlew clean --no-daemon --refresh-dependencies

# Construir APK
echo "🚀 Construindo APK..."
./gradlew assembleRelease --no-daemon --info

# Verificar se o APK foi gerado
APK_PATH="app/build/outputs/apk/release/superleitor_01-release.apk"

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
