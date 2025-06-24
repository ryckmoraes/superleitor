import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import { useVoskSetup } from "@/hooks/useVoskSetup";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
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
import { useTranslations } from "@/hooks/useTranslations";

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
  
  const patternDetectorRef = useRef<PatternDetectorRef>(null);
  
  const { language } = useLanguage();
  const { t } = useTranslations();
  
  const { error: voskError } = useVoskSetup();
  const { isUnlocked, remainingTime, checkUnlockStatus, unlockApp } = useAppUnlock();
  const { isDarkMode, toggleTheme } = ThemeManager();
  const { hasMicrophonePermission, requestMicrophonePermission, permissionChecked } = MicrophonePermissionHandler();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loaded && language) {
      if (checkUnlockStatus() && isUnlocked && remainingTime > 0) {
        setTimeout(() => {
          showToastOnly(
            t('recordingScreen.appUnlocked'),
            t('recordingScreen.remainingTime', { time: remainingTime }),
            "default"
          );
          
          const welcomeBackMessage = t('greetings.unlocked');
          speakNaturally(welcomeBackMessage, language, true);
        }, 1000);
      } else {
        setTimeout(() => {
          const greeting = t('greetings.locked');
          speakNaturally(greeting, language, true);
        }, 1000);
      }
    }
  }, [loaded, isUnlocked, remainingTime, checkUnlockStatus, language, t]);

  useEffect(() => {
    if (errorMessage) {
      showToastOnly(t('recordingScreen.error'), errorMessage, "destructive");
    }
  }, [errorMessage, t]);
  
  useEffect(() => {
    if (voskError) {
      setErrorMessage(t('recordingScreen.voskInitError', { error: voskError }));
    }
  }, [voskError, t]);

  // Add permission status logging
  useEffect(() => {
    if (permissionChecked) {
      console.log("Status das permissões verificado:", {
        hasMicrophonePermission,
        language,
        isUnlocked
      });
      
      if (!hasMicrophonePermission) {
        console.warn("⚠️ Permissão do microfone não concedida");
      }
    }
  }, [permissionChecked, hasMicrophonePermission, language, isUnlocked]);
  
  const resetPatternDetection = () => {
    if (patternDetectorRef.current) {
      patternDetectorRef.current.resetPatternDetection();
    }
  };
  
  const handleUnlockApp = (customTime?: number) => {
    const finalRecordingTime = typeof customTime === "number" ? customTime : recordingTime;
    if (!finalRecordingTime) return;

    const earnedMinutes = unlockApp(finalRecordingTime);

    showToastOnly(
      t('recordingScreen.appUnlocked'),
      t('recordingScreen.earnedTime', { time: earnedMinutes }),
      "default"
    );

    setStoryTranscript("");
    setInterimTranscript("");
    setIsProcessing(false);
    setTimeout(() => {
      exitApp();
    }, 2000);
  };
  
  const handleContinueStory = () => {
    setStoryTranscript("");
    setInterimTranscript("");
    setIsProcessing(false);
    setAnalysisResult("");
    
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
  
  const handleAnalysisResult = (result: string) => {
    const match = result.match(/Análise concluída: (.*)\. Precisão: (.*)%\. Padrão: (.*)\./);
    if (match) {
        const [, summary, accuracy, pattern] = match;
        const translatedResult = t('analysis.result', { summary, accuracy, pattern });
        setAnalysisResult(translatedResult);
    } else {
        setAnalysisResult(result);
    }
  };

  const handleSetRecognitionStatus = (status: string) => {
    if (status.startsWith("Erro: ")) {
        const errorMessage = status.replace("Erro: ", "");
        setRecognitionStatus(t('recognitionStatus.error', { error: errorMessage }));
        return;
    }
    
    let key = '';
    switch (status) {
        case "Aguardando áudio...": key = 'waiting'; break;
        case "Ouvindo...": key = 'listening'; break;
        case "Analisando...": key = 'analyzing'; break;
        case "Processando resultado final...": key = 'processing'; break;
        case "Pronto.": key = 'ready'; break;
        default: setRecognitionStatus(status); return;
    }
    setRecognitionStatus(t(`recognitionStatus.${key}`));
  };

  return (
    <>
      <SpeechInitializer />
      <WelcomeHandler loaded={loaded} />
      
      {/* Show permission status if not checked yet */}
      {!permissionChecked && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
          <p className="text-yellow-800">Verificando permissões do sistema...</p>
        </div>
      )}
      
      {/* Show permission denied message */}
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
        onContinue={handleContinueStory}
        onUnlock={handleUnlockApp}
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

export default RecordingScreen;
