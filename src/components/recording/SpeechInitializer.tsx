
import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";
import { elevenLabsService } from "@/services/elevenlabs";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  
  // Inicializa a síntese de fala (sem teste de áudio)
  useEffect(() => {
    if (!speechInitializedRef.current) {
      // Inicializa a síntese de fala do navegador
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Síntese de fala inicializada:", initialized);
      });
      
      // Verifica se a chave API do ElevenLabs está configurada
      if (!elevenLabsService.hasApiKey()) {
        console.log("Nenhuma chave API ElevenLabs definida - recursos de voz usarão fallback");
      } else {
        console.log("Chave API ElevenLabs configurada:", elevenLabsService.getApiKey()?.substring(0, 3) + "...");
        console.log("Usando agent ID:", elevenLabsService.getAgentId());
      }
      
      // Limpeza de qualquer fala pendente
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, []);

  return null; // Este é um componente de configuração, não visual
};

export default SpeechInitializer;
