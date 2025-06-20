
#!/bin/bash
set -e

echo "=== Verifying Build Environment ==="

# Verify web build
echo "Verifying web build output..."
if [ -d "dist" ] && [ -f "dist/index.html" ]; then
  echo "✅ Web build successful - dist folder and index.html found"
  echo "Build size: $(du -sh dist)"
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
if [ -f "android/app/build.gradle" ]; then
  echo "✅ build.gradle found"
else
  echo "❌ build.gradle missing"
  exit 1
fi

# Check for gradlew
if [ -f "android/gradlew" ]; then
  echo "✅ gradlew found and ready"
else
  echo "❌ gradlew still missing after creation attempt"
  exit 1
fi

# Check assets
ASSETS_PATH="android/app/src/main/assets/public"
if [ -d "$ASSETS_PATH" ] && [ -f "$ASSETS_PATH/index.html" ]; then
  echo "✅ Web assets properly copied to Android"
else
  echo "❌ Web assets not found in Android project"
  find android -name "index.html" -type f || echo "No index.html found in Android project"
  exit 1
fi
