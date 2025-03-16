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
    console.error('Error keeping screen on:', err);
    return false;
  }
};

// Request permissions needed for Android
export const requestAndroidPermissions = async (): Promise<boolean> => {
  try {
    // Cast window to include Capacitor
    const capacitorWindow = window as CapacitorWindow;
    
    // Only if the app is running in Capacitor (Android native)
    if (capacitorWindow.Capacitor && capacitorWindow.Capacitor.isNativePlatform()) {
      const Permissions = capacitorWindow.Capacitor.Plugins?.Permissions;
      
      if (Permissions) {
        try {
          // Request microphone permission
          const micStatus = await Permissions.query({ name: 'microphone' });
          
          if (micStatus.state !== 'granted') {
            await Permissions.request({ name: 'microphone' });
          }
          
          return true;
        } catch (permError) {
          console.error("Permission error:", permError);
          // Fallback to browser permissions for testing
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
          }
        }
      }
    }
    
    // Fallback for browser
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Error requesting Android permissions:', err);
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

// Set appropriate Android gradle properties
export const setupAndroidGradleProperties = (): void => {
  // This function would be used during build time
  // For debugging purposes, we log the configuration that should be applied
  console.log("Android gradle properties needed:");
  console.log("android.useAndroidX=true");
  console.log("android.enableJetifier=true");
};
