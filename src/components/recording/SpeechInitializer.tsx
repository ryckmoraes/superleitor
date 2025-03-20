
import { useEffect, useRef, useState } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { voskModelsService } from "@/services/voskModelsService";
import { showToastOnly } from "@/services/notificationService";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  const [voskInitialized, setVoskInitialized] = useState(false);
  
  // Inicializa a síntese de fala e VOSK
  useEffect(() => {
    if (!speechInitializedRef.current) {
      // Cancela qualquer fala anterior do navegador
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      
      // Inicializa a síntese de fala do navegador
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Síntese de fala inicializada:", initialized);
      });
      
      // Certifica-se que a lista de modelos está carregada
      voskModelsService.getAvailableModels();
      
      // Inicializa o VOSK para reconhecimento de fala
      voskService.initialize().then((initialized) => {
        console.log("VOSK inicializado:", initialized);
        setVoskInitialized(initialized);
        
        const currentModel = voskModelsService.getCurrentModel();
        
        if (initialized) {
          console.log(`VOSK está disponível para reconhecimento offline - Idioma: ${currentModel?.name || 'Padrão'}`);
        } else {
          console.warn("VOSK não está totalmente funcional, usando alternativas");
          showToastOnly(
            "Informação", 
            "Reconhecimento offline não disponível. Usando serviços online.",
            "default"
          );
        }
      }).catch(error => {
        console.error("Erro ao inicializar VOSK:", error);
        setVoskInitialized(false);
        
        // Mostrar mensagem informativa apenas uma vez
        showToastOnly(
          "Informação", 
          "Reconhecimento de fala offline não disponível. Usando alternativa online.",
          "default"
        );
      });
    }
  }, []);

  return null; // Este é um componente de configuração, não visual
};

export default SpeechInitializer;
