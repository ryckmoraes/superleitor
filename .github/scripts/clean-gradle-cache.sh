
#!/bin/bash
set -e

echo "=== CLEANING ALL CACHES AND TEMP FILES ==="

# Limpar cache do Gradle completamente
echo "Cleaning Gradle cache..."
rm -rf ~/.gradle/caches/ || echo "No gradle cache to clean"
rm -rf .gradle/ || echo "No local gradle cache to clean"
rm -rf build/ || echo "No build directory to clean"
rm -rf app/build/ || echo "No app build directory to clean"

# Limpar arquivos temporários do Capacitor
echo "Cleaning Capacitor temp files..."
rm -rf capacitor-cordova-android-plugins/build/ || echo "No capacitor plugins build to clean"

echo "✅ Cache cleanup completed"
