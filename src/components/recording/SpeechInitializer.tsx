import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { voskModelsService } from "@/services/voskModelsService";
import { showToastOnly } from "@/services/notificationService";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

const SpeechInitializer = () => {
  const { modelId, language } = useLanguage();
  const { t } = useTranslations();
  const initializedModelIdRef = useRef<string | null>(null);
  
  // Initialize speech synthesis and show toast for VOSK status
  useEffect(() => {
    const initializeSpeech = async () => {
      // Only run if modelId is available and has changed
      if (!modelId || initializedModelIdRef.current === modelId) {
        return;
      }
      console.log(`[SpeechInitializer] Model changed to ${modelId}. Initializing speech services...`);
      
      // Cancel any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Initialize browser speech synthesis voices
      await initVoices();
      initializedModelIdRef.current = modelId; // Mark as initialized for this model
      console.log("[SpeechInitializer] Browser voices initialized.");
      
      // VOSK itself is initialized via useVoskSetup hook.
      // This component just shows a toast notification about the current language.
      const isVoskReady = voskService.isVoskWorking();
      const currentModel = voskModelsService.getCurrentModel();
      
      if (isVoskReady && currentModel && currentModel.id === modelId) {
        const languageName = getLanguageName(language);
        showToastOnly(
          t('speechInitializer.title'), 
          t('speechInitializer.ready', { languageName }),
          "default"
        );
      } else if (!isVoskReady) {
        showToastOnly(
          t('speechInitializer.info'), 
          t('speechInitializer.offlineNotAvailable'),
          "default"
        );
      }
    };
    
    initializeSpeech();
  }, [modelId, language, t]);

  // Helper function to get language name
  const getLanguageName = (language: string): string => {
    if (!language) return 'Desconhecido';
    const langCode = language.split('-')[0];
    switch (langCode) {
      case 'pt': return 'Português';
      case 'en': return 'Inglês';
      case 'es': return 'Espanhol';
      case 'fr': return 'Francês';
      case 'de': return 'Alemão';
      case 'it': return 'Italiano';
      case 'ru': return 'Russo';
      case 'zh': return 'Chinês';
      case 'ja': return 'Japonês';
      default: return 'Desconhecido';
    }
  };

  return null; // This is a setup component, not visual
};

export default SpeechInitializer;
