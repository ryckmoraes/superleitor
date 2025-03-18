
import { useEffect, useRef } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";
import { elevenLabsService } from "@/services/elevenlabs";

interface SpeechRecognitionHandlerProps {
  isRecording: boolean;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  setStoryTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  setRecognitionStatus: (status: string) => void;
  audioBlob: Blob | null;
}

const SpeechRecognitionHandler = ({
  isRecording,
  isProcessing,
  setIsProcessing,
  setStoryTranscript,
  setInterimTranscript,
  setRecognitionStatus,
  audioBlob
}: SpeechRecognitionHandlerProps) => {
  const lastTranscriptRef = useRef("");
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Process transcript from speech recognition
  const handleRecognitionResult = (result: { transcript: string, isFinal: boolean }) => {
    if (isProcessingRef.current) return; // Evita processar durante análise
    
    const cleanTranscript = result.transcript.trim();
    
    if (result.isFinal) {
      setStoryTranscript(cleanTranscript);
      setInterimTranscript("");
      lastTranscriptRef.current = cleanTranscript;
    } else {
      setInterimTranscript(cleanTranscript);
    }
  };
  
  // Handle errors from speech recognition
  const handleRecognitionError = (error: string, technical?: string) => {
    console.error("Speech recognition error:", error, technical);
    setRecognitionStatus(error);
    
    // Only show toast for serious errors
    if (error.includes("Permissão") || error.includes("acesso ao microfone")) {
      showToastOnly("Erro de Reconhecimento", error, "destructive");
    }
  };
  
  // Handle when speech recognition ends
  const handleRecognitionEnd = () => {
    // Update status but don't display it prominently
    setRecognitionStatus("Finalizando reconhecimento...");
    
    // Only respond if there's meaningful transcript and we have an audio blob
    if (lastTranscriptRef.current && lastTranscriptRef.current.length > 5) {
      setIsProcessing(true);
      isProcessingRef.current = true;
      
      // Apenas um feedback simples de que recebemos a história
      const quickResponse = "Analisando sua história...";
      showToastOnly("Recebido!", quickResponse);
      
      // Se tivermos um audio blob, processamos com ElevenLabs
      if (audioBlob && audioBlob.size > 1000 && elevenLabsService.hasApiKey()) {
        console.log("Processando áudio com ElevenLabs, tamanho:", audioBlob.size);
        
        // Define um timeout de segurança para garantir que o processamento termine
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (isProcessingRef.current) {
            console.log("Tempo de processamento excedido, mostrando resposta alternativa");
            setIsProcessing(false);
            isProcessingRef.current = false;
            const fallbackResponse = "Adorei sua história! Continue contando mais!";
            showToastOnly("Análise completa!", fallbackResponse);
            speakNaturally(fallbackResponse, true);
          }
        }, 15000); // 15 segundos de timeout
        
        // Processamento com ElevenLabs
        elevenLabsService.analyzeAudio(audioBlob)
          .then(response => {
            // Limpa o timeout pois recebemos uma resposta
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
            
            console.log("Resposta do ElevenLabs:", response);
            
            if (response) {
              // Atualiza o transcript com a resposta do ElevenLabs
              setStoryTranscript(response);
              
              // Exibe como toast
              showToastOnly("Análise completa!", response);
              
              // Fala a resposta do ElevenLabs
              speakNaturally(response, true);
            }
          })
          .catch(error => {
            console.error("Erro ao processar com ElevenLabs:", error);
            // Em caso de erro, ainda mostramos alguma resposta
            const errorResponse = "Sua história é fascinante! Pode me contar mais?";
            showToastOnly("Hmm...", errorResponse);
            speakNaturally(errorResponse, true);
          })
          .finally(() => {
            setIsProcessing(false);
            isProcessingRef.current = false;
            
            // Limpa o timeout se ainda estiver ativo
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
          });
      } else {
        // Finaliza o processamento após um tempo se não houver audio blob ou chave API
        console.log("Usando resposta local (sem chave API ElevenLabs ou sem blob de áudio)");
        setTimeout(() => {
          setIsProcessing(false);
          isProcessingRef.current = false;
          const simpleResponse = "Que história legal! Conte-me mais!";
          showToastOnly("Análise simples", simpleResponse);
          speakNaturally(simpleResponse, true);
        }, 2000);
      }
    } else {
      setIsProcessing(false);
      isProcessingRef.current = false;
    }
  };
  
  // Handle speech recognition start
  const handleRecognitionStart = () => {
    setRecognitionStatus("Ouvindo...");
  };

  // Set up speech recognition handlers
  useEffect(() => {
    if (isRecording) {
      if (webSpeechService.isSupported()) {
        webSpeechService.startRecognition(
          handleRecognitionResult,
          handleRecognitionEnd,
          handleRecognitionError,
          handleRecognitionStart
        );
      } else {
        setRecognitionStatus("Reconhecimento de fala não disponível");
        showToastOnly(
          "Aviso",
          "Reconhecimento de fala não está disponível neste dispositivo.",
          "destructive"
        );
      }
    } else {
      webSpeechService.stopRecognition();
    }
    
    return () => {
      webSpeechService.stopRecognition();
    };
  }, [isRecording]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  return null; // This is a behavior component, not a visual one
};

export default SpeechRecognitionHandler;
