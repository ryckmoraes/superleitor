
#!/bin/bash
set -e

echo "=== Preparing Gradle Environment ==="

cd android

echo "Checking Android project structure..."
echo "Contents of android directory:"
ls -la

echo "Looking for existing gradlew..."
if [ -f "./gradlew" ]; then
  echo "✅ gradlew already exists, making it executable..."
  chmod +x ./gradlew
  
  # Test if it works
  echo "Testing existing gradlew..."
  if ./gradlew --version; then
    echo "✅ Existing gradlew works correctly"
    exit 0
  else
    echo "⚠️ Existing gradlew has issues, recreating..."
    rm -f gradlew gradlew.bat
    rm -rf gradle/wrapper
  fi
fi

echo "Creating Gradle wrapper..."

# Create gradle wrapper directory
mkdir -p gradle/wrapper

# Create gradle-wrapper.properties with Gradle 7.6.3 (compatible with AGP 7.4.2)
cat > gradle/wrapper/gradle-wrapper.properties << 'EOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-7.6.3-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF

# Download gradle-wrapper.jar
echo "Downloading gradle-wrapper.jar..."
WRAPPER_JAR_URL="https://github.com/gradle/gradle/raw/v7.6.3/gradle/wrapper/gradle-wrapper.jar"
curl -L "$WRAPPER_JAR_URL" -o gradle/wrapper/gradle-wrapper.jar

# Verify jar was downloaded
if [ ! -f "gradle/wrapper/gradle-wrapper.jar" ] || [ ! -s "gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "❌ Failed to download gradle-wrapper.jar"
  exit 1
fi

# Create gradlew script
cat > gradlew << 'EOF'
#!/bin/sh

# Resolve links: $0 may be a link
PRG="$0"
while [ -h "$PRG" ] ; do
    ls=`ls -ld "$PRG"`
    link=`expr "$ls" : '.*-> \(.*\)$'`
    if expr "$link" : '/.*' > /dev/null; then
        PRG="$link"
    else
        PRG=`dirname "$PRG"`"/$link"
    fi
done

SAVED="`pwd`"
cd "`dirname \"$PRG\"`/" >/dev/null
APP_HOME="`pwd -P`"
cd "$SAVED" >/dev/null

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        echo "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME"
        exit 1
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || {
        echo "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH."
        exit 1
    }
fi

# Execute Gradle
exec "$JAVACMD" -cp "$APP_HOME/gradle/wrapper/gradle-wrapper.jar" org.gradle.wrapper.GradleWrapperMain "$@"
EOF

# Make gradlew executable
chmod +x gradlew

echo "✅ Gradle wrapper created successfully"

# Test the wrapper
echo "Testing gradlew..."
if ./gradlew --version; then
  echo "✅ gradlew is working correctly"
else
  echo "❌ gradlew test failed"
  exit 1
fi

echo "=== Gradle preparation completed successfully ==="
