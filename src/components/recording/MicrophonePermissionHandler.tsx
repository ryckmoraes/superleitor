
import { useEffect, useState } from "react";
import { isAndroid, requestAndroidPermissions, keepScreenOn } from "@/utils/androidHelper";
import { showToastOnly } from "@/services/notificationService";

const MicrophonePermissionHandler = () => {
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check microphone permissions
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      console.log("Verificando permissões do microfone...");
      
      try {
        if (isAndroid()) {
          console.log("Plataforma Android detectada, solicitando permissões nativas...");
          const granted = await requestAndroidPermissions();
          console.log("Permissões Android:", granted ? "concedidas" : "negadas");
          setHasMicrophonePermission(granted);
          setPermissionChecked(true);
          
          if (granted) {
            // Tentar manter a tela ligada
            keepScreenOn().catch(error => {
              console.error("Erro ao manter tela ligada:", error);
            });
          }
          return;
        }
        
        // Para browsers web, verificar permissões via API
        console.log("Plataforma web detectada, verificando permissões do browser...");
        
        // Primeiro, tentar verificar o status atual da permissão
        if ('permissions' in navigator) {
          try {
            const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
            console.log("Status da permissão do microfone:", result.state);
            
            if (result.state === 'granted') {
              setHasMicrophonePermission(true);
              setPermissionChecked(true);
              return;
            } else if (result.state === 'denied') {
              console.log("Permissão do microfone foi negada anteriormente");
              setHasMicrophonePermission(false);
              setPermissionChecked(true);
              
              showToastOnly(
                "Permissão de Microfone Negada",
                "Você negou o acesso ao microfone. Por favor, permita o acesso nas configurações do navegador.",
                "destructive"
              );
              return;
            }
          } catch (permError) {
            console.log("Erro ao verificar permissões via API:", permError);
          }
        }
        
        // Se chegou aqui, solicitar permissão diretamente
        console.log("Solicitando permissão do microfone diretamente...");
        await requestMicrophonePermission();
        
      } catch (error) {
        console.error("Erro geral ao verificar permissões:", error);
        setPermissionChecked(true);
        
        // Como fallback, tentar solicitar permissão diretamente
        await requestMicrophonePermission();
      }
    };
    
    if (!permissionChecked) {
      checkMicrophonePermission();
    }
  }, [permissionChecked]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    console.log("Solicitando acesso ao microfone...");
    
    try {
      // Solicitar acesso ao microfone
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log("Permissão do microfone concedida!");
      
      // Parar todas as tracks imediatamente após obter permissão
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("Track de áudio parada:", track.kind);
      });
      
      setHasMicrophonePermission(true);
      setPermissionChecked(true);
      
      showToastOnly(
        "Permissão Concedida",
        "Acesso ao microfone autorizado com sucesso!",
        "default"
      );
      
    } catch (error) {
      console.error("Erro ao solicitar permissão do microfone:", error);
      setHasMicrophonePermission(false);
      setPermissionChecked(true);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          showToastOnly(
            "Permissão Negada",
            "Você negou o acesso ao microfone. Por favor, recarregue a página e permita o acesso.",
            "destructive"
          );
        } else if (error.name === 'NotFoundError') {
          showToastOnly(
            "Microfone Não Encontrado",
            "Nenhum microfone foi detectado no dispositivo.",
            "destructive"
          );
        } else {
          showToastOnly(
            "Erro de Permissão",
            `Erro ao acessar microfone: ${error.message}`,
            "destructive"
          );
        }
      } else {
        showToastOnly(
          "Erro de Permissão",
          "Por favor, permita o acesso ao microfone para que o aplicativo funcione corretamente.",
          "destructive"
        );
      }
    }
  };

  return { 
    hasMicrophonePermission, 
    requestMicrophonePermission,
    permissionChecked 
  };
};

export default MicrophonePermissionHandler;
