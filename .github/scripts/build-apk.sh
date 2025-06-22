
#!/usr/bin/env bash
set -e

echo "🔨 Starting minimal APK build process..."

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

# Test Gradle wrapper with minimal output
echo "🧪 Testing Gradle wrapper..."
./gradlew --version --no-daemon --quiet --offline || ./gradlew --version --no-daemon --quiet

# Clean with minimal flags
echo "🧹 Cleaning project..."
./gradlew clean --no-daemon --quiet --no-build-cache

# Build with minimal configuration
echo "🚀 Building minimal APK..."
./gradlew assembleRelease --no-daemon --quiet --no-build-cache --offline || \
./gradlew assembleRelease --no-daemon --stacktrace

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
