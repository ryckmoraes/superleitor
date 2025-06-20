
#!/bin/bash
set -e

echo "=== Preparing Gradle Environment ==="

cd android

echo "Debugging Android project structure..."
echo "Contents of android directory:"
ls -la || echo "Android directory not found"

echo "Contents of android root:"
find . -maxdepth 2 -type f -name "*gradle*" || echo "No gradle files found"

echo "Looking for gradlew:"
find . -name "gradlew" -type f || echo "gradlew not found"

echo "Checking if gradlew exists..."
if [ ! -f "./gradlew" ]; then
  echo "❌ gradlew not found, creating Gradle wrapper..."
  
  # Try to use existing gradle installation first
  if command -v gradle &> /dev/null; then
    echo "Using system gradle to create wrapper..."
    gradle wrapper --gradle-version 7.6
  else
    echo "Installing gradle wrapper manually..."
    # Download gradle wrapper files
    curl -L https://services.gradle.org/distributions/gradle-7.6-bin.zip -o gradle.zip
    unzip -q gradle.zip
    mv gradle-7.6 gradle-home
    
    # Create gradlew script
    cat > gradlew << 'EOF'
#!/bin/sh
exec "$(dirname "$0")/gradle-home/bin/gradle" "$@"
EOF
    
    chmod +x gradlew
    rm gradle.zip
  fi
  
  echo "Gradle wrapper created"
else
  echo "✅ gradlew already exists"
fi

# Make gradlew executable
echo "Making gradlew executable..."
chmod +x ./gradlew
echo "Gradle wrapper permissions set"

# Verify it's executable
if [ -x "./gradlew" ]; then
  echo "✅ gradlew is now executable"
else
  echo "❌ Failed to make gradlew executable"
  exit 1
fi
