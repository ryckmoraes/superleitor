
import { useState, useEffect, useRef } from "react";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { exitApp } from "@/utils/androidHelper";
import { useVoskSetup } from "@/hooks/useVoskSetup";
import { useAppUnlock } from "@/hooks/useAppUnlock";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

export const useRecordingState = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  
  const { language } = useLanguage();
  const { t } = useTranslations();
  const { error: voskError } = useVoskSetup();
  const { isUnlocked, remainingTime, checkUnlockStatus, unlockApp } = useAppUnlock();

  // Initialize loaded state
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle welcome messages
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

  // Handle error messages
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

  const handleUnlockApp = (customTime?: number, recordingTime?: number) => {
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
  };

  return {
    // State
    loaded,
    isStoryMode,
    storyTranscript,
    interimTranscript,
    recognitionStatus,
    isRecording,
    isProcessing,
    errorMessage,
    analysisResult,
    isUnlocked,
    remainingTime,
    language,
    t,

    // Setters
    setIsStoryMode,
    setStoryTranscript,
    setInterimTranscript,
    setIsRecording,
    setIsProcessing,

    // Handlers
    handleAnalysisResult,
    handleSetRecognitionStatus,
    handleUnlockApp,
    handleContinueStory,
  };
};
