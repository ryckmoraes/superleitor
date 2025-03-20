
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';

export const useVoskSetup = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inicializa o VOSK no carregamento do componente
  useEffect(() => {
    const setupVosk = async () => {
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        console.log("Attempting to initialize VOSK service...");
        const initialized = await voskService.initialize();
        
        console.log("VOSK initialization result:", initialized);
        setIsInitialized(initialized);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao inicializar VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
        setIsInitialized(false);
      }
    };
    
    setupVosk();
  }, []);
  
  return {
    isInitialized,
    isLoading,
    error
  };
};
