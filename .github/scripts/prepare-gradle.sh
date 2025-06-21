
#!/bin/bash
set -e

echo "=== Preparing Gradle Environment ==="

echo "Checking project structure in root..."
ls -la

# Verificar se estamos no diretório correto
if [ ! -d "android" ]; then
  echo "❌ Android directory not found"
  exit 1
fi

cd android

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

echo "Testing gradlew connectivity..."
./gradlew --version || {
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

echo "Gradle Wrapper is working correctly"

# Verificar dependências do Capacitor
echo "Checking Capacitor dependencies..."
cd ..
if [ -f "package.json" ]; then
  echo "✅ package.json found"
  
  # Verificar se as dependências do Capacitor estão instaladas
  if [ -d "node_modules/@capacitor" ]; then
    echo "✅ Capacitor dependencies found"
  else
    echo "⚠️  Capacitor dependencies not found in node_modules"
  fi
else
  echo "❌ package.json not found in root"
fi

cd android

echo "=== Gradle preparation completed successfully ==="
