import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.esferasonora',
  appName: 'Esfera Sonora',
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
      keystorePath: 'superleitor.keystore',
      keystorePassword: 'Tnb.2022',
      keystoreAlias: 'Keystore alias',
      keystoreAliasPassword: 'Tnb.2022',
      releaseType: 'APK'
    }
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true
    }
    // Add any other necessary SDK configurations here
  }
};

export default config;
