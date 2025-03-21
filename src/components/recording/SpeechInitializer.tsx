
import { useEffect, useRef, useState } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { voskModelsService } from "@/services/voskModelsService";
import { showToastOnly } from "@/services/notificationService";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  const [voskInitialized, setVoskInitialized] = useState(false);
  const [lastModelChange, setLastModelChange] = useState<string | null>(null);
  
  // Monitor for model changes
  useEffect(() => {
    // Check for model changes
    const checkModelChanges = () => {
      const modelChangedAt = localStorage.getItem('vosk_model_changed_at');
      if (modelChangedAt && modelChangedAt !== lastModelChange) {
        setLastModelChange(modelChangedAt);
        speechInitializedRef.current = false; // Force reinitialization
      }
    };
    
    // Initial check
    checkModelChanges();
    
    // Setup interval to check for changes
    const interval = setInterval(checkModelChanges, 1000);
    
    return () => clearInterval(interval);
  }, [lastModelChange]);
  
  // Inicializa a síntese de fala e VOSK
  useEffect(() => {
    const initializeSpeech = async () => {
      if (!speechInitializedRef.current) {
        console.log("Iniciando inicialização de serviços de fala...");
        
        // Cancela qualquer fala anterior do navegador
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        
        // Inicializa a síntese de fala do navegador
        const initialized = await initVoices();
        speechInitializedRef.current = initialized;
        console.log("Síntese de fala inicializada:", initialized);
        
        // Certifica-se que a lista de modelos está carregada
        voskModelsService.getAvailableModels();
        
        // Inicializa o VOSK para reconhecimento de fala
        try {
          const currentModel = voskModelsService.getCurrentModel();
          console.log("Inicializando VOSK com modelo:", currentModel?.name);
          
          const initialized = await voskService.initialize();
          console.log("VOSK inicializado:", initialized);
          setVoskInitialized(initialized);
          
          if (initialized) {
            const language = currentModel?.language || 'pt-BR';
            const languageName = getLanguageName(language);
                                
            console.log(`VOSK está disponível para reconhecimento offline - Idioma: ${languageName}`);
            
            // Notify user about the active language
            showToastOnly(
              "Reconhecimento de fala", 
              `Usando reconhecimento de fala em ${languageName}`,
              "default"
            );
          } else {
            console.warn("VOSK não está totalmente funcional, usando alternativas");
            showToastOnly(
              "Informação", 
              "Reconhecimento offline não disponível. Usando serviços online.",
              "default"
            );
          }
        } catch (error) {
          console.error("Erro ao inicializar VOSK:", error);
          setVoskInitialized(false);
          
          // Mostrar mensagem informativa apenas uma vez
          showToastOnly(
            "Informação", 
            "Reconhecimento de fala offline não disponível. Usando alternativa online.",
            "default"
          );
        }
      }
    };
    
    initializeSpeech();
  }, [lastModelChange]);

  // Helper function to get language name
  const getLanguageName = (language: string): string => {
    switch (language) {
      case 'pt-BR': return 'Português (Brasil)';
      case 'en-US': return 'English (US)';
      case 'es-ES': return 'Español';
      case 'fr-FR': return 'Français';
      case 'de-DE': return 'Deutsch';
      case 'it-IT': return 'Italiano';
      case 'ru-RU': return 'Русский';
      case 'zh-CN': return '中文';
      case 'ja-JP': return '日本語';
      default: return 'Desconhecido';
    }
  };

  return null; // Este é um componente de configuração, não visual
};

export default SpeechInitializer;
