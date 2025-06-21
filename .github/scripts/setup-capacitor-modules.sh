
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
    // Capacitor Core - always required for Capacitor 7.x
    implementation project(':capacitor-android')
    
    // Optional modules for Capacitor 7.x - only if they exist as directories
    def capacitorAppDir = new File('../node_modules/@capacitor/app')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle created for Capacitor 7.x"

echo "Running npx cap sync android to regenerate Capacitor 7.x configuration..."
cd ..
npx cap sync android || {
  echo "❌ Capacitor sync failed"
  exit 1
}
cd android

# Verificar se o arquivo ainda existe após o sync
if [ ! -f "app/capacitor.build.gradle" ]; then
  echo "⚠️  capacitor.build.gradle was removed by sync, recreating for Capacitor 7.x..."
  
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
    // Capacitor Core - always required for Capacitor 7.x
    implementation project(':capacitor-android')
    
    // Optional modules for Capacitor 7.x - only if they exist as directories
    def capacitorAppDir = new File('../node_modules/@capacitor/app')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF
  
  echo "✅ capacitor.build.gradle recreated after sync for Capacitor 7.x"
fi

echo "✅ Capacitor 7.x modules setup completed"
