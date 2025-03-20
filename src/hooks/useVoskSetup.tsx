
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';

export const useVoskSetup = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize VOSK when component loads
  useEffect(() => {
    const setupVosk = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        console.log("Iniciando configuração do serviço VOSK...");
        const initialized = await voskService.initialize();
        
        console.log("VOSK inicializado com sucesso:", initialized);
        setIsInitialized(initialized);
        
        // If initialization is successful, show feedback
        if (initialized) {
          console.log("VOSK está pronto para uso");
        } else {
          console.warn("VOSK inicializado mas não está totalmente funcional");
          setError("VOSK inicializado parcialmente");
        }
      } catch (err) {
        console.error("Erro ao inicializar VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        
        // Only notify user if this is the first time starting the app
        // to avoid annoying the user with repeated notifications
        if (!localStorage.getItem('voskErrorShown')) {
          showToastOnly(
            "Reconhecimento offline", 
            "Usando serviços online para reconhecimento de fala.",
            "default"
          );
          
          // Set a flag to avoid showing this message again
          localStorage.setItem('voskErrorShown', 'true');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    setupVosk();
    
    // Clean up resources when unmounting
    return () => {
      console.log("Limpando recursos do VOSK");
      voskService.cleanup();
    };
  }, []);
  
  return {
    isInitialized,
    isLoading,
    error,
    isVoskWorking: voskService.isVoskWorking()
  };
};
