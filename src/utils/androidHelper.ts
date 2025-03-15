
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
    console.error('Error keeping screen on:', err);
    return false;
  }
};

// Enhanced function to explicitly request Android permissions with better user feedback
export const requestAndroidPermissions = async (): Promise<boolean> => {
  try {
    // Cast window to include Capacitor
    const capacitorWindow = window as CapacitorWindow;
    
    // If running in browser for testing, use browser APIs
    if (!isAndroid() || !capacitorWindow.Capacitor?.isNativePlatform()) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true });
          console.log("Browser microphone permission granted");
          return true;
        } catch (error) {
          console.error("Browser denied microphone access:", error);
          
          // Show a browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Permissão de Microfone', {
              body: 'Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione.'
            });
          }
          
          return false;
        }
      }
      return false;
    }
    
    // Using Capacitor for native Android permissions
    if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.Plugins?.Permissions) {
      const Permissions = capacitorWindow.Capacitor.Plugins.Permissions;
      const Toast = capacitorWindow.Capacitor.Plugins.Toast;
      
      // Check microphone permission status
      const micStatus = await Permissions.query({ name: 'microphone' });
      
      if (micStatus.state !== 'granted') {
        // Show toast before requesting permission
        if (Toast) {
          await Toast.show({
            text: 'Precisamos do acesso ao microfone para a Esfera Sonora funcionar',
            duration: 'long',
            position: 'center'
          });
        }
        
        // Request microphone permission explicitly
        const requestResult = await Permissions.request({ name: 'microphone' });
        console.log("Android microphone permission status:", requestResult.state);
        
        // Feedback after permission request
        if (requestResult.state === 'granted') {
          if (Toast) {
            await Toast.show({
              text: 'Obrigado! Agora a Esfera Sonora pode ouvir sua história.',
              duration: 'short',
              position: 'bottom'
            });
          }
          return true;
        } else {
          if (Toast) {
            await Toast.show({
              text: 'Sem acesso ao microfone, a Esfera Sonora não funcionará corretamente.',
              duration: 'long',
              position: 'center'
            });
          }
          return false;
        }
      }
      
      return micStatus.state === 'granted';
    }
    
    return false;
  } catch (err) {
    console.error('Error requesting Android permissions:', err);
    return false;
  }
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
