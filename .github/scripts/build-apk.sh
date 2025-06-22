
#!/usr/bin/env bash
set -e

echo "🔨 Starting robust APK build process..."

cd android

# Clean all previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .gradle/ build/ app/build/ || true

# Ensure cordova.variables.gradle exists
echo "🔧 Ensuring cordova.variables.gradle exists..."
mkdir -p capacitor-cordova-android-plugins
if [ ! -f "capacitor-cordova-android-plugins/cordova.variables.gradle" ]; then
    cat > capacitor-cordova-android-plugins/cordova.variables.gradle << 'EOF'
ext {
    minSdkVersion = hasProperty('cdvMinSdkVersion') ? cdvMinSdkVersion : 24
    compileSdkVersion = hasProperty('cdvCompileSdkVersion') ? cdvCompileSdkVersion : 34
    targetSdkVersion = hasProperty('cdvTargetSdkVersion') ? cdvTargetSdkVersion : 34
    buildToolsVersion = hasProperty('cdvBuildToolsVersion') ? cdvBuildToolsVersion : '34.0.0'
}
EOF
    echo "✅ Created cordova.variables.gradle"
fi

# Test Gradle wrapper
echo "🧪 Testing Gradle wrapper..."
if ! ./gradlew --version --no-daemon --quiet; then
    echo "❌ Gradle wrapper failed"
    exit 1
fi

# Clean and test configuration
echo "🧹 Cleaning Gradle cache..."
./gradlew clean --no-daemon --quiet || echo "Clean completed with warnings"

# Test project configuration
echo "🧪 Testing project configuration..."
if ./gradlew projects --no-daemon --quiet; then
    echo "✅ Project configuration valid"
else
    echo "❌ Project configuration invalid"
    echo "Debug info:"
    cat settings.gradle
    exit 1
fi

# Build APK with detailed output
echo "🚀 Building APK..."
if ./gradlew assembleRelease --no-daemon --stacktrace; then
    echo "✅ APK build successful"
else
    echo "❌ APK build failed"
    
    # Show detailed debug info
    echo "🔍 Debug information:"
    echo "Settings content:"
    cat settings.gradle
    echo ""
    echo "Capacitor build content:"
    cat app/capacitor.build.gradle
    echo ""
    echo "Available gradle files:"
    find . -name "*.gradle" -type f
    
    exit 1
fi

# Verify and copy APK
APK_PATH="app/build/outputs/apk/release/app-release.apk"
if [ -f "$APK_PATH" ]; then
    echo "✅ APK generated successfully"
    cp "$APK_PATH" ../superleitor.apk
    echo "apk_found=true" >> "$GITHUB_OUTPUT"
    echo "apk_path=superleitor.apk" >> "$GITHUB_OUTPUT"
    echo "📱 APK ready: ../superleitor.apk"
    ls -lh "$APK_PATH"
else
    echo "❌ APK not found at expected location"
    echo "📋 Searching for APKs:"
    find app/build/outputs/ -name "*.apk" -type f 2>/dev/null || echo "No APKs found"
    echo "apk_found=false" >> "$GITHUB_OUTPUT"
    exit 1
fi
