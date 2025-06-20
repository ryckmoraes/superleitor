
#!/bin/bash
set -e

echo "=== Building APK ==="

cd android

echo "Verifying gradlew before build..."
if [ ! -x "./gradlew" ]; then
  echo "❌ gradlew is not executable"
  exit 1
fi

echo "Testing gradlew connectivity..."
./gradlew --version || {
  echo "❌ gradlew test failed"
  exit 1
}

echo "Cleaning Android project..."
./gradlew clean --no-daemon --stacktrace --warning-mode none || {
  echo "❌ Clean failed"
  exit 1
}
echo "Clean completed successfully"

echo "Running tasks to prepare build..."
./gradlew tasks --no-daemon --warning-mode none || {
  echo "⚠️ Tasks listing failed, but continuing..."
}

echo "Building APK with detailed logging..."
./gradlew assembleDebug \
  --stacktrace \
  --info \
  --no-daemon \
  --warning-mode none \
  --no-build-cache \
  --gradle-user-home ~/.gradle 2>&1 | tee build.log || {
  echo "❌ APK build failed"
  echo "=== BUILD ERROR DETAILS ==="
  
  # Show the last 50 lines of build output
  echo "=== Last 50 lines of build output ==="
  tail -50 build.log || echo "Could not read build.log"
  
  # Look for common error patterns
  echo "=== Searching for specific errors ==="
  grep -i "error" build.log | tail -10 || echo "No errors found in grep"
  grep -i "failed" build.log | tail -10 || echo "No failures found in grep"
  grep -i "exception" build.log | tail -10 || echo "No exceptions found in grep"
  
  # Check for dependency issues
  echo "=== Checking for dependency issues ==="
  grep -i "resolve" build.log | tail -5 || echo "No resolve issues found"
  grep -i "dependency" build.log | tail -5 || echo "No dependency issues found"
  
  # Check for compilation issues
  echo "=== Checking for compilation issues ==="
  grep -i "compilation" build.log | tail -5 || echo "No compilation issues found"
  grep -i "java" build.log | tail -5 || echo "No java issues found"
  
  # Show build directory structure
  echo "=== Build directory structure ==="
  if [ -d "app/build" ]; then
    find app/build -type f -name "*.log" -exec echo "=== {} ===" \; -exec tail -10 {} \; 2>/dev/null || echo "No additional log files found"
    
    echo "=== Build outputs directory structure ==="
    find app/build/outputs -type f 2>/dev/null | head -20 || echo "No outputs directory found"
  else
    echo "No app/build directory found"
  fi
  
  # Show Gradle daemon status
  echo "=== Gradle daemon status ==="
  ./gradlew --status || echo "Could not get daemon status"
  
  # Show system resources
  echo "=== System resources ==="
  free -h || echo "Could not get memory info"
  df -h . || echo "Could not get disk info"
  
  exit 1
}
echo "APK build process completed successfully"

echo "Searching for generated APK files..."

# Search for APK files with detailed output
find . -name "*.apk" -type f | while read apk_file; do
  echo "Found APK: $apk_file"
  echo "Size: $(ls -lh "$apk_file" | awk '{print $5}')"
  echo "Full path: $(realpath "$apk_file")"
done

# Look for the main APK with multiple possible names
APK_PATH=""
POSSIBLE_PATHS=(
  "app/build/outputs/apk/debug/app-debug.apk"
  "app/build/outputs/apk/debug/superleitor-debug.apk"
  "app/build/outputs/apk/debug/superleitor_01-debug.apk"
)

for path in "${POSSIBLE_PATHS[@]}"; do
  if [ -f "$path" ]; then
    APK_PATH="$path"
    echo "✅ APK found at predefined path: $APK_PATH"
    break
  fi
done

# If not found in predefined paths, search for any debug APK
if [ -z "$APK_PATH" ]; then
  echo "Searching for any debug APK..."
  APK_PATH=$(find app/build/outputs/apk -name "*debug.apk" -type f | head -1)
fi

if [ -n "$APK_PATH" ] && [ -f "$APK_PATH" ]; then
  echo "✅ APK successfully found at: $APK_PATH"
  echo "APK size: $(ls -lh "$APK_PATH" | awk '{print $5}')"
  echo "APK creation time: $(ls -l "$APK_PATH" | awk '{print $6, $7, $8}')"
  
  # Verify APK is valid (basic check)
  if [ -s "$APK_PATH" ]; then
    echo "✅ APK file is not empty"
  else
    echo "❌ APK file is empty"
    exit 1
  fi
  
  echo "apk_path=android/$APK_PATH" >> $GITHUB_OUTPUT
  echo "apk_found=true" >> $GITHUB_OUTPUT
  
  # Copy APK to root with standard name
  cp "$APK_PATH" "../superleitor.apk"
  echo "✅ APK copied to superleitor.apk"
  
  # Verify copied APK
  if [ -f "../superleitor.apk" ]; then
    echo "✅ APK successfully copied to root directory"
    echo "Final APK size: $(ls -lh "../superleitor.apk" | awk '{print $5}')"
  else
    echo "❌ Failed to copy APK to root directory"
    exit 1
  fi
else
  echo "❌ No APK file found"
  echo "Build output structure:"
  echo "=== App build directory structure ==="
  if [ -d "app/build" ]; then
    find app/build -type f -name "*.apk" | head -20 || echo "No APK files found in build directory"
    echo "=== All files in outputs directory ==="
    find app/build/outputs -type f | head -50 || echo "No outputs directory found"
  else
    echo "No app/build directory found"
  fi
  
  echo "apk_found=false" >> $GITHUB_OUTPUT
  exit 1
fi

echo "=== APK Build completed successfully ==="
