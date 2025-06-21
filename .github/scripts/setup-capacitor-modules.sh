
#!/bin/bash
set -e

echo "=== SETTING UP CAPACITOR 7.x MODULES ==="

echo "Creating/updating capacitor.build.gradle for Capacitor 7.x..."

cat > app/capacitor.build.gradle << 'EOF'
// IMPORTANT: Do not modify this file directly.
// This file is managed by the 'npx cap sync' command.

android {
  compileOptions {
      sourceCompatibility JavaVersion.VERSION_17
      targetCompatibility JavaVersion.VERSION_17
  }
}

apply from: '../capacitor-cordova-android-plugins/cordova.variables.gradle'

dependencies {
    // Capacitor Core - required for all Capacitor apps
    implementation project(':capacitor-android')
    
    // Capacitor plugins that the app uses
    if (findProject(':capacitor-haptics') != null) {
        implementation project(':capacitor-haptics')
    }
    if (findProject(':capacitor-keyboard') != null) {
        implementation project(':capacitor-keyboard')
    }
    if (findProject(':capacitor-status-bar') != null) {
        implementation project(':capacitor-status-bar')
    }
    if (findProject(':capacitor-splash-screen') != null) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle created for Capacitor 7.x"

echo "Ensuring settings.gradle includes all required modules..."
cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

println "=== Capacitor 7.x Module Detection ==="

// Caminho correto para node_modules fora da pasta android/
def nodeModulesRoot = new File(rootDir, '../node_modules')

println "Looking for node_modules at: ${nodeModulesRoot.absolutePath}"
println "Node modules exists: ${nodeModulesRoot.exists()}"

if (!nodeModulesRoot.exists()) {
    println "❌ node_modules directory not found at: ${nodeModulesRoot.absolutePath}"
    throw new GradleException("node_modules directory not found. Please run 'npm install' first.")
}

// Include the core Capacitor Android module
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

// Include individual Capacitor plugin modules that the app uses
def pluginModules = [
    [name: ':capacitor-haptics', path: '@capacitor/haptics/android'],
    [name: ':capacitor-keyboard', path: '@capacitor/keyboard/android'],
    [name: ':capacitor-status-bar', path: '@capacitor/status-bar/android'],
    [name: ':capacitor-splash-screen', path: '@capacitor/splash-screen/android']
]

pluginModules.each { plugin ->
    def pluginDir = new File(nodeModulesRoot, plugin.path)
    println "Looking for ${plugin.name} at: ${pluginDir.absolutePath}"
    println "${plugin.name} exists: ${pluginDir.exists()}"
    
    if (pluginDir.exists()) {
        include plugin.name
        project(plugin.name).projectDir = pluginDir
        println "✅ Included ${plugin.name}"
    } else {
        println "⚠️  Plugin ${plugin.name} not found at ${pluginDir.absolutePath} (will be skipped)"
    }
}

println "=== Capacitor 7.x Module Detection Complete ==="
EOF

echo "✅ settings.gradle created/updated for Capacitor 7.x"

echo "Running npx cap sync android to ensure configuration is applied..."
cd ..
npx cap sync android || {
  echo "❌ Capacitor sync failed"
  exit 1
}
cd android

# Verify that the configuration was preserved
echo "Verificando se a configuração foi preservada após o sync..."
if [ -f "settings.gradle" ]; then
  if grep -q ":capacitor-android" settings.gradle; then
    echo "✅ Configuração preservada - :capacitor-android incluído"
  else
    echo "⚠️  Configuração foi sobrescrita pelo sync, recriando..."
    cat > settings.gradle << 'EOF'
rootProject.name = 'superleitor'
include ':app'

println "=== Capacitor 7.x Module Detection ==="

// Caminho correto para node_modules fora da pasta android/
def nodeModulesRoot = new File(rootDir, '../node_modules')

println "Looking for node_modules at: ${nodeModulesRoot.absolutePath}"
println "Node modules exists: ${nodeModulesRoot.exists()}"

if (!nodeModulesRoot.exists()) {
    println "❌ node_modules directory not found at: ${nodeModulesRoot.absolutePath}"
    throw new GradleException("node_modules directory not found. Please run 'npm install' first.")
}

// Include the core Capacitor Android module
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

// Include individual Capacitor plugin modules that the app uses
def pluginModules = [
    [name: ':capacitor-haptics', path: '@capacitor/haptics/android'],
    [name: ':capacitor-keyboard', path: '@capacitor/keyboard/android'],
    [name: ':capacitor-status-bar', path: '@capacitor/status-bar/android'],
    [name: ':capacitor-splash-screen', path: '@capacitor/splash-screen/android']
]

pluginModules.each { plugin ->
    def pluginDir = new File(nodeModulesRoot, plugin.path)
    println "Looking for ${plugin.name} at: ${pluginDir.absolutePath}"
    println "${plugin.name} exists: ${pluginDir.exists()}"
    
    if (pluginDir.exists()) {
        include plugin.name
        project(plugin.name).projectDir = pluginDir
        println "✅ Included ${plugin.name}"
    } else {
        println "⚠️  Plugin ${plugin.name} not found at ${pluginDir.absolutePath} (will be skipped)"
    }
}

println "=== Capacitor 7.x Module Detection Complete ==="
EOF
    echo "✅ settings.gradle recriado após sync"
  fi
fi

echo ""
echo "✅ Capacitor 7.x modules setup completed"
