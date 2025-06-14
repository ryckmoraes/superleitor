
import { useState, useEffect } from 'react';
import { voskService } from '@/services/voskService';
import { voskModelsService } from '@/services/voskModelsService';
import { showToastOnly } from '@/services/notificationService';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

export const useVoskSetup = () => {
  const { modelId } = useLanguage();
  const { t } = useTranslations();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize VOSK when component loads or when model changes
  useEffect(() => {
    const setupVosk = async () => {
      if (!modelId) {
        console.log("[useVoskSetup] No modelId provided yet, skipping setup.");
        return;
      }

      // Check if already initialized with the correct model to avoid unnecessary re-initialization
      if (isInitialized && modelId === voskService.getCurrentModelId()) {
        console.log("[useVoskSetup] Already initialized with current model.");
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        console.log(`[useVoskSetup] Initializing VOSK service for model: ${modelId}`);
        // forceReinitialize will use the model from localStorage, which is set by LanguageContext
        const initialized = await voskService.forceReinitialize();
        
        console.log("[useVoskSetup] VOSK initialized:", initialized);
        setIsInitialized(initialized);
        
        if (initialized) {
          console.log("[useVoskSetup] VOSK is ready.");
          const currentModel = voskModelsService.getCurrentModel();
          // Verify that the initialized model is the one we want
          if (currentModel && currentModel.id === modelId) {
            showToastOnly(
              t('voskSetup.modelUpdatedTitle', {}, "Modelo atualizado"),
              t('voskSetup.modelUpdatedDescription', { name: currentModel.name }, `Reconhecimento configurado para ${currentModel.name}`),
              "default"
            );
          }
        } else {
          console.warn("[useVoskSetup] VOSK initialized but is not fully functional.");
          setError("VOSK not fully functional");
        }
      } catch (err) {
        console.error("[useVoskSetup] Error initializing VOSK:", err);
        setError(err instanceof Error ? err.message : String(err));
        
        if (!localStorage.getItem('voskErrorShown')) {
          showToastOnly(
            t('voskSetup.offlineRecognitionTitle', {}, "Reconhecimento offline"),
            t('voskSetup.offlineRecognitionDescription', {}, "Usando serviços online para reconhecimento de fala."),
            "default"
          );
          localStorage.setItem('voskErrorShown', 'true');
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    setupVosk();
    
  }, [modelId, isInitialized, t]);
  
  return {
    isInitialized,
    isLoading,
    error,
    isVoskWorking: voskService.isVoskWorking(),
    currentModelId: modelId
  };
};
