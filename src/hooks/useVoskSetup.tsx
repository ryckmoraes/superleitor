
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';
import { showToastOnly } from '@/services/notificationService';

export const useVoskSetup = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModelChange, setLastModelChange] = useState<string | null>(null);
  
  // Watch for model changes
  useEffect(() => {
    const checkModelChanges = () => {
      const modelChangedAt = localStorage.getItem('vosk_model_changed_at');
      if (modelChangedAt && modelChangedAt !== lastModelChange) {
        console.log("Language model change detected in useVoskSetup:", modelChangedAt, "vs", lastModelChange);
        setLastModelChange(modelChangedAt);
        // Force reinitialization on model change
        setIsInitialized(false);
        setIsLoading(true);
      }
    };
    
    // Initial check
    checkModelChanges();
    
    // Setup interval to check for changes
    const interval = setInterval(checkModelChanges, 1000);
    
    return () => clearInterval(interval);
  }, [lastModelChange]);
  
  // Initialize VOSK when component loads or when model changes
  useEffect(() => {
    const setupVosk = async () => {
      if (isInitialized && !lastModelChange) return;
      
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
          showToastOnly(
            "Reconhecimento de fala", 
            "Reconhecimento offline está pronto para uso",
            "default"
          );
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
  }, [lastModelChange, isInitialized]);
  
  return {
    isInitialized,
    isLoading,
    error,
    isVoskWorking: voskService.isVoskWorking(),
    lastModelChange
  };
};
