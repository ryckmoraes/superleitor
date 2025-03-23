
import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useVoskSetup } from "@/hooks/useVoskSetup";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { useAppUnlock } from "@/hooks/useAppUnlock";

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
  
  // Track language changes to force UI updates
  const [languageChanged, setLanguageChanged] = useState<string | null>(null);
  
  // Create a ref for the PatternDetector
  const patternDetectorRef = useRef<PatternDetectorRef>(null);
  
  // Setup the VOSK recognition
  const { isInitialized, isLoading, error, lastModelChange } = useVoskSetup();
  
  // Get the unlock status and functions from the hook
  const { isUnlocked, remainingTime, checkUnlockStatus, unlockApp } = useAppUnlock();
  
  // Monitor model changes from useVoskSetup to update UI
  useEffect(() => {
    if (lastModelChange && lastModelChange !== languageChanged) {
      console.log("Language changed detected in RecordingScreen, refreshing UI");
      setLanguageChanged(lastModelChange);
      
      // Reset any active recording or processing when language changes
      if (isRecording) {
        setIsRecording(false);
      }
      
      if (isProcessing) {
        setIsProcessing(false);
      }
    }
  }, [lastModelChange, languageChanged, isRecording, isProcessing]);
  
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

  // Show unlock status message when screen loads
  useEffect(() => {
    if (loaded) {
      // Check if app is already unlocked
      if (checkUnlockStatus() && isUnlocked && remainingTime > 0) {
        setTimeout(() => {
          showToastOnly(
            "App Desbloqueado",
            `Você ainda tem ${remainingTime} minutos de uso disponíveis.`,
            "default"
          );
          
          // Welcome back message if unlocked
          speakNaturally("Bem-vindo ao SuperLeitor! Você pode contar mais histórias ou continuar usando o app.", true);
        }, 1000);
      } else {
        // If not unlocked, prompt user to tell a story
        setTimeout(() => {
          speakNaturally("Olá! Conte-me uma história para desbloquear o SuperLeitor.", true);
        }, 1000);
      }
    }
  }, [loaded, isUnlocked, remainingTime, checkUnlockStatus]);

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
  
  // Function to handle story completion and app unlock
  const handleUnlockApp = () => {
    // Calculate earned time based on recording duration
    const earnedMinutes = Math.ceil((recordingTime || 0) / 30) * 5;
    unlockApp(recordingTime || 0);
    
    // Show confirmation
    showToastOnly(
      "App Desbloqueado",
      `O app foi desbloqueado por ${earnedMinutes} minutos!`,
      "default"
    );
    
    // Reset story states
    setStoryTranscript("");
    setInterimTranscript("");
    setIsProcessing(false);
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
  
  const { 
    toggleRecording, 
    recordingTime, 
    audioData, 
    audioBlob,
    hasStartedRecording,
    processingComplete
  } = recordingManager;

  return (
    <>
      {/* Speech initialization */}
      <SpeechInitializer />
      
      {/* Welcome message */}
      <WelcomeHandler loaded={loaded} />
      
      {/* Pattern detection - only pass audioData if recording */}
      <PatternDetector 
        ref={patternDetectorRef}
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
        hasStartedRecording={hasStartedRecording}
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
        processingComplete={processingComplete}
      />
      
      {/* Show unlock status if available */}
      {isUnlocked && remainingTime > 0 && (
        <div className="fixed top-20 right-4 bg-primary/10 py-1 px-3 rounded-full text-xs">
          Tempo restante: {remainingTime} min
        </div>
      )}
      
      {/* Hamburger menu with theme toggle - Set key to force rerender when language changes */}
      <HamburgerMenu 
        key={`hamburger-${languageChanged || 'default'}`} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
};

export default RecordingScreen;
