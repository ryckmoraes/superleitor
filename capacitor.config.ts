
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.superleitor',
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
      showSpinner: true
    }
  }
};

export default config;
