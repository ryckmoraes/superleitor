
#!/bin/bash
set -e

echo "=== Building APK with Embedded Capacitor Dependencies ==="

cd android

echo "=== FINAL CACHE CLEAN BEFORE BUILD ==="
echo "Removing any remaining cache..."
rm -rf .gradle/ || echo "No local gradle cache to clean"
rm -rf build/ || echo "No build directory to clean"
rm -rf app/build/ || echo "No app build directory to clean"

# Garantir que não há capacitor.build.gradle sendo regenerado
echo "Ensuring no capacitor.build.gradle exists..."
rm -f app/capacitor.build.gradle || echo "No capacitor.build.gradle to remove"

echo "Verifying gradlew before build..."
if [ ! -x "./gradlew" ]; then
  echo "❌ gradlew is not executable"
  ls -la gradlew
  exit 1
fi

echo "Testing gradlew connectivity with no daemon..."
./gradlew --version --no-daemon || {
  echo "❌ gradlew test failed"
  echo "Checking environment..."
  echo "JAVA_HOME: $JAVA_HOME"
  java -version || echo "Java not available"
  echo "Current directory contents:"
  ls -la
  echo "Gradle wrapper contents:"
  ls -la gradle/wrapper/
  exit 1
}

echo "=== SKIPPING CAPACITOR SYNC TO AVOID REGENERATION ==="
echo "⚠️  NOT running 'npx cap sync android' to prevent capacitor.build.gradle regeneration"
echo "Using embedded Capacitor dependencies in app/build.gradle"

# Verificar se as dependências do Capacitor estão no build.gradle
echo "Verifying Capacitor dependencies are embedded in app/build.gradle..."
if ! grep -q "capacitor-android" app/build.gradle; then
  echo "❌ Capacitor dependencies missing from app/build.gradle"
  exit 1
fi
echo "✅ Capacitor dependencies confirmed in app/build.gradle"

echo "Cleaning Android project with no daemon..."
./gradlew clean --no-daemon --stacktrace --warning-mode none || {
  echo "❌ Clean failed"
  exit 1
}
echo "✅ Clean completed successfully"

echo "Checking project dependencies..."
./gradlew dependencies --no-daemon --warning-mode none --configuration debugRuntimeClasspath > deps.log 2>&1 || {
  echo "⚠️  Dependencies check failed, but continuing..."
  echo "Dependencies error details:"
  tail -20 deps.log || echo "No deps.log available"
}

echo "Building APK with detailed logging and no cache..."
set +e  # Temporarily disable exit on error to capture build output
./gradlew assembleDebug \
  --stacktrace \
  --info \
  --no-daemon \
  --warning-mode none \
  --no-build-cache \
  --no-configuration-cache \
  --gradle-user-home ~/.gradle > build.log 2>&1

BUILD_EXIT_CODE=$?
set -e  # Re-enable exit on error

echo "Build exit code: $BUILD_EXIT_CODE"

if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ APK build failed with exit code $BUILD_EXIT_CODE"
  echo "=== BUILD ERROR ANALYSIS ==="
  
  if [ -f "build.log" ]; then
    LOG_SIZE=$(wc -l < build.log)
    echo "Build log has $LOG_SIZE lines"
    
    # Análise específica de erros comuns
    echo ""
    echo "=== Searching for Capacitor/Android specific errors ==="
    grep -i "capacitor\|android\|manifest\|resource\|aapt" build.log | tail -15 || echo "No Capacitor/Android specific errors found"
    
    echo ""
    echo "=== Searching for compilation errors ==="
    grep -i "error\|failed\|exception\|cannot resolve" build.log | tail -15 || echo "No obvious compilation errors found"
    
    echo ""
    echo "=== Searching for dependency issues ==="
    grep -i "could not find\|resolve\|dependency" build.log | tail -10 || echo "No dependency issues found"
    
    if [ $LOG_SIZE -lt 150 ]; then
      echo ""
      echo "=== Complete build log (small enough to show) ==="
      cat build.log
    else
      echo ""
      echo "=== Last 50 lines of build output ==="
      tail -50 build.log
      echo ""
      echo "=== First 30 lines of build output ==="
      head -30 build.log
    fi
  else
    echo "❌ No build.log file found"
  fi
  
  # Verificar estrutura do projeto
  echo ""
  echo "=== Project structure analysis ==="
  echo "App source structure:"
  find app/src -type f -name "*.java" -o -name "*.kt" -o -name "*.xml" | head -20 || echo "No source files found"
  
  echo ""
  echo "Build outputs:"
  if [ -d "app/build" ]; then
    find app/build -name "*.apk" -o -name "*.log" | head -10 || echo "No APK or log files in build directory"
  else
    echo "No app/build directory found"
  fi
  
  exit 1
fi

echo "✅ APK build process completed successfully"

echo "Searching for generated APK files..."

# Buscar APKs com output detalhado
find . -name "*.apk" -type f | while read apk_file; do
  echo "Found APK: $apk_file"
  echo "Size: $(ls -lh "$apk_file" | awk '{print $5}')"
  echo "Full path: $(realpath "$apk_file")"
done

# Procurar pelo APK principal com nomes possíveis
APK_PATH=""
POSSIBLE_PATHS=(
  "app/build/outputs/apk/debug/app-debug.apk"
  "app/build/outputs/apk/debug/superleitor-debug.apk"
  "app/build/outputs/apk/debug/superleitor_01-debug.apk"
)

for path in "${POSSIBLE_PATHS[@]}"; do
  if [ -f "$path" ]; then
    APK_PATH="$path"
    echo "✅ APK found at predefined path: $APK_PATH"
    break
  fi
done

# Se não encontrado nos caminhos predefinidos, buscar qualquer APK debug
if [ -z "$APK_PATH" ]; then
  echo "Searching for any debug APK..."
  APK_PATH=$(find app/build/outputs/apk -name "*debug*.apk" -type f | head -1)
fi

if [ -n "$APK_PATH" ] && [ -f "$APK_PATH" ]; then
  echo "✅ APK successfully found at: $APK_PATH"
  echo "APK size: $(ls -lh "$APK_PATH" | awk '{print $5}')"
  echo "APK creation time: $(ls -l "$APK_PATH" | awk '{print $6, $7, $8}')"
  
  # Verificar se APK é válido (verificação básica)
  if [ -s "$APK_PATH" ]; then
    echo "✅ APK file is not empty"
  else
    echo "❌ APK file is empty"
    exit 1
  fi
  
  # Verificar assinatura do APK
  if command -v aapt >/dev/null 2>&1; then
    echo "Checking APK contents..."
    aapt dump badging "$APK_PATH" | head -3 || echo "Could not check APK contents"
  fi
  
  echo "apk_path=android/$APK_PATH" >> $GITHUB_OUTPUT
  echo "apk_found=true" >> $GITHUB_OUTPUT
  
  # Copiar APK para raiz com nome padrão
  cp "$APK_PATH" "../superleitor.apk"
  echo "✅ APK copied to superleitor.apk"
  
  # Verificar APK copiado
  if [ -f "../superleitor.apk" ]; then
    echo "✅ APK successfully copied to root directory"
    echo "Final APK size: $(ls -lh "../superleitor.apk" | awk '{print $5}')"
  else
    echo "❌ Failed to copy APK to root directory"
    exit 1
  fi
else
  echo "❌ No APK file found"
  echo "Build output structure analysis:"
  echo "=== App build directory structure ==="
  if [ -d "app/build" ]; then
    echo "Build directory contents:"
    find app/build -type f | head -30 || echo "No files found in build directory"
    echo ""
    echo "Looking specifically for APK files:"
    find app/build -name "*.apk" | head -10 || echo "No APK files found in build directory"
  else
    echo "❌ No app/build directory found"
  fi
  
  echo "apk_found=false" >> $GITHUB_OUTPUT
  exit 1
fi

echo "=== APK Build completed successfully with embedded Capacitor deps ==="
