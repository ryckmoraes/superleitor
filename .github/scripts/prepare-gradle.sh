#!/usr/bin/env bash
set -e

echo "=== Preparing Gradle Environment (Local Capacitor Modules) ==="

cd android

# Garante que o wrapper do Gradle esteja configurado
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "⚠️ gradle-wrapper.jar não encontrado. Gerando com Gradle do sistema..."
  gradle wrapper
fi