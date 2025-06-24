
import { useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { speakNaturally } from "@/services/audioProcessor";

// Import refactored components
import RecordingMainView from "@/components/recording/RecordingMainView";
import ThemeManager from "@/components/recording/ThemeManager";
import MicrophonePermissionHandler from "@/components/recording/MicrophonePermissionHandler";
import SpeechInitializer from "@/components/recording/SpeechInitializer";
import WelcomeHandler from "@/components/recording/WelcomeHandler";
import RecordingManager from "@/components/recording/RecordingManager";
import SpeechRecognitionHandler from "@/components/recording/SpeechRecognitionHandler";
import PatternDetector, { PatternDetectorRef } from "@/components/recording/PatternDetector";
import { useRecordingState } from "./RecordingStateManager";

const RecordingScreenContainer = () => {
  const patternDetectorRef = useRef<PatternDetectorRef>(null);
  
  const {
    loaded,
    isStoryMode,
    storyTranscript,
    interimTranscript,
    recognitionStatus,
    isRecording,
    isProcessing,
    analysisResult,
    isUnlocked,
    remainingTime,
    language,
    t,
    setIsStoryMode,
    setStoryTranscript,
    setInterimTranscript,
    setIsRecording,
    setIsProcessing,
    handleAnalysisResult,
    handleSetRecognitionStatus,
    handleUnlockApp,
    handleContinueStory,
  } = useRecordingState();

  const { isDarkMode, toggleTheme } = ThemeManager();
  const { hasMicrophonePermission, requestMicrophonePermission, permissionChecked } = MicrophonePermissionHandler();
  
  const resetPatternDetection = () => {
    if (patternDetectorRef.current) {
      patternDetectorRef.current.resetPatternDetection();
    }
  };
  
  const handleContinueStoryWithSpeech = () => {
    handleContinueStory();
    
    setTimeout(() => {
      if (language) {
        speakNaturally(t('recordingScreen.tellMore'), language, true);
      }
      toggleRecording();
    }, 500);
  };
  
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
    language: language || 'pt-BR',
    t,
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
      <SpeechInitializer />
      <WelcomeHandler loaded={loaded} />
      
      {/* Permission status messages */}
      {!permissionChecked && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p className="text-yellow-800">Verificando permissões do sistema...</p>
        </div>
      )}
      
      {permissionChecked && !hasMicrophonePermission && (
        <div className="fixed top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
          <p className="text-red-800 font-medium">Permissão do microfone necessária</p>
          <p className="text-red-600 mt-1">Toque no botão de gravação para solicitar acesso.</p>
        </div>
      )}
      
      <PatternDetector 
        ref={patternDetectorRef}
        audioData={isRecording ? audioData : null} 
        isRecording={isRecording} 
      />
      
      <SpeechRecognitionHandler
        isRecording={isRecording}
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        setStoryTranscript={setStoryTranscript}
        setInterimTranscript={setInterimTranscript}
        setRecognitionStatus={handleSetRecognitionStatus}
        audioBlob={audioBlob}
        recordingTime={recordingTime}
        hasStartedRecording={hasStartedRecording}
        onAnalysisResult={handleAnalysisResult}
        language={language || 'pt-BR'}
      />
      
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
        onContinue={handleContinueStoryWithSpeech}
        onUnlock={(customTime?: number) => handleUnlockApp(customTime, recordingTime)}
        analysisResult={analysisResult}
        t={t}
      />
      
      {isUnlocked && remainingTime > 0 && (
        <div className="fixed top-20 right-4 bg-primary/10 py-1 px-3 rounded-full text-xs">
          {t('recordingScreen.remainingTimeLabel')}: {remainingTime} min
        </div>
      )}
      
      <HamburgerMenu 
        key={`hamburger-${language || 'default'}`} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
      />
    </>
  );
};

export default RecordingScreenContainer;
