#!/usr/bin/env bash
set -e

echo "🔨 Iniciando build do APK..."

cd android
./gradlew assembleRelease

APK_PATH="app/build/outputs/apk/release/app-release.apk"

if [ -f "$APK_PATH" ]; then
  echo "✅ APK gerado com sucesso em $APK_PATH"

  cp "$APK_PATH" ../superleitor.apk

  echo "apk_found=true" >> "$GITHUB_OUTPUT"
  echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
else
  echo "❌ APK não encontrado!"
  echo "apk_found=false" >> "$GITHUB_OUTPUT"
fi