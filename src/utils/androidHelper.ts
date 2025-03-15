
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
    // Import required plugins
    const { Permissions } = await import('@capacitor/core');
    
    // Check current permission status
    const { state } = await Permissions.query({
      name: 'microphone'
    });
    
    if (state === 'granted') {
      return true;
    }
    
    if (state === 'denied' && !isAndroid()) {
      return false; // On iOS, can't request again if denied
    }
    
    // Request permissions
    const result = await Permissions.request({
      name: 'microphone'
    });
    
    return result.state === 'granted';
  } catch (error) {
    console.error('Error requesting microphone permission:', error);
    return false;
  }
};

/**
 * Alternative method to request Android permissions
 * This is called from App.tsx
 */
export const requestAndroidPermissions = async (): Promise<boolean> => {
  return requestMicrophonePermission();
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
  if (!isCapacitorApp()) return;
  
  try {
    const { App } = await import('@capacitor/core');
    
    App.addListener('backButton', (event) => {
      event.preventDefault();
      if (callback) callback();
    });
  } catch (error) {
    console.error('Error setting back button handler:', error);
  }
};

/**
 * Blocks back button navigation 
 * This is called from App.tsx
 */
export const blockBackNavigation = async (callback?: () => void): Promise<void> => {
  return preventBackButton(callback);
};

/**
 * Sets the app to immersive mode (Android only)
 */
export const setImmersiveMode = async (): Promise<void> => {
  if (!isCapacitorApp() || !isAndroid()) return;
  
  try {
    // Using plugin API if available
    const { StatusBar } = await import('@capacitor/core');
    await StatusBar.hide();

    // Additional settings for complete immersive mode
    if (Capacitor.isPluginAvailable('CapacitorAndroid')) {
      const { CapacitorAndroid } = Capacitor.Plugins;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (CapacitorAndroid as any).setNavigationBarVisible({ isVisible: false });
    }
  } catch (error) {
    console.error('Error setting immersive mode:', error);
  }
};

/**
 * Enter fullscreen mode for the app
 * This is called from App.tsx and RecordingScreen.tsx
 */
export const enterFullscreenMode = async (): Promise<void> => {
  if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
    try {
      await document.documentElement.requestFullscreen();
      console.log("Entered fullscreen mode");
      
      // Also try native immersive mode if on Android
      if (isAndroid() && isCapacitorApp()) {
        await setImmersiveMode();
      }
    } catch (error) {
      console.error("Error entering fullscreen:", error);
    }
  }
  
  // Also set immersive mode on Android
  if (isAndroid() && isCapacitorApp()) {
    await setImmersiveMode();
  }
};

/**
 * Creates a full task lock to prevent user from leaving the app
 */
export const enableKioskMode = async (): Promise<void> => {
  if (!isCapacitorApp() || !isAndroid()) return;
  
  try {
    // Use startLockTask if available through a plugin
    if (Capacitor.isPluginAvailable('CapacitorAndroid')) {
      const { CapacitorAndroid } = Capacitor.Plugins;
      // Note: This requires device owner or profile owner status
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((CapacitorAndroid as any).startLockTask) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (CapacitorAndroid as any).startLockTask();
      }
    }
  } catch (error) {
    console.error('Error enabling kiosk mode:', error);
  }
};

/**
 * Prevents app from being minimized
 * This is called from App.tsx
 */
export const preventMinimize = async (): Promise<void> => {
  // Use kiosk mode to prevent minimizing on Android
  if (isAndroid() && isCapacitorApp()) {
    await enableKioskMode();
  }
  
  // For web, this would be handled by the fullscreen approach
  // Add web-specific code here if needed
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
      // Set to portrait
      await ScreenOrientation.orientation({ type: 'portrait' });
      // No lock method in newer versions, orientation setting is enough
    }
  } catch (error) {
    console.error('Error locking screen orientation:', error);
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
        // @ts-ignore - wakeLock API might not be typed yet
        const wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen wake lock activated');
        
        // Release wake lock when page visibility changes
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible' && wakeLock) {
            // @ts-ignore
            navigator.wakeLock.request('screen');
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
    if (Capacitor.isPluginAvailable('ScreenKeepOn')) {
      const { ScreenKeepOn } = Capacitor.Plugins;
      // @ts-ignore - plugin might not be typed
      await ScreenKeepOn.keepOn();
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
      // Check if speech synthesis is available
      if ('speechSynthesis' in window) {
        // Check if voices are loaded
        if (speechSynthesis.getVoices().length > 0) {
          resolve(true);
        } else {
          // Wait for voices to be loaded
          speechSynthesis.onvoiceschanged = () => {
            resolve(speechSynthesis.getVoices().length > 0);
          };
          
          // Timeout after 3 seconds
          setTimeout(() => resolve(false), 3000);
        }
      } else {
        resolve(false);
      }
    });
  }
  
  // For Android native implementation
  try {
    if (Capacitor.isPluginAvailable('TextToSpeech')) {
      const { TextToSpeech } = Capacitor.Plugins;
      
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
      
      return true;
    }
  } catch (error) {
    console.error('Error checking TTS capabilities:', error);
  }
  
  return false;
};

/**
 * Initialize all Android-specific settings
 */
export const initializeAndroid = async (): Promise<void> => {
  if (!isCapacitorApp()) return;
  
  try {
    await setImmersiveMode();
    await lockPortraitOrientation();
    await preventBackButton(() => {
      console.log('Back button pressed, but action prevented');
      // Show a toast or dialog instead of exiting
    });
    await requestMicrophonePermission();
    await keepScreenOn();
    // Enable kiosk mode if needed - uncomment the line below
    // await enableKioskMode();
  } catch (error) {
    console.error('Error initializing Android settings:', error);
  }
};
