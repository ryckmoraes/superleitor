import { useEffect, useRef, useState } from "react";
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
  language: string;
  t: (key: string, values?: Record<string, string | number>) => string;
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
  resetDetection,
  language,
  t,
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
  const [processingComplete, setProcessingComplete] = useState(false);

  // Adiciona um efeito para resetar o estado quando necessário
  useEffect(() => {
    if (processingComplete) {
      const timer = setTimeout(() => {
        setProcessingComplete(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [processingComplete]);
  
  // Toggle recording with improved audio feedback
  const toggleRecording = () => {
    if (isRecording) {
      console.log("Stopping recording session");
      stopRecording();
      
      webSpeechService.stopRecognition();
      
      const stopMessage = t('recordingManager.analyzingStory');
      
      showToastOnly(
        t('recordingManager.storyReceived'),
        t('recordingManager.recordingFinished', { time: Math.floor(recordingTime) })
      );
      
      if (hasStartedRecording) {
        setTimeout(() => {
          speakNaturally(stopMessage, language, true);
        }, 300);
        
        setIsProcessing(true);
        
        setTimeout(() => {
          setIsProcessing(false);
          setProcessingComplete(true);
        }, 5000);
      } else {
        showToastOnly(
          t('recordingManager.noStoryDetected'),
          t('recordingManager.noStoryDetectedDescription')
        );
        
        setTimeout(() => {
          speakNaturally(t('recordingManager.tryAgain'), language, true);
        }, 300);
        
        setIsProcessing(false);
      }
      
      setIsRecording(false);
    } else {
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      console.log("Starting new recording session");
      
      setStoryTranscript("");
      setInterimTranscript("");
      resetDetection();
      
      startRecording();
      setIsStoryMode(true);
      
      const startMessage = t('recordingManager.listening');
      
      showToastOnly(
        t('recordingManager.storyModeActive'),
        t('recordingManager.storyModeActiveDescription')
      );
      
      if (!welcomeSpokenRef.current) {
        welcomeSpokenRef.current = true;
        
        setTimeout(() => {
          speakNaturally(startMessage, language, true);
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
    hasStartedRecording,
    processingComplete
  };
};

export default RecordingManager;
