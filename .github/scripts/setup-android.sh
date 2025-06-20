
#!/bin/bash
set -e

echo "=== Setting up Android Environment ==="

# Verify Capacitor config
echo "Checking Capacitor configuration..."
if [ -f "capacitor.config.ts" ]; then
  echo "✅ capacitor.config.ts found"
  echo "Config contents:"
  cat capacitor.config.ts
else
  echo "❌ capacitor.config.ts missing"
  exit 1
fi

# Check Android platform
echo "Checking if Android platform exists..."
if [ -d "android" ]; then
  echo "✅ Android platform already exists"
  echo "platform_exists=true" >> $GITHUB_OUTPUT
else
  echo "❌ Android platform does not exist"
  echo "platform_exists=false" >> $GITHUB_OUTPUT
fi
