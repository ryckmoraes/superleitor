
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
    },
    useLegacyBridge: true,
    permissions: [
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
      "android.permission.INTERNET",
      "android.permission.ACCESS_NETWORK_STATE",
      "android.permission.WAKE_LOCK",
      "android.permission.FOREGROUND_SERVICE",
      "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
      "android.permission.POST_NOTIFICATIONS"
    ],
    // Configurações adicionais para modo imersivo
    backgroundColor: "#FFFFFF",
    overrideUserAgent: null,
    alwaysShow: true,
    minSdkVersion: 22,
    targetSdkVersion: 33
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      showSpinner: true
    },
    Permissions: {
      permissions: ["android.permission.RECORD_AUDIO"]
    },
    // Forçar diálogo de permissões em tempo de execução
    CapacitorHttp: {
      enabled: true
    },
    // Melhorar TTS e reconhecimento de voz
    CapacitorVoice: {
      speechRecognition: true,
      textToSpeech: true
    }
  }
};

export default config;
