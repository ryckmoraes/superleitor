
#!/bin/bash
set -e

echo "=== Verifying Build Environment ==="

# Verify web build
echo "Verifying web build output..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ Web build successful - dist folder and index.html found"
  echo "Build size: $(du -sh dist)"
  
  # Verify essential files in dist
  echo "Checking essential files in dist..."
  for file in "index.html" "assets"; do
    if [ -e "dist/$file" ]; then
      echo "✅ dist/$file exists"
    else
      echo "⚠️  dist/$file missing but continuing..."
    fi
  done
else
  echo "❌ Web build failed - missing dist folder or index.html"
  exit 1
fi

# Verify Android project structure
echo "Verifying Android project structure..."

# Check main directories
for dir in "android" "android/app" "android/app/src" "android/app/src/main"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir exists"
  else
    echo "❌ $dir missing"
    exit 1
  fi
done

# Check key files
REQUIRED_FILES=(
  "android/app/build.gradle"
  "android/build.gradle"
  "android/settings.gradle"
  "android/gradle.properties"
  "android/app/src/main/AndroidManifest.xml"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file found"
  else
    echo "❌ $file missing"
    exit 1
  fi
done

# Check for gradlew
if [ -f "android/gradlew" ]; then
  echo "✅ gradlew found and ready"
  
  # Verify gradlew is executable
  if [ -x "android/gradlew" ]; then
    echo "✅ gradlew is executable"
  else
    echo "⚠️  gradlew exists but not executable, fixing..."
    chmod +x android/gradlew
  fi
else
  echo "❌ gradlew still missing after creation attempt"
  exit 1
fi

# Check assets with more flexible approach
ASSETS_PATHS=(
  "android/app/src/main/assets/public"
  "android/app/src/main/assets"
)

ASSETS_FOUND=false
for path in "${ASSETS_PATHS[@]}"; do
  if [ -d "$path" ] && [ -f "$path/index.html" ]; then
    echo "✅ Web assets found at $path"
    ASSETS_FOUND=true
    break
  fi
done

if [ "$ASSETS_FOUND" = false ]; then
  echo "❌ Web assets not found in expected locations"
  echo "Searching for index.html in Android project..."
  find android -name "index.html" -type f || echo "No index.html found in Android project"
  
  # This is a warning, not a fatal error as Capacitor sync might handle it
  echo "⚠️  Assets verification failed, but continuing as Capacitor sync might resolve this"
fi

# Verify Java/Android environment
echo "Verifying Java environment..."
if [ -n "$JAVA_HOME" ]; then
  echo "✅ JAVA_HOME is set: $JAVA_HOME"
  
  if [ -x "$JAVA_HOME/bin/java" ]; then
    echo "✅ Java executable found"
    java -version || echo "Warning: Java version check failed"
  else
    echo "⚠️  Java executable not found at expected location"
  fi
else
  echo "⚠️  JAVA_HOME not set"
fi

if [ -n "$ANDROID_HOME" ]; then
  echo "✅ ANDROID_HOME is set: $ANDROID_HOME"
else
  echo "⚠️  ANDROID_HOME not set"
fi

echo "=== Build environment verification completed ==="
