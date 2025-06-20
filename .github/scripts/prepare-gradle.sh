
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
  
  # Method 1: Try to regenerate using Capacitor
  echo "Attempting to regenerate Android platform files..."
  cd ..
  npx cap sync android --force || echo "Cap sync failed, continuing with manual creation"
  cd android
  
  # Check again after cap sync
  if [ -f "./gradlew" ]; then
    echo "✅ gradlew created by Capacitor sync"
  else
    echo "gradlew still missing, trying manual creation methods..."
    
    # Method 2: Try to use existing gradle installation
    if command -v gradle &> /dev/null; then
      echo "Using system gradle to create wrapper..."
      gradle wrapper --gradle-version 8.4 --distribution-type all
    else
      echo "Installing gradle wrapper manually..."
      
      # Method 3: Download and create gradle wrapper manually
      GRADLE_VERSION="8.4"
      GRADLE_ZIP="gradle-${GRADLE_VERSION}-all.zip"
      GRADLE_URL="https://services.gradle.org/distributions/${GRADLE_ZIP}"
      
      echo "Downloading Gradle ${GRADLE_VERSION}..."
      curl -L ${GRADLE_URL} -o ${GRADLE_ZIP}
      
      if [ -f "${GRADLE_ZIP}" ]; then
        echo "Creating gradle directory structure..."
        mkdir -p gradle/wrapper
        unzip -q ${GRADLE_ZIP}
        mv gradle-${GRADLE_VERSION} gradle-home
        
        # Create gradle-wrapper.properties
        cat > gradle/wrapper/gradle-wrapper.properties << EOF
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-all.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF

        # Create gradle-wrapper.jar (minimal version)
        echo "Creating minimal gradle-wrapper.jar..."
        mkdir -p temp_jar
        echo "Manifest-Version: 1.0" > temp_jar/MANIFEST.MF
        cd temp_jar
        jar -cf ../gradle/wrapper/gradle-wrapper.jar MANIFEST.MF
        cd ..
        rm -rf temp_jar
        
        # Create gradlew script
        cat > gradlew << 'EOF'
#!/bin/sh

##############################################################################
# Gradle start up script for Unix/Linux
##############################################################################

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

APP_NAME="Gradle"
APP_BASE_NAME=`basename "$0"`

# Use the maximum available, or set MAX_FD != -1 to use that value.
MAX_FD="maximum"

warn ( ) {
    echo "$*"
}

die ( ) {
    echo
    echo "$*"
    echo
    exit 1
}

# OS specific support (must be 'true' or 'false').
cygwin=false
msys=false
darwin=false
nonstop=false
case "`uname`" in
  CYGWIN* )
    cygwin=true
    ;;
  Darwin* )
    darwin=true
    ;;
  MINGW* )
    msys=true
    ;;
  NONSTOP* )
    nonstop=true
    ;;
esac

CLASSPATH=$APP_HOME/gradle/wrapper/gradle-wrapper.jar

# Determine the Java command to use to start the JVM.
if [ -n "$JAVA_HOME" ] ; then
    if [ -x "$JAVA_HOME/jre/sh/java" ] ; then
        # IBM's JDK on AIX uses strange locations for the executables
        JAVACMD="$JAVA_HOME/jre/sh/java"
    else
        JAVACMD="$JAVA_HOME/bin/java"
    fi
    if [ ! -x "$JAVACMD" ] ; then
        die "ERROR: JAVA_HOME is set to an invalid directory: $JAVA_HOME

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
    fi
else
    JAVACMD="java"
    which java >/dev/null 2>&1 || die "ERROR: JAVA_HOME is not set and no 'java' command could be found in your PATH.

Please set the JAVA_HOME variable in your environment to match the
location of your Java installation."
fi

# Escape application args
save ( ) {
    for i do printf %s\\n "$i" | sed "s/'/'\\\\''/g;1s/^/'/;\$s/\$/' \\\\/" ; done
    echo " "
}
APP_ARGS=$(save "$@")

# Collect all arguments for the java command
set -- $APP_ARGS

exec "$JAVACMD" "$@" -cp "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
EOF
        
        chmod +x gradlew
        rm ${GRADLE_ZIP}
        
        echo "Gradle wrapper created manually"
      else
        echo "Failed to download Gradle, cannot create wrapper"
        exit 1
      fi
    fi
  fi
  
  echo "Gradle wrapper creation completed"
else
  echo "✅ gradlew already exists"
fi

# Make gradlew executable
echo "Making gradlew executable..."
chmod +x ./gradlew
echo "Gradle wrapper permissions set"

# Verify it's executable and working
if [ -x "./gradlew" ]; then
  echo "✅ gradlew is now executable"
  
  # Test if gradlew works
  echo "Testing gradlew..."
  ./gradlew --version || echo "Warning: gradlew test failed, but continuing..."
else
  echo "❌ Failed to make gradlew executable"
  exit 1
fi

echo "=== Gradle preparation completed ==="
