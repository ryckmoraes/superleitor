
import { useEffect, useRef, useState } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";
import { elevenLabsService } from "@/services/elevenlabs";
import { Button } from "@/components/ui/button";
import StoryTranscript from "@/components/StoryTranscript";
import { useNavigate } from "react-router-dom";

interface SpeechRecognitionHandlerProps {
  isRecording: boolean;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  setStoryTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  setRecognitionStatus: (status: string) => void;
  audioBlob: Blob | null;
  recordingTime: number;
}

const SpeechRecognitionHandler = ({
  isRecording,
  isProcessing,
  setIsProcessing,
  setStoryTranscript,
  setInterimTranscript,
  setRecognitionStatus,
  audioBlob,
  recordingTime
}: SpeechRecognitionHandlerProps) => {
  const lastTranscriptRef = useRef("");
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const [showSummary, setShowSummary] = useState(false);
  const navigate = useNavigate();

  // Process transcript from speech recognition
  const handleRecognitionResult = (result: { transcript: string, isFinal: boolean }) => {
    if (isProcessingRef.current) return; // Avoid processing during analysis
    
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
      
      // Simple feedback that we received the story
      const quickResponse = "Analisando sua história...";
      showToastOnly("Recebido!", quickResponse);
      
      // If we have an audio blob, process with ElevenLabs
      if (audioBlob && audioBlob.size > 1000 && elevenLabsService.hasApiKey()) {
        console.log("Processando áudio com ElevenLabs, tamanho:", audioBlob.size);
        
        // Set a safety timeout to ensure processing completes
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (isProcessingRef.current) {
            console.log("Processing timeout exceeded, showing alternative response");
            setIsProcessing(false);
            isProcessingRef.current = false;
            const fallbackResponse = "Adorei sua história! Continue contando mais!";
            showToastOnly("Análise completa!", fallbackResponse);
            speakNaturally(fallbackResponse, true);
          }
        }, 15000); // 15 second timeout
        
        // Process with ElevenLabs
        elevenLabsService.analyzeAudio(audioBlob)
          .then(response => {
            // Clear the timeout since we received a response
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
            
            console.log("Response from ElevenLabs:", response);
            
            if (response) {
              // Update the transcript with the ElevenLabs response
              setStoryTranscript(response);
              
              // Display as toast
              showToastOnly("Análise completa!", response);
              
              // Speak the ElevenLabs response
              speakNaturally(response, true);
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
            isProcessingRef.current = false;
            
            // Clear the timeout if still active
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
            
            // Show summary after processing completes
            if (recordingTime > 5) {
              setTimeout(() => {
                setShowSummary(true);
              }, 7000);
            }
          });
      } else {
        // Finalize processing after a time if no audio blob or API key
        console.log("Using local response (no ElevenLabs API key or no audio blob)");
        setTimeout(() => {
          setIsProcessing(false);
          isProcessingRef.current = false;
          const simpleResponse = "Que história legal! Conte-me mais!";
          showToastOnly("Análise simples", simpleResponse);
          speakNaturally(simpleResponse, true);
          
          // Show summary after processing completes
          if (recordingTime > 5) {
            setTimeout(() => {
              setShowSummary(true);
            }, 7000);
          }
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

  // Handle continue button
  const handleContinue = () => {
    setShowSummary(false);
    setStoryTranscript("");
    setInterimTranscript("");
    
    // Restart recording
    setTimeout(() => {
      const startMessage = "Vamos continuar a história! Estou ouvindo...";
      speakNaturally(startMessage, true);
    }, 500);
  };
  
  // Handle exit button
  const handleExit = () => {
    setShowSummary(false);
    navigate("/");
  };

  // Render the summary component if needed
  if (showSummary && !isRecording && !isProcessing) {
    return (
      <StoryTranscript
        storyTranscript={lastTranscriptRef.current}
        isProcessing={false}
        recordingTime={recordingTime}
        onContinue={handleContinue}
        onExit={handleExit}
      />
    );
  }

  return null; // This is normally a behavior component, not a visual one
};

export default SpeechRecognitionHandler;
