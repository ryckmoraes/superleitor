import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.superleitor.app',
  appName: 'Superleitor',
  webDir: 'dist',
  loggingEnabled: true,
  server: {
    url: "",
    cleartext: true,
    androidScheme: "https"
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#00000000",
    buildOptions: {
      keystorePath: null,
      keystorePassword: null,
      keystoreAlias: null,
      keystoreAliasPassword: null,
      releaseType: 'APK',
      applicationId: 'com.superleitor.app',
      versionName: '1.0.0',
      versionCode: 1,
      outputFileName: 'superleitor_01.apk'
    }
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true,
      splashFullScreen: true,
      splashImmersive: true,
      backgroundColor: "#00000000",
      spinnerColor: "#7BCB32",
      androidScaleType: "CENTER_CROP",
      spinnerStyle: "large"
    }
  }
};

export default config;

