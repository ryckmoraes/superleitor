
import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useVoskSetup } from "@/hooks/useVoskSetup";
import { showToastOnly } from "@/services/notificationService";

// Import refactored components
import RecordingMainView from "@/components/recording/RecordingMainView";
import ThemeManager from "@/components/recording/ThemeManager";
import MicrophonePermissionHandler from "@/components/recording/MicrophonePermissionHandler";
import SpeechInitializer from "@/components/recording/SpeechInitializer";
import WelcomeHandler from "@/components/recording/WelcomeHandler";
import RecordingManager from "@/components/recording/RecordingManager";
import SpeechRecognitionHandler from "@/components/recording/SpeechRecognitionHandler";
import PatternDetector, { PatternDetectorRef } from "@/components/recording/PatternDetector";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Create a ref for the PatternDetector
  const patternDetectorRef = useRef<PatternDetectorRef>(null);
  
  // Setup the VOSK recognition
  const { isInitialized, isLoading, error } = useVoskSetup();
  
  // Theme management
  const { isDarkMode, toggleTheme } = ThemeManager();
  
  // Microphone permission
  const { hasMicrophonePermission, requestMicrophonePermission } = MicrophonePermissionHandler();
  
  // Initialize speech synthesis
  const SpeechInit = SpeechInitializer();
  
  // Set loaded state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show error messages
  useEffect(() => {
    if (errorMessage) {
      showToastOnly("Erro", errorMessage, "destructive");
    }
  }, [errorMessage]);
  
  // Show VOSK initialization error
  useEffect(() => {
    if (error) {
      setErrorMessage(`Erro ao inicializar VOSK: ${error}`);
    }
  }, [error]);
  
  // Helper function to reset pattern detection
  const resetPatternDetection = () => {
    if (patternDetectorRef.current) {
      patternDetectorRef.current.resetPatternDetection();
    }
  };
  
  // Get recording methods and data
  const recordingManager = RecordingManager({
    isRecording,
    setIsRecording,
    setIsStoryMode,
    setIsProcessing,
    setStoryTranscript,
    setInterimTranscript,
    hasMicrophonePermission,
    requestMicrophonePermission,
    resetDetection: resetPatternDetection
  });
  
  const { toggleRecording, recordingTime, audioData, audioBlob } = recordingManager;

  // Função para referenciar o detector de padrões
  const setPatternDetectorRef = (detector: PatternDetectorRef | null) => {
    patternDetectorRef.current = detector;
  };

  return (
    <>
      {/* Speech initialization */}
      <SpeechInitializer />
      
      {/* Welcome message */}
      <WelcomeHandler loaded={loaded} />
      
      {/* Pattern detection - só passa audioData se estiver gravando */}
      <PatternDetector 
        ref={setPatternDetectorRef}
        audioData={isRecording ? audioData : null} 
        isRecording={isRecording} 
      />
      
      {/* Speech recognition */}
      <SpeechRecognitionHandler
        isRecording={isRecording}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        setStoryTranscript={setStoryTranscript}
        setInterimTranscript={setInterimTranscript}
        setRecognitionStatus={setRecognitionStatus}
        audioBlob={audioBlob}
        recordingTime={recordingTime}
      />
      
      {/* Main UI */}
      <RecordingMainView
        loaded={loaded}
        isDarkMode={isDarkMode}
        isRecording={isRecording}
        isProcessing={isProcessing}
        recordingTime={recordingTime}
        toggleRecording={toggleRecording}
        audioData={audioData}
        storyTranscript={storyTranscript}
        interimTranscript={interimTranscript}
        recognitionStatus={recognitionStatus}
      />
      
      {/* Hamburger menu with theme toggle */}
      <HamburgerMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
    </>
  );
};

export default RecordingScreen;
