
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
        const initialized = await voskService.initialize();
        setIsInitialized(initialized);
        setIsLoading(false);
      } catch (err) {
        console.error("Erro ao inicializar VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        setIsLoading(false);
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
