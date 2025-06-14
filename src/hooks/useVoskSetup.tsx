
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';
import { voskModelsService } from '@/services/voskModelsService';
import { showToastOnly } from '@/services/notificationService';

export const useVoskSetup = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastModelId, setLastModelId] = useState<string | null>(null);
  
  // Watch for model changes
  useEffect(() => {
    const checkModelChanges = () => {
      const currentModel = voskModelsService.getCurrentModel();
      const currentModelId = currentModel?.id;
      
      if (currentModelId && currentModelId !== lastModelId) {
        console.log("[useVoskSetup] Mudança de modelo detectada:", {
          anterior: lastModelId,
          atual: currentModelId
        });
        setLastModelId(currentModelId);
        // Force reinitialization on model change
        setIsInitialized(false);
        setIsLoading(true);
      }
    };
    
    // Initial check
    checkModelChanges();
    
    // Setup interval to check for changes less frequently to avoid conflicts
    const interval = setInterval(checkModelChanges, 3000);
    
    return () => clearInterval(interval);
  }, [lastModelId]);
  
  // Initialize VOSK when component loads or when model changes
  useEffect(() => {
    const setupVosk = async () => {
      if (isInitialized && lastModelId === voskService.getCurrentModelId()) {
        return; // Already initialized with current model
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log("[useVoskSetup] Iniciando configuração do serviço VOSK...");
        const initialized = await voskService.forceReinitialize();
        
        console.log("[useVoskSetup] VOSK inicializado com sucesso:", initialized);
        setIsInitialized(initialized);
        
        if (initialized) {
          console.log("[useVoskSetup] VOSK está pronto para uso");
          const currentModel = voskModelsService.getCurrentModel();
          if (currentModel) {
            showToastOnly(
              "Modelo atualizado", 
              `Reconhecimento configurado para ${currentModel.name}`,
              "default"
            );
          }
        } else {
          console.warn("[useVoskSetup] VOSK inicializado mas não está totalmente funcional");
          setError("VOSK inicializado parcialmente");
        }
      } catch (err) {
        console.error("[useVoskSetup] Erro ao inicializar VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        
        if (!localStorage.getItem('voskErrorShown')) {
          showToastOnly(
            "Reconhecimento offline", 
            "Usando serviços online para reconhecimento de fala.",
            "default"
          );
          localStorage.setItem('voskErrorShown', 'true');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    setupVosk();
    
    return () => {
      console.log("[useVoskSetup] Limpando recursos do VOSK");
      // Don't cleanup on unmount, let the service manage its lifecycle
    };
  }, [lastModelId, isInitialized]);
  
  return {
    isInitialized,
    isLoading,
    error,
    isVoskWorking: voskService.isVoskWorking(),
    currentModelId: lastModelId
  };
};
