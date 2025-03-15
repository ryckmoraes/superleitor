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
      Toast?: {
        show: (options: { text: string, duration: string, position: string }) => Promise<void>;
      };
      ExitAppBlocker?: {
        confirmExit: () => Promise<void>;
      };
    };
    getPlatform: () => 'android' | 'ios' | 'web';
    isPluginAvailable: (name: string) => boolean;
  };
}

// Check if running on Android
export const isAndroid = (): boolean => {
  const capacitorWindow = window as CapacitorWindow;
  
  if (capacitorWindow.Capacitor?.getPlatform) {
    return capacitorWindow.Capacitor.getPlatform() === 'android';
  }
  
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
    console.error('Error keeping screen on:', err);
    return false;
  }
};

// Enhanced function to explicitly request Android permissions with better user feedback
export const requestAndroidPermissions = async (): Promise<boolean> => {
  try {
    // Cast window to include Capacitor
    const capacitorWindow = window as CapacitorWindow;
    
    // Force enter fullscreen mode
    await enterFullscreenMode();
    
    // If running in a native Android context
    if (isAndroid() && capacitorWindow.Capacitor?.isNativePlatform()) {
      console.log("Requesting microphone permission in native Android context");
      
      // Using Capacitor for native Android permissions
      if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.isPluginAvailable('Permissions')) {
        const Permissions = capacitorWindow.Capacitor.Plugins?.Permissions;
        const Toast = capacitorWindow.Capacitor.Plugins?.Toast;
        
        if (!Permissions) {
          console.error("Permissions plugin not available");
          return false;
        }
        
        // Check microphone permission status
        const micStatus = await Permissions.query({ name: 'microphone' });
        console.log("Current microphone permission status:", micStatus.state);
        
        if (micStatus.state !== 'granted') {
          // Show toast before requesting permission
          if (Toast) {
            await Toast.show({
              text: 'Precisamos do acesso ao microfone para o Superleitor funcionar',
              duration: 'long',
              position: 'center'
            });
          }
          
          // Request microphone permission explicitly
          const requestResult = await Permissions.request({ name: 'microphone' });
          console.log("Android microphone permission request result:", requestResult.state);
          
          // Feedback after permission request
          if (requestResult.state === 'granted') {
            if (Toast) {
              await Toast.show({
                text: 'Obrigado! Agora o Superleitor pode ouvir sua história.',
                duration: 'short',
                position: 'bottom'
              });
            }
            return true;
          } else {
            if (Toast) {
              await Toast.show({
                text: 'Sem acesso ao microfone, o Superleitor não funcionará corretamente.',
                duration: 'long',
                position: 'center'
              });
            }
            return false;
          }
        }
        
        return micStatus.state === 'granted';
      } else {
        console.error("Capacitor Permissions plugin not available");
      }
    }
    
    // If running in browser for testing or if native context fails, use browser APIs
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      console.log("Requesting microphone permission using browser API");
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Browser microphone permission granted");
        return true;
      } catch (error) {
        console.error("Browser denied microphone access:", error);
        
        // Show a browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Permissão de Microfone', {
            body: 'Por favor, permita o acesso ao microfone para que o Superleitor funcione.'
          });
        }
        
        return false;
      }
    }
    
    console.error("No permission request method available");
    return false;
  } catch (err) {
    console.error('Error requesting Android permissions:', err);
    return false;
  }
};

// Function to enter fullscreen mode
export const enterFullscreenMode = async (): Promise<boolean> => {
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      console.log("Entered fullscreen mode");
      
      // Try to lock orientation in portrait
      if (screen.orientation) {
        try {
          await screen.orientation.lock('portrait');
          console.log("Locked orientation to portrait");
        } catch (err) {
          console.warn("Could not lock orientation:", err);
        }
      }
      
      return true;
    } else {
      console.warn("Fullscreen API not supported");
      return false;
    }
  } catch (err) {
    console.error("Error entering fullscreen mode:", err);
    return false;
  }
};

// Function to block back button/gesture navigation
export const blockBackNavigation = (): void => {
  // Block browser back button
  const backButtonBlocker = (event: PopStateEvent) => {
    event.preventDefault();
    history.pushState(null, "", window.location.href);
    console.log("Back navigation blocked");
    
    // Show message to user
    const toast = (window as CapacitorWindow).Capacitor?.Plugins?.Toast;
    if (toast) {
      toast.show({
        text: 'Use o menu para sair do aplicativo',
        duration: 'short',
        position: 'bottom'
      });
    }
  };
  
  // Push current state to history to enable blocking
  history.pushState(null, "", window.location.href);
  window.addEventListener('popstate', backButtonBlocker);
  
  // Block hardware back button on Android
  document.addEventListener('backbutton', (e) => {
    e.preventDefault();
    console.log("Hardware back button blocked");
    
    // Show message to user
    const toast = (window as CapacitorWindow).Capacitor?.Plugins?.Toast;
    if (toast) {
      toast.show({
        text: 'Use o menu para sair do aplicativo',
        duration: 'short',
        position: 'bottom'
      });
    }
  }, false);
};

// Função para verificar se o Text-to-Speech está disponível e funcionando
export const checkAndInitTTS = async (): Promise<boolean> => {
  try {
    if (!('speechSynthesis' in window)) {
      console.error("Text-to-speech não suportado neste dispositivo");
      return false;
    }
    
    // Verificar se há vozes disponíveis 
    const getVoices = () => {
      return new Promise<boolean>((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        
        if (voices && voices.length > 0) {
          console.log(`TTS inicializado com ${voices.length} vozes disponíveis`);
          console.log(`Vozes em português: ${voices.filter(v => v.lang.includes('pt')).map(v => v.name).join(', ')}`);
          resolve(true);
        } else {
          // Esperar pelo evento voiceschanged
          const voicesChangedHandler = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            console.log(`TTS carregou ${availableVoices.length} vozes`);
            console.log(`Vozes em português: ${availableVoices.filter(v => v.lang.includes('pt')).map(v => v.name).join(', ')}`);
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            resolve(availableVoices.length > 0);
          };
          
          window.speechSynthesis.addEventListener('voiceschanged', voicesChangedHandler);
          
          // Timeout para garantir que não ficamos presos esperando
          setTimeout(() => {
            window.speechSynthesis.removeEventListener('voiceschanged', voicesChangedHandler);
            const finalCheck = window.speechSynthesis.getVoices();
            console.log(`TTS timeout, ${finalCheck.length} vozes disponíveis`);
            resolve(finalCheck.length > 0);
          }, 3000);
        }
      });
    };
    
    // Teste de fala para verificar se está funcionando realmente
    const testSpeech = (): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        try {
          const utterance = new SpeechSynthesisUtterance("Teste");
          utterance.lang = 'pt-BR';
          utterance.volume = 1.0;
          utterance.rate = 1.0;
          
          // Set timeout para garantir que a função não fica presa
          const timeoutId = setTimeout(() => {
            window.speechSynthesis.cancel();
            console.warn("Timeout durante teste de voz");
            resolve(false);
          }, 3000);
          
          utterance.onend = () => {
            clearTimeout(timeoutId);
            console.log("Teste de voz completado com sucesso");
            resolve(true);
          };
          
          utterance.onerror = (event) => {
            clearTimeout(timeoutId);
            console.error("Erro no teste de voz:", event);
            resolve(false);
          };
          
          window.speechSynthesis.cancel(); // Limpar qualquer fala pendente
          window.speechSynthesis.speak(utterance);
        } catch (error) {
          console.error("Erro ao executar teste de voz:", error);
          resolve(false);
        }
      });
    };
    
    // Executar verificações
    const hasVoices = await getVoices();
    if (!hasVoices) {
      console.warn("Não foram encontradas vozes para TTS");
      return false;
    }
    
    const speechWorks = await testSpeech();
    return speechWorks;
    
  } catch (error) {
    console.error("Erro ao inicializar TTS:", error);
    return false;
  }
};

// Set appropriate Android gradle properties
export const setupAndroidGradleProperties = (): void => {
  // This function would be used during build time
  // For debugging purposes, we log the configuration that should be applied
  console.log("Android gradle properties needed:");
  console.log("android.useAndroidX=true");
  console.log("android.enableJetifier=true");
};
