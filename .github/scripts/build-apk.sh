
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
cp -r dist/* android/app/src/main/assets/

echo "✅ Assets copied to Android project"
ls -la android/app/src/main/assets/

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

# Test Gradle wrapper
echo "🧪 Testing Gradle wrapper..."
./gradlew --version --no-daemon

# Clean with online dependencies
echo "🧹 Cleaning project..."
./gradlew clean --no-daemon --refresh-dependencies

# Build APK
echo "🚀 Building APK..."
./gradlew assembleRelease --no-daemon --refresh-dependencies

# Search for APK
echo "🔍 Searching for generated APK..."
APK_PATHS=(
    "app/build/outputs/apk/release/superleitor_01-release.apk"
    "app/build/outputs/apk/release/app-release.apk"
    "app/build/outputs/apk/release/superleitor-release.apk"
)

APK_FOUND=""
for APK_PATH in "${APK_PATHS[@]}"; do
    if [ -f "$APK_PATH" ]; then
        echo "✅ APK found at: $APK_PATH"
        APK_FOUND="$APK_PATH"
        break
    fi
done

if [ -n "$APK_FOUND" ]; then
    echo "✅ APK generated successfully"
    cp "$APK_FOUND" ../superleitor.apk
    echo "apk_found=true" >> "$GITHUB_OUTPUT"
    echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
    echo "📱 APK ready: ../superleitor.apk"
    ls -lh "$APK_FOUND"
else
    echo "❌ APK not found in any expected location"
    find app/build/outputs/ -name "*.apk" -type f 2>/dev/null || echo "No APKs found"
    ls -la app/build/outputs/apk/release/ || echo "Release directory not found"
    echo "apk_found=false" >> "$GITHUB_OUTPUT"
    exit 1
fi
