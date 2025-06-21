
#!/bin/bash
set -e

echo "=== COMPREHENSIVE CAPACITOR & GRADLE CACHE CLEANING ==="

# Clean npm cache completely
echo "Cleaning npm cache..."
npm cache clean --force || echo "npm cache clean failed but continuing..."

# Clean Capacitor cache and generated files
echo "Cleaning Capacitor cache and generated files..."
npx cap clean android || echo "Capacitor clean failed but continuing..."

# Remove all Gradle caches and build directories
echo "Cleaning Gradle caches..."
rm -rf ~/.gradle/caches/ || echo "No global gradle cache to clean"
rm -rf ~/.gradle/daemon/ || echo "No gradle daemon to clean"
rm -rf .gradle/ || echo "No local gradle cache to clean"
rm -rf android/.gradle/ || echo "No android gradle cache to clean"
rm -rf android/build/ || echo "No android build directory to clean"
rm -rf android/app/build/ || echo "No app build directory to clean"

# Clean Capacitor plugin build directories
echo "Cleaning Capacitor plugin build directories..."
rm -rf android/capacitor-cordova-android-plugins/build/ || echo "No capacitor plugins build to clean"

# Remove any generated Capacitor files that might contain stale references
echo "Removing potentially stale Capacitor generated files..."
rm -rf android/app/src/main/assets/public/ || echo "No assets to clean"

# Clean any temporary or cache files
echo "Cleaning temporary files..."
find android -name "*.tmp" -delete || echo "No tmp files to clean"
find android -name ".DS_Store" -delete || echo "No .DS_Store files to clean"

echo "✅ Comprehensive cache cleanup completed"
echo "ℹ️  All Gradle, Capacitor, and npm caches have been cleared"
echo "ℹ️  The next build will start completely fresh"
