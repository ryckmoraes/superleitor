
import { useEffect, useRef } from "react";
import { processRecognitionResult, generateSimpleResponse, speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";
import { elevenLabsService } from "@/services/elevenLabsService";

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

  // Process transcript from speech recognition
  const handleRecognitionResult = (result: { transcript: string, isFinal: boolean }) => {
    const cleanTranscript = processRecognitionResult(result.transcript);
    
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
      
      // First a quick local response
      const quickResponse = generateSimpleResponse(lastTranscriptRef.current);
      showToastOnly("Sua história é incrível!", quickResponse);
      
      // Speak the quick response
      setTimeout(() => {
        speakNaturally(quickResponse, true);
      }, 300);
      
      // If we have an audio blob, process with ElevenLabs for more complex response
      if (audioBlob && audioBlob.size > 1000) {
        console.log("Processing audio with ElevenLabs, size:", audioBlob.size);
        
        // Show feedback during processing
        setTimeout(() => {
          showToastOnly("Analisando", "Estou analisando sua história com mais detalhes...");
        }, 3000);
        
        // CRITICAL FIX: Set a strict timeout to ensure we finish processing
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (isProcessing) {
            console.log("Processing timeout reached, showing fallback response");
            setIsProcessing(false);
            const fallbackResponse = "Adorei sua história! Continue contando mais!";
            showToastOnly("Análise completa!", fallbackResponse);
            speakNaturally(fallbackResponse, true);
          }
        }, 10000); // Shorter 10 second timeout
        
        // Process the audio with ElevenLabs
        elevenLabsService.analyzeAudio(audioBlob)
          .then(response => {
            // Clear the timeout since we got a response
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
            
            console.log("ElevenLabs response:", response);
            
            if (response) {
              // Update the transcript with the ElevenLabs response
              setStoryTranscript(response);
              
              // Show as toast
              showToastOnly("Análise completa!", response);
              
              // Speak the ElevenLabs response
              setTimeout(() => {
                speakNaturally(response, true);
              }, 500);
            }
          })
          .catch(error => {
            console.error("Error processing with ElevenLabs:", error);
            // In case of error, still show some response
            const errorResponse = "Sua história é fascinante! Pode me contar mais?";
            showToastOnly("Hmm...", errorResponse);
            speakNaturally(errorResponse, true);
          })
          .finally(() => {
            setIsProcessing(false);
            
            // Clear the timeout if it's still active
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
          });
      } else {
        // Finish processing after a time if there's no audio blob
        setTimeout(() => {
          setIsProcessing(false);
          speakNaturally("Que história legal! Conte-me mais!", true);
        }, 2000);
      }
    } else {
      setIsProcessing(false);
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
