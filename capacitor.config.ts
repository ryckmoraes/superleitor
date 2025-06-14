
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.superleitor.app',
  appName: 'Superleitor',
  webDir: 'dist',
  server: {
    url: "", // Deixe vazio para funcionar no app instalado sem depender do servidor externo
    cleartext: true,
    androidScheme: "https"
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: "#00000000", // Fundo transparente
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
      backgroundColor: "#00000000", // Completamente transparente
      spinnerColor: "#7BCB32", // Verde primário
      androidScaleType: "CENTER_CROP",
      spinnerStyle: "large"
    }
  }
};

export default config;

