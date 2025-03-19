
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
    audioBlob
  } = useAudioAnalyzer();
  
  const hasAudioDataRef = useRef(false);

  // Track audio data presence to only start timer when audio is detected
  useEffect(() => {
    if (audioData && audioData.length > 0) {
      // Check if there's actual audio data (not just silence)
      const hasSignificantAudio = Array.from(audioData).some(val => val > 20);
      
      if (hasSignificantAudio && !hasAudioDataRef.current && isRecording) {
        hasAudioDataRef.current = true;
        console.log("Significant audio detected, starting timer");
      }
    }
  }, [audioData, isRecording]);

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
      
      // Ensure the message is spoken
      setTimeout(() => {
        speakNaturally(stopMessage, true);
      }, 300);
      
      // Process the story
      setIsProcessing(true);
      
      // Reset audio data detection flag
      hasAudioDataRef.current = false;
      
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
      
      // Reset audio detection flag
      hasAudioDataRef.current = false;
      
      const startMessage = "Estou ouvindo! Pode contar sua história...";
      
      // Show toast
      showToastOnly(
        "Modo História Ativado",
        "Conte sua história para a Esfera Sonora!"
      );
      
      // Ensure the message is spoken
      setTimeout(() => {
        speakNaturally(startMessage, true);
      }, 300);
      
      setIsRecording(true);
    }
  };

  return {
    toggleRecording,
    recordingTime: hasAudioDataRef.current ? recordingTime : 0, // Only show time if audio detected
    audioData,
    audioBlob
  };
};

export default RecordingManager;
