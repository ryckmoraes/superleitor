
import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  
  // Inicializa a síntese de fala (sem teste de áudio)
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
      
      // Inicializa o VOSK para reconhecimento de fala
      voskService.initialize().then((initialized) => {
        console.log("VOSK inicializado:", initialized);
      }).catch(error => {
        console.error("Erro ao inicializar VOSK:", error);
      });
    }
  }, []);

  return null; // Este é um componente de configuração, não visual
};

export default SpeechInitializer;
