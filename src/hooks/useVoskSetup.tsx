
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';
import { showToastOnly } from '@/services/notificationService';

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
        
        console.log("Iniciando configuração do serviço VOSK...");
        const initialized = await voskService.initialize();
        
        console.log("VOSK inicializado com sucesso:", initialized);
        setIsInitialized(initialized);
        
        // Se a inicialização for bem-sucedida, mostrar feedback
        if (initialized) {
          console.log("VOSK está pronto para uso");
        } else {
          console.warn("VOSK inicializado mas não está totalmente funcional");
          setError("VOSK inicializado parcialmente");
        }
      } catch (err) {
        console.error("Erro ao inicializar VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        
        // Notificar o usuário sobre o erro
        showToastOnly(
          "Problema com reconhecimento offline", 
          "O reconhecimento de fala offline não pôde ser carregado. Utilizando serviços alternativos.",
          "destructive"
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    setupVosk();
    
    // Limpar recursos ao desmontar
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
