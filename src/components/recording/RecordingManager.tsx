
import { useEffect, useRef } from "react";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";

interface RecordingManagerProps {
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  setIsStoryMode: (isStoryMode: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  setStoryTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  hasMicrophonePermission: boolean;
  requestMicrophonePermission: () => Promise<void>;
  resetDetection: () => void;
}

const RecordingManager = ({
  isRecording,
  setIsRecording,
  setIsStoryMode,
  setIsProcessing,
  setStoryTranscript,
  setInterimTranscript,
  hasMicrophonePermission,
  requestMicrophonePermission,
  resetDetection
}: RecordingManagerProps) => {
  const { 
    startRecording, 
    stopRecording,
    recordingTime,
    audioData,
    audioBlob,
    hasStartedRecording
  } = useAudioAnalyzer();
  
  // Track when initial welcome message has been spoken
  const welcomeSpokenRef = useRef(false);

  // Toggle recording with improved audio feedback
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      
      // Stop speech recognition
      webSpeechService.stopRecognition();
      
      const stopMessage = `Legal! Vou analisar sua história...`;
      
      // Show toast only
      showToastOnly(
        "História recebida!",
        `Gravação finalizada após ${Math.floor(recordingTime)} segundos.`
      );
      
      // Ensure the message is spoken only if we actually recorded something
      if (hasStartedRecording) {
        setTimeout(() => {
          speakNaturally(stopMessage, true);
        }, 300);
        
        // Process the story
        setIsProcessing(true);
      } else {
        // If no actual recording happened
        showToastOnly(
          "Nenhuma história detectada",
          "Não consegui ouvir sua história. Tente novamente falando mais alto."
        );
        
        setTimeout(() => {
          speakNaturally("Não consegui ouvir sua história. Vamos tentar novamente?", true);
        }, 300);
        
        // Don't process anything
        setIsProcessing(false);
      }
      
      setIsRecording(false);
    } else {
      // Check for microphone permission before starting
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      // Clear previous state
      setStoryTranscript("");
      setInterimTranscript("");
      resetDetection(); // Reset pattern detection
      
      // Start recording
      startRecording();
      setIsStoryMode(true);
      
      const startMessage = "Estou ouvindo! Pode contar sua história...";
      
      // Show toast
      showToastOnly(
        "Modo História Ativado",
        "Conte sua história para a Esfera Sonora!"
      );
      
      // Only speak the welcome message if it hasn't been spoken already this session
      if (!welcomeSpokenRef.current) {
        welcomeSpokenRef.current = true;
        
        // Ensure the message is spoken
        setTimeout(() => {
          speakNaturally(startMessage, true);
        }, 300);
      }
      
      setIsRecording(true);
    }
  };

  return {
    toggleRecording,
    recordingTime: hasStartedRecording ? recordingTime : 0, // Only show time if audio detected
    audioData,
    audioBlob,
    hasStartedRecording
  };
};

export default RecordingManager;
