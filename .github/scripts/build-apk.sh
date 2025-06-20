
#!/bin/bash
set -e

echo "=== Building APK ==="

cd android

echo "Cleaning Android project..."
./gradlew clean --no-daemon
echo "Clean completed"

echo "Building APK..."
./gradlew assembleDebug --stacktrace --info --no-daemon
echo "APK build process completed"

echo "Searching for generated APK files..."

# Search for APK files
find . -name "*.apk" -type f | while read apk_file; do
  echo "Found APK: $apk_file"
  echo "Size: $(ls -lh "$apk_file" | awk '{print $5}')"
done

# Look for the main APK
APK_PATH=""
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
  APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
elif [ -f "app/build/outputs/apk/debug/superleitor-debug.apk" ]; then
  APK_PATH="app/build/outputs/apk/debug/superleitor-debug.apk"
else
  # Search for any debug APK
  APK_PATH=$(find app/build/outputs/apk/debug -name "*debug.apk" -type f | head -1)
fi

if [ -n "$APK_PATH" ] && [ -f "$APK_PATH" ]; then
  echo "✅ APK found at: $APK_PATH"
  echo "APK size: $(ls -lh "$APK_PATH" | awk '{print $5}')"
  echo "apk_path=android/$APK_PATH" >> $GITHUB_OUTPUT
  echo "apk_found=true" >> $GITHUB_OUTPUT
  
  # Copy APK to root with standard name
  cp "$APK_PATH" "../superleitor.apk"
  echo "APK copied to superleitor.apk"
else
  echo "❌ No APK file found"
  echo "Build output structure:"
  find app/build -type f -name "*.apk" || echo "No APK files found"
  echo "apk_found=false" >> $GITHUB_OUTPUT
  exit 1
fi
