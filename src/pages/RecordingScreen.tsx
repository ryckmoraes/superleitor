
import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useVoskSetup } from "@/hooks/useVoskSetup";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally, getLocalizedGreeting } from "@/services/audioProcessor";
import { useAppUnlock } from "@/hooks/useAppUnlock";
import { exitApp } from "@/utils/androidHelper";

// Import refactored components
import RecordingMainView from "@/components/recording/RecordingMainView";
import ThemeManager from "@/components/recording/ThemeManager";
import MicrophonePermissionHandler from "@/components/recording/MicrophonePermissionHandler";
import SpeechInitializer from "@/components/recording/SpeechInitializer";
import WelcomeHandler from "@/components/recording/WelcomeHandler";
import RecordingManager from "@/components/recording/RecordingManager";
import SpeechRecognitionHandler from "@/components/recording/SpeechRecognitionHandler";
import PatternDetector, { PatternDetectorRef } from "@/components/recording/PatternDetector";
import { useLanguage } from "@/contexts/LanguageContext";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  
  // Create a ref for the PatternDetector
  const patternDetectorRef = useRef<PatternDetectorRef>(null);
  
  // Get language context
  const { language } = useLanguage();
  
  // Setup the VOSK recognition
  const { error: voskError } = useVoskSetup();
  
  // Get the unlock status and functions from the hook
  const { isUnlocked, remainingTime, checkUnlockStatus, unlockApp } = useAppUnlock();
  
  // Theme management
  const { isDarkMode, toggleTheme } = ThemeManager();
  
  // Microphone permission
  const { hasMicrophonePermission, requestMicrophonePermission } = MicrophonePermissionHandler();
  
  // Set loaded state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show unlock status message when screen loads
  useEffect(() => {
    if (loaded && language) {
      // Check if app is already unlocked
      if (checkUnlockStatus() && isUnlocked && remainingTime > 0) {
        setTimeout(() => {
          showToastOnly(
            "App Desbloqueado",
            `Você ainda tem ${remainingTime} minutos de uso disponíveis.`,
            "default"
          );
          
          const greeting = getLocalizedGreeting(language);
          const unlockPart = language === 'pt-BR' ? "para desbloquear o SuperLeitor" : "to unlock SuperReader";
          const welcomeBackMessage = greeting.replace(unlockPart, "Você pode continuar usando o app");
          speakNaturally(welcomeBackMessage, language, true);
        }, 1000);
      } else {
        // If not unlocked, prompt user to tell a story - use localized greeting
        setTimeout(() => {
          const greeting = getLocalizedGreeting(language);
          speakNaturally(greeting, language, true);
        }, 1000);
      }
    }
  }, [loaded, isUnlocked, remainingTime, checkUnlockStatus, language]);

  // Show error messages
  useEffect(() => {
    if (errorMessage) {
      showToastOnly("Erro", errorMessage, "destructive");
    }
  }, [errorMessage]);
  
  // Show VOSK initialization error
  useEffect(() => {
    if (voskError) {
      setErrorMessage(`Erro ao inicializar VOSK: ${voskError}`);
    }
  }, [voskError]);
  
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
    
    // Close the app after a short delay
    setTimeout(() => {
      exitApp();
    }, 2000);
  };
  
  // Function to handle continuing the story
  const handleContinueStory = () => {
    // Reset states but keep accumulated time
    setStoryTranscript("");
    setInterimTranscript("");
    setIsProcessing(false);
    setAnalysisResult("");
    
    // Start recording again after a brief delay
    setTimeout(() => {
      if (language) {
        speakNaturally("Conte mais da sua história! Estou ouvindo...", language, true);
      }
      toggleRecording();
    }, 500);
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
    resetDetection: resetPatternDetection,
    language: language || 'pt-BR' // Pass language down with a fallback
  });
  
  const { 
    toggleRecording, 
    recordingTime, 
    audioData, 
    audioBlob,
    hasStartedRecording,
    processingComplete
  } = recordingManager;
  
  // Function to receive analysis results from SpeechRecognitionHandler
  const handleAnalysisResult = (result: string) => {
    setAnalysisResult(result);
  };

  return (
    <>
      {/* Speech initialization hook */}
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
        onAnalysisResult={handleAnalysisResult}
        language={language || 'pt-BR'} // Pass language down with a fallback
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
        onContinue={handleContinueStory}
        onUnlock={handleUnlockApp}
        analysisResult={analysisResult}
      />
      
      {/* Show unlock status if available */}
      {isUnlocked && remainingTime > 0 && (
        <div className="fixed top-20 right-4 bg-primary/10 py-1 px-3 rounded-full text-xs">
          Tempo restante: {remainingTime} min
        </div>
      )}
      
      {/* Hamburger menu with theme toggle - Set key to force rerender when language changes */}
      <HamburgerMenu 
        key={`hamburger-${language || 'default'}`} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
};

export default RecordingScreen;
