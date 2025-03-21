
import { useEffect, useRef, useState } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { voskModelsService } from "@/services/voskModelsService";
import { showToastOnly } from "@/services/notificationService";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  const [voskInitialized, setVoskInitialized] = useState(false);
  const [lastModelChange, setLastModelChange] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Monitor for model changes
  useEffect(() => {
    // Check for model changes
    const checkModelChanges = () => {
      const modelChangedAt = localStorage.getItem('vosk_model_changed_at');
      if (modelChangedAt && modelChangedAt !== lastModelChange) {
        console.log("Model change detected at:", modelChangedAt);
        setLastModelChange(modelChangedAt);
        speechInitializedRef.current = false; // Force reinitialization
        setIsInitializing(true);
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
        setIsInitializing(true);
        
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
            const languageName = language === 'pt-BR' ? 'Português (Brasil)' :
                                language === 'en-US' ? 'English (US)' :
                                language === 'es-ES' ? 'Español' :
                                language === 'fr-FR' ? 'Français' :
                                language === 'de-DE' ? 'Deutsch' :
                                language === 'it-IT' ? 'Italiano' :
                                language === 'ru-RU' ? 'Русский' :
                                language === 'zh-CN' ? '中文' :
                                language === 'ja-JP' ? '日本語' : 'Desconhecido';
                                
            console.log(`VOSK está disponível para reconhecimento offline - Idioma: ${languageName}`);
            
            // Mostrar mensagem informativa sobre o idioma carregado
            if (lastModelChange) {
              showToastOnly(
                "Idioma carregado", 
                `Reconhecimento de fala configurado para: ${languageName}`,
                "default"
              );
            }
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
          
          showToastOnly(
            "Informação", 
            "Reconhecimento de fala offline não disponível. Usando alternativa online.",
            "default"
          );
        } finally {
          // Adicionando um pequeno atraso antes de esconder o indicador de progresso
          setTimeout(() => {
            setIsInitializing(false);
          }, 1500);
        }
      }
    };
    
    initializeSpeech();
  }, [lastModelChange]);

  // O componente não renderiza mais a barra de progresso na tela principal
  return null;
};

export default SpeechInitializer;
