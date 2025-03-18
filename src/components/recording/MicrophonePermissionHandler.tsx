
import { useEffect, useState } from "react";
import { isAndroid, requestAndroidPermissions, keepScreenOn } from "@/utils/androidHelper";
import { showToastOnly } from "@/services/notificationService";

const MicrophonePermissionHandler = () => {
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);

  // Check microphone permissions
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (isAndroid()) {
          const granted = await requestAndroidPermissions();
          setHasMicrophonePermission(granted);
          return;
        }
        
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasMicrophonePermission(result.state === 'granted');
        
        if (result.state !== 'granted') {
          requestMicrophonePermission();
        }
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        requestMicrophonePermission();
      }
    };
    
    checkMicrophonePermission();
    
    if (isAndroid()) {
      keepScreenOn().catch(error => {
        console.error("Error keeping screen on:", error);
      });
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      showToastOnly(
        "Permissão de Microfone",
        "Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.",
        "destructive"
      );
    }
  };

  return { hasMicrophonePermission, requestMicrophonePermission };
};

export default MicrophonePermissionHandler;
