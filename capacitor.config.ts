import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.superleitor.app',              // Altere para seu ID de pacote
  appName: 'SuperLeitor',                    // Nome do app
  webDir: 'dist',                            // Diretório de build gerado pelo Vite
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https'
  },
  android: {
    path: 'android',                         // Caminho da pasta android (opcional, padrão é "android")
    allowMixedContent: true,                 // Caso precise acessar conteúdo HTTP em Android 9+
  },
  ios: {
    contentInset: 'always'                   // Mantém a compatibilidade com barras superiores no iOS
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0                  // Remove splash padrão se você usar personalizado
    }
  }
};

export default config;