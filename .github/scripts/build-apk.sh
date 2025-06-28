#!/usr/bin/env bash
set -e

echo "🔨 Starting APK build process..."

# Build web assets first
echo "🌐 Building web assets..."
npm run build

# Ensure dist directory exists and has content
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "❌ Web build failed - dist directory missing or no index.html"
    exit 1
fi

echo "✅ Web build successful"
ls -la dist/

# Create Android assets directory and copy web build
echo "📱 Preparing Android assets..."
mkdir -p android/app/src/main/assets
rm -rf android/app/src/main/assets/* || true
cp -r dist/* android/app/src/main/assets/

# Also copy to alternative paths that MainActivity might check
mkdir -p android/app/src/main/assets/dist
cp -r dist/* android/app/src/main/assets/dist/

mkdir -p android/app/src/main/assets/www  
cp -r dist/* android/app/src/main/assets/www/

echo "✅ Assets copied to Android project"
ls -la android/app/src/main/assets/

cd android

# Clean all previous builds completely
echo "🧹 Deep cleaning previous builds..."
rm -rf .gradle/ build/ app/build/ || true
rm -rf ~/.gradle/caches/ || true

# Ensure gradle wrapper permissions
chmod +x ./gradlew

# Download Gradle wrapper if missing
echo "📦 Ensuring Gradle wrapper is available..."
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "Downloading gradle-wrapper.jar..."
    mkdir -p gradle/wrapper
    curl -L -o gradle/wrapper/gradle-wrapper.jar \
      "https://github.com/gradle/gradle/raw/v8.2.1/gradle/wrapper/gradle-wrapper.jar"
fi

# Test Gradle wrapper
echo "🧪 Testing Gradle wrapper..."
./gradlew --version --no-daemon --warning-mode=all

# Clean with dependencies refresh
echo "🧹 Cleaning project..."
./gradlew clean --no-daemon --refresh-dependencies --warning-mode=all

# Build APK with detailed logging
echo "🚀 Building APK..."
./gradlew assembleRelease --no-daemon --refresh-dependencies --info --stacktrace

# Define expected APK path
APK_PATH="app/build/outputs/apk/release/superleitor_01-release.apk"

# Check if the expected APK exists
if [ -f "$APK_PATH" ]; then
    echo "✅ APK generated successfully: $APK_PATH"
    ls -lh "$APK_PATH"

    # GitHub Actions output
    if [ -n "$GITHUB_OUTPUT" ]; then
        echo "apk_found=true" >> "$GITHUB_OUTPUT"
        echo "apk_path=$APK_PATH" >> "$GITHUB_OUTPUT"
    fi
else
    echo "❌ APK not found at expected location: $APK_PATH"
    echo "🔍 Available APK files:"
    find . -name "*.apk" -type f || echo "No APKs found"
    
    if [ -n "$GITHUB_OUTPUT" ]; then
        echo "apk_found=false" >> "$GITHUB_OUTPUT"
    fi

    exit 1
fi
