
#!/bin/bash
set -e

echo "=== SETTING UP CAPACITOR 7.x CORE MODULE ==="

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
    // Capacitor Core - the only required dependency for Capacitor 7.x
    // Individual plugins are loaded by Capacitor's plugin system at runtime
    implementation project(':capacitor-android')
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF

echo "✅ capacitor.build.gradle created for Capacitor 7.x (core module only)"

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
    // Capacitor Core - the only required dependency for Capacitor 7.x
    // Individual plugins are loaded by Capacitor's plugin system at runtime
    implementation project(':capacitor-android')
}

if (hasProperty('postBuildExtras')) {
  postBuildExtras()
}
EOF
  
  echo "✅ capacitor.build.gradle recreated after sync for Capacitor 7.x (core module only)"
fi

echo ""
echo "ℹ️  Capacitor 7.x uses a plugin system that loads plugins at runtime"
echo "ℹ️  Individual plugins don't need to be included as separate Gradle projects"
echo "✅ Capacitor 7.x core module setup completed"
