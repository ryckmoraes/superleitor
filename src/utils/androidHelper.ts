/**
 * Utility functions for Android-specific behaviors
 */

// Interface for Capacitor on the window object
interface CapacitorWindow extends Window {
  Capacitor?: {
    isNativePlatform: () => boolean;
    Plugins?: {
      Permissions?: {
        query: (options: { name: string }) => Promise<{ state: string }>;
        request: (options: { name: string }) => Promise<{ state: string }>;
      };
      SplashScreen?: {
        hide: () => Promise<void>;
      };
      App?: {
        exitApp: () => Promise<void>;
      };
      StatusBar?: {
        setStyle: (options: { style: string }) => Promise<void>;
        hide: () => Promise<void>;
      };
    };
  };
}

// Check if running on Android
export const isAndroid = (): boolean => {
  return /Android/i.test(navigator.userAgent);
};

// Keep screen on (prevents Android device from sleeping)
export const keepScreenOn = async (): Promise<boolean> => {
  try {
    if ('wakeLock' in navigator) {
      // @ts-ignore - TypeScript doesn't know about wakeLock API yet
      const wakeLock = await navigator.wakeLock.request('screen');
      console.log('Wake Lock active');
      
      // Release on page visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // @ts-ignore
          navigator.wakeLock.request('screen');
        }
      });
      
      return true;
    } else {
      console.log('Wake Lock API not supported');
      return false;
    }
  } catch (err) {
    console.error('Erro ao manter tela ligada:', err);
    return false;
  }
};

// Request permissions needed for Android audio app
export const requestAndroidPermissions = async (): Promise<boolean> => {
  console.log("Iniciando solicitação de permissões Android...");
  
  try {
    // Cast window to include Capacitor
    const capacitorWindow = window as CapacitorWindow;
    
    // Check if running in Capacitor (Android native)
    if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.isNativePlatform()) {
      console.log("Executando em plataforma nativa Capacitor");
      
      const Permissions = capacitorWindow.Capacitor.Plugins?.Permissions;
      
      if (Permissions) {
        try {
          console.log("Verificando status da permissão do microfone...");
          
          // Check microphone permission status first
          const micStatus = await Permissions.query({ name: 'microphone' });
          console.log("Status atual da permissão do microfone:", micStatus.state);
          
          if (micStatus.state !== 'granted') {
            console.log("Solicitando permissão do microfone...");
            const result = await Permissions.request({ name: 'microphone' });
            console.log("Resultado da solicitação:", result.state);
            
            if (result.state !== 'granted') {
              console.warn('Permissão do microfone não foi concedida');
              return false;
            }
          }
          
          console.log("✅ Permissões Android concedidas com sucesso");
          return true;
          
        } catch (permError) {
          console.error("Erro nas permissões do Capacitor:", permError);
          
          // Fallback: tentar getUserMedia como teste
          console.log("Tentando fallback com getUserMedia...");
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log("Fallback getUserMedia bem-sucedido");
            return true;
          }
        }
      } else {
        console.log("Plugin Permissions não disponível no Capacitor");
      }
    } else {
      console.log("Não executando em plataforma nativa, usando API web");
    }
    
    // Fallback for browser or when Capacitor permissions fail
    console.log("Usando fallback para browser...");
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log("Stream de áudio obtida via getUserMedia");
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Track parada:", track.kind);
      });
      
      return true;
    }
    
    console.warn("getUserMedia não disponível");
    return false;
    
  } catch (err) {
    console.error('Erro ao solicitar permissões Android:', err);
    
    if (err instanceof Error) {
      if (err.name === 'NotAllowedError') {
        console.error("Usuário negou a permissão");
      } else if (err.name === 'NotFoundError') {
        console.error("Dispositivo de áudio não encontrado");
      }
    }
    
    return false;
  }
};

// Hide system UI (immersive mode)
export const hideSystemUI = async (): Promise<void> => {
  try {
    const capacitorWindow = window as CapacitorWindow;
    
    if (capacitorWindow.Capacitor?.isNativePlatform()) {
      // Hide status bar if available
      if (capacitorWindow.Capacitor.Plugins?.StatusBar) {
        await capacitorWindow.Capacitor.Plugins.StatusBar.hide();
      }
    }
    
    // Add fullscreen class to body if not already present
    if (!document.body.classList.contains('fullscreen')) {
      document.body.classList.add('fullscreen');
    }
  } catch (error) {
    console.error('Error hiding system UI:', error);
  }
};

// Exit the Android app properly
export const exitApp = async (): Promise<void> => {
  try {
    const capacitorWindow = window as CapacitorWindow;
    
    if (capacitorWindow.Capacitor?.isNativePlatform() && 
        capacitorWindow.Capacitor.Plugins?.App?.exitApp) {
      // Save any state before exiting
      localStorage.setItem('app_exited', 'true');
      
      // Exit the app
      await capacitorWindow.Capacitor.Plugins.App.exitApp();
    }
  } catch (error) {
    console.error('Error exiting app:', error);
  }
};
