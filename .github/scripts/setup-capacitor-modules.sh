
#!/bin/bash
set -e

echo "=== SETTING UP CAPACITOR MODULES ==="

echo "Creating/updating capacitor.build.gradle with conditional module loading..."

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
    // Capacitor Core - always required
    implementation project(':capacitor-android')
    
    // Optional modules - only if they exist
    def capacitorAppDir = new File('../node_modules/@capacitor/app/android')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics/android')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard/android')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar/android')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen/android')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle created with conditional logic"

echo "Running npx cap sync android to regenerate local module configuration..."
cd ..
npx cap sync android || {
  echo "❌ Capacitor sync failed"
  exit 1
}
cd android

# Verificar se o arquivo ainda existe após o sync
if [ ! -f "app/capacitor.build.gradle" ]; then
  echo "⚠️  capacitor.build.gradle was removed by sync, recreating..."
  
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
    // Capacitor Core - always required
    implementation project(':capacitor-android')
    
    // Optional modules - only if they exist
    def capacitorAppDir = new File('../node_modules/@capacitor/app/android')
    if (capacitorAppDir.exists()) {
        implementation project(':capacitor-app')
    }
    
    def capacitorHapticsDir = new File('../node_modules/@capacitor/haptics/android')
    if (capacitorHapticsDir.exists()) {
        implementation project(':capacitor-haptics')
    }
    
    def capacitorKeyboardDir = new File('../node_modules/@capacitor/keyboard/android')
    if (capacitorKeyboardDir.exists()) {
        implementation project(':capacitor-keyboard')
    }
    
    def capacitorStatusBarDir = new File('../node_modules/@capacitor/status-bar/android')
    if (capacitorStatusBarDir.exists()) {
        implementation project(':capacitor-status-bar')
    }
    
    def capacitorSplashScreenDir = new File('../node_modules/@capacitor/splash-screen/android')
    if (capacitorSplashScreenDir.exists()) {
        implementation project(':capacitor-splash-screen')
    }
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF
  
  echo "✅ capacitor.build.gradle recreated after sync"
fi

echo "✅ Capacitor modules setup completed"
