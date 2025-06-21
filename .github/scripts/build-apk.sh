
#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK com validação aprimorada..."

cd android

# Final validation before build
echo "Realizando validação final antes do build..."
echo "Verificando se apenas o módulo core do Capacitor está incluído..."

if [ -f "settings.gradle" ]; then
    echo "Conteúdo do settings.gradle:"
    cat settings.gradle | grep -A 10 -B 10 "capacitor" || echo "Nenhuma referência ao capacitor encontrada"
    
    # Check for unwanted plugin module references one more time
    if grep -q ":capacitor-haptics\|:capacitor-keyboard\|:capacitor-status-bar\|:capacitor-splash-screen" settings.gradle; then
        echo "❌ ERRO CRÍTICO: Ainda existem referências a módulos de plugin individuais!"
        echo "Referências encontradas:"
        grep ":capacitor-" settings.gradle
        echo "O build será interrompido para evitar o erro de resolução de módulo."
        exit 1
    else
        echo "✅ Validação passou: apenas o módulo core do Capacitor está incluído"
    fi
else
    echo "❌ settings.gradle não encontrado"
    exit 1
fi

# Clear any remaining build artifacts
echo "Limpando artefatos de build remanescentes..."
./gradlew clean || echo "Gradle clean completado com avisos"

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
