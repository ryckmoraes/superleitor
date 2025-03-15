
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
    // Enable kiosk mode if needed - uncomment the line below
    // await enableKioskMode();
  } catch (error) {
    console.error('Error initializing Android settings:', error);
  }
};
