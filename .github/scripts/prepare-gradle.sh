
#!/usr/bin/env bash
set -e

echo "=== Preparing Gradle Environment (Capacitor 7.x - Fresh Generation) ==="

cd android

# Verify that we're in the right directory
if [ ! -f "build.gradle" ]; then
    echo "❌ Not in Android project directory"
    exit 1
fi

# Check if node_modules exists at parent level
if [ ! -d "../node_modules" ]; then
    echo "❌ node_modules not found at parent level"
    echo "Available directories at parent level:"
    ls -la ../
    exit 1
fi

# Check if essential Capacitor 7.x modules exist
echo "Checking for essential Capacitor 7.x modules..."
if [ ! -d "../node_modules/@capacitor" ]; then
    echo "❌ @capacitor directory not found in node_modules"
    echo "Available modules in node_modules:"
    ls -la ../node_modules/ | head -20
    exit 1
fi

if [ ! -d "../node_modules/@capacitor/android" ]; then
    echo "❌ @capacitor/android not found"
    echo "Available @capacitor modules:"
    ls -la ../node_modules/@capacitor/
    exit 1
fi

# Verify Capacitor 7.x structure
echo "✅ Found Capacitor 7.x modules:"
ls -la ../node_modules/@capacitor/

# Additional cleaning before Gradle operations
echo "Performing additional Gradle cache cleaning..."
rm -rf .gradle/ || echo "No local gradle cache to clean"
rm -rf build/ || echo "No build directory to clean"
rm -rf app/build/ || echo "No app build directory to clean"

# Verify that no stale plugin module references exist in generated files
echo "Validating generated files for stale plugin references..."
if [ -f "settings.gradle" ]; then
    echo "Checking settings.gradle for unwanted plugin module references..."
    if grep -q ":capacitor-haptics\|:capacitor-keyboard\|:capacitor-status-bar\|:capacitor-splash-screen" settings.gradle; then
        echo "❌ Found unwanted plugin module references in settings.gradle:"
        grep ":capacitor-" settings.gradle
        echo "This indicates stale Capacitor configuration. Attempting to fix..."
        
        # Force regenerate the correct settings.gradle
        cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

println "=== Capacitor 7.x Core Module Detection ==="

// Caminho correto para node_modules fora da pasta android/
def nodeModulesRoot = new File(rootDir, '../node_modules')

println "Looking for node_modules at: ${nodeModulesRoot.absolutePath}"
println "Node modules exists: ${nodeModulesRoot.exists()}"

if (!nodeModulesRoot.exists()) {
    println "❌ node_modules directory not found at: ${nodeModulesRoot.absolutePath}"
    throw new GradleException("node_modules directory not found. Please run 'npm install' first.")
}

// Only include the core Capacitor Android module - plugins are handled by Capacitor's plugin system
def capacitorAndroidDir = new File(nodeModulesRoot, '@capacitor/android')
println "Looking for Capacitor Android at: ${capacitorAndroidDir.absolutePath}"
println "Capacitor Android exists: ${capacitorAndroidDir.exists()}"

if (capacitorAndroidDir.exists()) {
    include ':capacitor-android'
    project(':capacitor-android').projectDir = capacitorAndroidDir
    println "✅ Included :capacitor-android (Capacitor 7.x core module)"
} else {
    println "❌ Missing :capacitor-android"
    throw new GradleException("Essential Capacitor Android module not found at: ${capacitorAndroidDir.absolutePath}")
}

println "=== Capacitor 7.x Core Module Detection Complete ==="
println "ℹ️  Individual plugins will be loaded by Capacitor's plugin system at runtime"
EOF
        echo "✅ Fixed settings.gradle to only include core Capacitor module"
    else
        echo "✅ No unwanted plugin module references found"
    fi
fi

# Ensure gradlew wrapper is properly configured
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "⚠️ gradle-wrapper.jar não encontrado. Gerando com Gradle do sistema..."
  gradle wrapper
fi

# Run all preparation scripts for Capacitor 7.x
echo "Running Gradle validation and setup scripts for Capacitor 7.x..."

# 1. Validate Gradle wrapper
chmod +x ../.github/scripts/validate-gradle-wrapper.sh
../.github/scripts/validate-gradle-wrapper.sh

# 2. Validate Capacitor 7.x modules are present
chmod +x ../.github/scripts/validate-capacitor-modules.sh
../.github/scripts/validate-capacitor-modules.sh

# 3. Setup Capacitor 7.x modules
chmod +x ../.github/scripts/setup-capacitor-modules.sh
../.github/scripts/setup-capacitor-modules.sh

echo "✅ Gradle environment prepared successfully for Capacitor 7.x (fresh generation)"
