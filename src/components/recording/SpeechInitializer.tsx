
import { useEffect, useRef, useState } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { voskModelsService } from "@/services/voskModelsService";
import { showToastOnly } from "@/services/notificationService";
import { Progress } from "@/components/ui/progress";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  const [voskInitialized, setVoskInitialized] = useState(false);
  const [lastModelChange, setLastModelChange] = useState<string | null>(null);
  const [initProgress, setInitProgress] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Monitor for model changes
  useEffect(() => {
    // Check for model changes
    const checkModelChanges = () => {
      const modelChangedAt = localStorage.getItem('vosk_model_changed_at');
      if (modelChangedAt && modelChangedAt !== lastModelChange) {
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
        setInitProgress(10);
        
        // Cancela qualquer fala anterior do navegador
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        
        setInitProgress(20);
        
        // Inicializa a síntese de fala do navegador
        const initialized = await initVoices();
        speechInitializedRef.current = initialized;
        console.log("Síntese de fala inicializada:", initialized);
        
        setInitProgress(40);
        
        // Certifica-se que a lista de modelos está carregada
        voskModelsService.getAvailableModels();
        
        setInitProgress(60);
        
        // Inicializa o VOSK para reconhecimento de fala
        try {
          const currentModel = voskModelsService.getCurrentModel();
          console.log("Inicializando VOSK com modelo:", currentModel?.name);
          
          setInitProgress(80);
          
          const initialized = await voskService.initialize();
          console.log("VOSK inicializado:", initialized);
          setVoskInitialized(initialized);
          
          setInitProgress(100);
          
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
          
          // Mostrar mensagem informativa apenas uma vez
          showToastOnly(
            "Informação", 
            "Reconhecimento de fala offline não disponível. Usando alternativa online.",
            "default"
          );
        } finally {
          setIsInitializing(false);
        }
      }
    };
    
    initializeSpeech();
  }, [lastModelChange]);

  // Mostra um componente visual temporário durante a inicialização
  if (isInitializing) {
    return (
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-background/95 border border-border p-3 rounded-lg shadow-lg w-64">
          <div className="text-sm font-medium mb-2">Carregando idioma...</div>
          <Progress value={initProgress} className="h-2" />
        </div>
      </div>
    );
  }

  return null; // Este é um componente de configuração, não visual quando não está inicializando
};

export default SpeechInitializer;
