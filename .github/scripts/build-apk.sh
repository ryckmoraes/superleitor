
#!/usr/bin/env bash
set -e

echo "🔨 Starting APK build process..."

cd android

# Clean all previous builds completely
echo "🧹 Deep cleaning previous builds..."
rm -rf .gradle/ build/ app/build/ || true
rm -rf ~/.gradle/caches/ || true

# Ensure cordova.variables.gradle exists with minimal content
echo "🔧 Creating minimal cordova.variables.gradle..."
mkdir -p capacitor-cordova-android-plugins
cat > capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
// Minimal cordova variables
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
    buildToolsVersion = '34.0.0'
}
EOF

# Download Gradle wrapper if missing
echo "📦 Ensuring Gradle wrapper is available..."
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
    echo "Downloading gradle-wrapper.jar..."
    mkdir -p gradle/wrapper
    curl -L -o gradle/wrapper/gradle-wrapper.jar \
      "https://github.com/gradle/gradle/raw/v8.2.1/gradle/wrapper/gradle-wrapper.jar"
fi

# Test Gradle wrapper with online mode
echo "🧪 Testing Gradle wrapper..."
./gradlew --version --no-daemon --info

# Clean with online dependencies
echo "🧹 Cleaning project..."
./gradlew clean --no-daemon --refresh-dependencies --info

# Build with dependency resolution
echo "🚀 Building APK with dependency resolution..."
./gradlew assembleRelease --no-daemon --refresh-dependencies --info

# Verify APK
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK generated successfully"
    cp "$APK_PATH" ../superleitor.apk
    echo "apk_found=true" >> "$GITHUB_OUTPUT"
    echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
    echo "📱 APK ready: ../superleitor.apk"
    ls -lh "$APK_PATH"
else
    echo "❌ APK not found"
    find app/build/outputs/ -name "*.apk" -type f 2>/dev/null || echo "No APKs found"
    echo "apk_found=false" >> "$GITHUB_OUTPUT"
    exit 1
fi
