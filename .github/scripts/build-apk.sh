
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
set +e  # Temporarily disable exit on error to capture build output
./gradlew assembleDebug \
  --stacktrace \
  --info \
  --no-daemon \
  --warning-mode none \
  --no-build-cache \
  --gradle-user-home ~/.gradle > build.log 2>&1

BUILD_EXIT_CODE=$?
set -e  # Re-enable exit on error

echo "Build exit code: $BUILD_EXIT_CODE"

if [ $BUILD_EXIT_CODE -ne 0 ]; then
  echo "❌ APK build failed with exit code $BUILD_EXIT_CODE"
  echo "=== BUILD ERROR DETAILS ==="
  
  # Show the entire build log if it's not too large
  if [ -f "build.log" ]; then
    LOG_SIZE=$(wc -l < build.log)
    echo "Build log has $LOG_SIZE lines"
    
    if [ $LOG_SIZE -lt 200 ]; then
      echo "=== Complete build log ==="
      cat build.log
    else
      echo "=== Last 100 lines of build output ==="
      tail -100 build.log
      echo ""
      echo "=== First 50 lines of build output ==="
      head -50 build.log
    fi
    
    echo ""
    echo "=== Searching for specific errors ==="
    grep -i "error\|failed\|exception" build.log | tail -20 || echo "No obvious errors found in grep"
    
    echo ""
    echo "=== Checking for compilation issues ==="
    grep -i "compilation\|cannot find symbol\|package does not exist" build.log | tail -10 || echo "No compilation issues found"
    
    echo ""
    echo "=== Checking for resource issues ==="
    grep -i "resource\|aapt\|manifest" build.log | tail -10 || echo "No resource issues found"
    
    echo ""
    echo "=== Checking for dependency issues ==="
    grep -i "resolve\|dependency\|could not find" build.log | tail -10 || echo "No dependency issues found"
  else
    echo "No build.log file found"
  fi
  
  # Show build directory structure
  echo ""
  echo "=== Build directory structure ==="
  if [ -d "app/build" ]; then
    echo "Build directory exists"
    find app/build -type f -name "*.log" -exec echo "Found log: {}" \; -exec tail -5 {} \; 2>/dev/null || echo "No additional log files found"
    
    echo ""
    echo "=== Build outputs directory structure ==="
    if [ -d "app/build/outputs" ]; then
      find app/build/outputs -type f 2>/dev/null | head -20 || echo "No files in outputs directory"
    else
      echo "No outputs directory found"
    fi
  else
    echo "No app/build directory found"
  fi
  
  # Show system resources
  echo ""
  echo "=== System resources ==="
  free -h || echo "Could not get memory info"
  df -h . || echo "Could not get disk info"
  
  exit 1
fi

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
