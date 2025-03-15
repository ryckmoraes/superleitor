
import { Capacitor } from '@capacitor/core';

/**
 * Helper function to check if we're running on Android
 * @returns boolean indicating if the app is running on Android
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === 'android';
};

/**
 * Helper function to check if we're running in a Capacitor environment
 * @returns boolean indicating if the app is in a Capacitor environment
 */
export const isCapacitorApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Request microphone permission on Android
 * @returns Promise<boolean> whether the permission was granted
 */
export const requestMicrophonePermission = async (): Promise<boolean> => {
  if (!isCapacitorApp()) {
    return true; // In web, assume permission or let browser handle it
  }
  
  try {
    // Importar os plugins necessários de forma dinâmica para evitar erros
    const { Permissions } = await import('@capacitor/core');
    
    // Verificar o status atual da permissão
    const { state } = await Permissions.query({
      name: 'microphone'
    });
    
    if (state === 'granted') {
      console.log("Permissão de microfone já concedida");
      return true;
    }
    
    if (state === 'denied' && !isAndroid()) {
      console.log("Permissão negada e não estamos no Android");
      return false; // No iOS, não pode solicitar novamente se negado
    }
    
    console.log("Solicitando permissão de microfone explicitamente");
    // Solicitar permissão de forma explícita
    const result = await Permissions.request({
      name: 'microphone'
    });
    
    console.log("Resultado da solicitação de permissão:", result.state);
    return result.state === 'granted';
  } catch (error) {
    console.error('Erro ao solicitar permissão de microfone:', error);
    return false;
  }
};

/**
 * Alternative method to request Android permissions
 * This is called from App.tsx
 */
export const requestAndroidPermissions = async (): Promise<boolean> => {
  if (!isCapacitorApp() || !isAndroid()) {
    return true;
  }
  
  try {
    console.log("Solicitando permissões Android usando método alternativo");
    // Tentar abordagem mais direta
    const { App } = await import('@capacitor/core');
    const { AndroidPermissions } = await import('@capacitor/core');
    
    // Verificar se o plugin está disponível
    if (Capacitor.isPluginAvailable('AndroidPermissions')) {
      console.log("Plugin AndroidPermissions está disponível");
      
      // Verificar e solicitar permissão do microfone
      const checkResult = await (AndroidPermissions as any).checkPermission({
        permission: 'android.permission.RECORD_AUDIO'
      });
      
      if (!checkResult.hasPermission) {
        console.log("Não tem permissão, solicitando...");
        const requestResult = await (AndroidPermissions as any).requestPermissions({
          permissions: ['android.permission.RECORD_AUDIO']
        });
        
        return requestResult.hasPermission;
      } else {
        console.log("Já tem permissão de microfone");
        return true;
      }
    } else {
      console.log("Plugin AndroidPermissions não disponível, usando método padrão");
      return requestMicrophonePermission();
    }
  } catch (error) {
    console.error("Erro ao solicitar permissões Android:", error);
    return requestMicrophonePermission();
  }
};

/**
 * Exits the application (Android only)
 */
export const exitApp = async (): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    const { App } = await import('@capacitor/core');
    App.exitApp();
  } catch (error) {
    console.error('Error exiting app:', error);
  }
};

/**
 * Prevents the app from being closed with back button (Android only)
 * @param callback Optional callback to execute when back button is pressed
 */
export const preventBackButton = async (callback?: () => void): Promise<void> => {
  if (!isCapacitorApp() || !isAndroid()) return;
  
  try {
    const { App } = await import('@capacitor/core');
    console.log("Configurando tratamento do botão voltar no Android");
    
    App.addListener('backButton', (event) => {
      console.log("Botão voltar pressionado, prevenindo ação padrão");
      event.preventDefault();
      
      // Mostrar toast para notificar o usuário
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50); // Feedback tátil leve
      }
      
      if (callback) {
        callback();
      }
    });
    
    console.log("Tratamento do botão voltar configurado com sucesso");
  } catch (error) {
    console.error('Erro ao configurar tratamento do botão voltar:', error);
  }
};

/**
 * Blocks back button navigation 
 * This is called from App.tsx
 */
export const blockBackNavigation = async (callback?: () => void): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    console.log("Bloqueando navegação do botão voltar...");
    await preventBackButton(() => {
      console.log("Botão voltar bloqueado");
      
      // Mostrar mensagem ao usuário
      if (callback) {
        callback();
      } else {
        // Mostrar alert simples se não houver callback
        if (typeof window !== 'undefined') {
          window.alert("Use o menu para sair do aplicativo");
        }
      }
    });
    
    console.log("Navegação do botão voltar bloqueada com sucesso");
  } catch (error) {
    console.error("Erro ao bloquear navegação do botão voltar:", error);
  }
};

/**
 * Sets the app to immersive mode (Android only)
 */
export const setImmersiveMode = async (): Promise<void> => {
  if (!isCapacitorApp() || !isAndroid()) return;
  
  try {
    console.log("Configurando modo imersivo");
    // Using plugin API if available
    const { StatusBar } = await import('@capacitor/core');
    await StatusBar.hide();
    console.log("Status bar oculta");

    // Additional settings for complete immersive mode
    if (Capacitor.isPluginAvailable('CapacitorAndroid')) {
      const { CapacitorAndroid } = Capacitor.Plugins;
      console.log("Ocultando barra de navegação");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (CapacitorAndroid as any).setNavigationBarVisible({ isVisible: false });
    }
    
    console.log("Modo imersivo configurado com sucesso");
  } catch (error) {
    console.error('Erro ao configurar modo imersivo:', error);
  }
};

/**
 * Enter fullscreen mode for the app
 * This is called from App.tsx and RecordingScreen.tsx
 */
export const enterFullscreenMode = async (): Promise<void> => {
  try {
    console.log("Tentando entrar no modo tela cheia");
    
    // Primeiro tentar o modo tela cheia nativo do Android
    if (isAndroid() && isCapacitorApp()) {
      await setImmersiveMode();
      console.log("Modo imersivo configurado para Android");
    }
    
    // Em seguida, tentar o modo tela cheia do navegador
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      console.log("Modo tela cheia do navegador ativado");
    }
  } catch (error) {
    console.error("Erro ao entrar no modo tela cheia:", error);
  }
};

/**
 * Creates a full task lock to prevent user from leaving the app
 */
export const enableKioskMode = async (): Promise<void> => {
  if (!isCapacitorApp() || !isAndroid()) return;
  
  try {
    console.log("Tentando ativar modo quiosque");
    // Use startLockTask if available through a plugin
    if (Capacitor.isPluginAvailable('CapacitorAndroid')) {
      const { CapacitorAndroid } = Capacitor.Plugins;
      // Note: This requires device owner or profile owner status
      console.log("Verificando suporte para lockTask");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((CapacitorAndroid as any).startLockTask) {
        console.log("Iniciando lockTask");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (CapacitorAndroid as any).startLockTask();
        console.log("LockTask iniciado com sucesso");
      } else {
        console.log("LockTask não está disponível neste dispositivo");
      }
    } else {
      console.log("Plugin CapacitorAndroid não disponível");
    }
  } catch (error) {
    console.error('Erro ao ativar modo quiosque:', error);
  }
};

/**
 * Prevents app from being minimized
 * This is called from App.tsx
 */
export const preventMinimize = async (): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    console.log("Configurando prevenção de minimização");
    
    // Use kiosk mode to prevent minimizing on Android
    if (isAndroid()) {
      console.log("Tentando ativar modo quiosque para evitar minimização");
      await enableKioskMode();
    }
    
    // Também bloqueie a navegação do botão voltar
    await blockBackNavigation(() => {
      console.log("Prevenção de minimização: botão voltar bloqueado");
    });
    
    console.log("Prevenção de minimização configurada");
  } catch (error) {
    console.error("Erro ao prevenir minimização:", error);
  }
};

/**
 * Set screen orientation to portrait and lock it (Android only)
 */
export const lockPortraitOrientation = async (): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    // Use screen orientation API if available
    if (Capacitor.isPluginAvailable('ScreenOrientation')) {
      const { ScreenOrientation } = Capacitor.Plugins;
      console.log("Bloqueando orientação para retrato");
      // Set to portrait
      await ScreenOrientation.orientation({ type: 'portrait' });
      console.log("Orientação bloqueada em retrato");
    } else {
      console.log("Plugin ScreenOrientation não disponível");
    }
  } catch (error) {
    console.error('Erro ao bloquear orientação da tela:', error);
  }
};

/**
 * Keep device screen on (prevent display sleep)
 * This is called from App.tsx and RecordingScreen.tsx
 */
export const keepScreenOn = async (): Promise<void> => {
  if (!isCapacitorApp()) {
    // For web, use the Screen Wake Lock API if available
    try {
      if ('wakeLock' in navigator) {
        console.log("Tentando ativar wakeLock na web");
        // @ts-ignore - wakeLock API might not be typed yet
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen wake lock activated');
        
        // Release wake lock when page visibility changes
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            // @ts-ignore
            navigator.wakeLock.request('screen').then(() => {
              console.log("WakeLock reativado após mudança de visibilidade");
            });
          }
        });
      }
    } catch (err) {
      console.error('Error keeping screen on (web):', err);
    }
    
    return;
  }
  
  // For native platforms
  try {
    console.log("Tentando manter tela ligada no Android");
    if (Capacitor.isPluginAvailable('ScreenKeepOn')) {
      const { ScreenKeepOn } = Capacitor.Plugins;
      console.log("Plugin ScreenKeepOn disponível, ativando");
      // @ts-ignore - plugin might not be typed
      await ScreenKeepOn.keepOn();
      console.log("Tela configurada para ficar sempre ligada");
    } else {
      console.warn('ScreenKeepOn plugin not available');
    }
  } catch (error) {
    console.error('Error keeping screen on (native):', error);
  }
};

/**
 * Check and initialize Text-to-Speech functionality 
 * This is called from RecordingScreen.tsx
 */
export const checkAndInitTTS = async (): Promise<boolean> => {
  // For web
  if (!isCapacitorApp()) {
    return new Promise((resolve) => {
      console.log("Verificando suporte a síntese de voz na web");
      // Check if speech synthesis is available
      if ('speechSynthesis' in window) {
        console.log("SpeechSynthesis disponível, verificando vozes");
        // Check if voices are loaded
        if (speechSynthesis.getVoices().length > 0) {
          console.log("Vozes carregadas: " + speechSynthesis.getVoices().length);
          resolve(true);
        } else {
          console.log("Esperando vozes carregarem...");
          // Wait for voices to be loaded
          speechSynthesis.onvoiceschanged = () => {
            console.log("Vozes carregadas após evento: " + speechSynthesis.getVoices().length);
            resolve(speechSynthesis.getVoices().length > 0);
          };
          
          // Timeout after 3 seconds
          setTimeout(() => {
            console.log("Timeout ao esperar vozes, verificando novamente");
            resolve(speechSynthesis.getVoices().length > 0);
          }, 3000);
        }
      } else {
        console.log("SpeechSynthesis não disponível neste navegador");
        resolve(false);
      }
    });
  }
  
  // For Android native implementation
  try {
    console.log("Verificando suporte a TTS no Android");
    if (Capacitor.isPluginAvailable('TextToSpeech')) {
      const { TextToSpeech } = Capacitor.Plugins;
      console.log("Plugin TextToSpeech disponível, testando");
      
      // Test TTS with a simple utterance
      // @ts-ignore - plugin might not be typed
      await TextToSpeech.speak({
        text: 'Teste de inicialização',
        lang: 'pt-BR',
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      });
      
      console.log("Teste de TTS concluído com sucesso");
      return true;
    } else {
      console.log("Plugin TextToSpeech não disponível");
    }
  } catch (error) {
    console.error('Erro ao verificar capacidades de TTS:', error);
  }
  
  return false;
};

/**
 * Initialize all Android-specific settings
 */
export const initializeAndroid = async (): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    console.log("Inicializando configurações para Android");
    await setImmersiveMode();
    await lockPortraitOrientation();
    await preventBackButton(() => {
      console.log('Botão voltar pressionado, mas ação prevenida');
      // Mostrar uma mensagem em vez de sair
      if (typeof window !== 'undefined') {
        window.alert('Use o menu para sair do aplicativo.');
      }
    });
    await requestMicrophonePermission();
    await keepScreenOn();
    
    // Habilitar modo quiosque se necessário
    await enableKioskMode();
    
    console.log("Inicialização do Android concluída com sucesso");
  } catch (error) {
    console.error('Erro ao inicializar configurações do Android:', error);
  }
};
