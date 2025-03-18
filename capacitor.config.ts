
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.esferasonora',
  appName: 'Superleitor',
  webDir: 'dist',
  server: {
    url: "https://61c9c85a-521b-4753-a60e-0cdb64c7b0cc.lovableproject.com?forceHideBadge=true",
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
      releaseType: 'APK'
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
