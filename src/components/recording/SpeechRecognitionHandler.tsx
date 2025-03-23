import { useEffect, useRef, useState } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";
import { elevenLabsService } from "@/services/elevenlabs";
import { voskService } from "@/services/voskService";
import StoryTranscript from "@/components/StoryTranscript";
import { useNavigate } from "react-router-dom";
import { calculateEarnedTime } from "@/utils/formatUtils";

interface SpeechRecognitionHandlerProps {
  isRecording: boolean;
  isProcessing: boolean;
  setIsProcessing: (isProcessing: boolean) => void;
  setStoryTranscript: (transcript: string) => void;
  setInterimTranscript: (transcript: string) => void;
  setRecognitionStatus: (status: string) => void;
  audioBlob: Blob | null;
  recordingTime: number;
  hasStartedRecording: boolean;
}

const SpeechRecognitionHandler = ({
  isRecording,
  isProcessing,
  setIsProcessing,
  setStoryTranscript,
  setInterimTranscript,
  setRecognitionStatus,
  audioBlob,
  recordingTime,
  hasStartedRecording
}: SpeechRecognitionHandlerProps) => {
  const lastTranscriptRef = useRef("");
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);
  const [showSummary, setShowSummary] = useState(false);
  const [usingVosk, setUsingVosk] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const navigate = useNavigate();

  // Verifica se o VOSK está disponível
  useEffect(() => {
    const checkVosk = () => {
      const isVoskWorking = voskService.isVoskWorking();
      setUsingVosk(isVoskWorking);
      console.log("VOSK está funcionando:", isVoskWorking);
      
      if (!isVoskWorking) {
        console.log("Usando Web Speech API como alternativa");
      }
    };
    
    checkVosk();
  }, []);

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
    if (lastTranscriptRef.current && lastTranscriptRef.current.length > 5 && hasStartedRecording) {
      setIsProcessing(true);
      isProcessingRef.current = true;
      
      // Simple feedback that we received the story
      const quickResponse = "Analisando sua história...";
      showToastOnly("Recebido!", quickResponse);
      
      // Log para debug qual serviço está sendo usado
      console.log("Processando história usando: " + 
                 (usingVosk ? "VOSK (offline)" : 
                  (elevenLabsService.hasApiKey() ? "ElevenLabs API" : "Processamento local")));
      
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
            
            // Generate analysis response
            const analysisResponse = generateStoryAnalysis(lastTranscriptRef.current);
            setAnalysisResult(analysisResponse);
            
            showToastOnly("Análise completa!", "Sua história foi analisada com sucesso.");
            speakNaturally(analysisResponse, true);
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
              // Set the analysis result for display in summary
              setAnalysisResult(response);
              
              // Display as toast
              showToastOnly("Análise completa!", "Sua história foi analisada com sucesso.");
              
              // Speak the ElevenLabs response
              speakNaturally(response, true);
            }
          })
          .catch(error => {
            console.error("Error processing with ElevenLabs:", error);
            
            // Generate a fallback analysis
            const analysisResponse = generateStoryAnalysis(lastTranscriptRef.current);
            setAnalysisResult(analysisResponse);
            
            // In case of error, still show some response
            showToastOnly("Análise da história", "Sua história foi analisada localmente.");
            speakNaturally(analysisResponse, true);
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
            if (recordingTime > 3) {
              setTimeout(() => {
                setShowSummary(true);
              }, 4000);
            }
          });
      } else {
        // Finalize processing after a time if no audio blob or API key
        console.log("Using local response (no ElevenLabs API key or no audio blob)");
        setTimeout(() => {
          // Generate a detailed analysis
          const analysisResponse = generateStoryAnalysis(lastTranscriptRef.current);
          setAnalysisResult(analysisResponse);
          
          setIsProcessing(false);
          isProcessingRef.current = false;
          
          showToastOnly("Análise da história", "Sua história foi analisada com sucesso.");
          speakNaturally(analysisResponse, true);
          
          // Show summary after processing completes
          if (recordingTime > 3) {
            setTimeout(() => {
              setShowSummary(true);
            }, 5000);
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
    } else if (!isRecording && lastTranscriptRef.current) {
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

  // Calculate earned time based on recording duration
  const getEarnedTime = (seconds: number): number => {
    return calculateEarnedTime(seconds);
  };

  // Generate story analysis based on transcript
  const generateStoryAnalysis = (transcript: string): string => {
    if (!transcript || transcript.length < 5) {
      return "Não consegui entender bem sua história. Tente falar mais claramente da próxima vez.";
    }
    
    // Analyze content by looking for keywords
    const words = transcript.toLowerCase().split(/\s+/);
    const wordCount = words.length;
    
    // Check for characters in the story
    const characterWords = ['menino', 'menina', 'homem', 'mulher', 'ele', 'ela', 'amigo', 'amiga', 
                          'mãe', 'pai', 'avó', 'avô', 'princesa', 'príncipe', 'herói', 'animal'];
    const hasCharacters = characterWords.some(word => transcript.toLowerCase().includes(word));
    
    // Check for setting in the story
    const settingWords = ['casa', 'escola', 'floresta', 'cidade', 'reino', 'castelo', 'praia', 
                         'montanha', 'sala', 'quarto', 'jardim', 'parque'];
    const hasSetting = settingWords.some(word => transcript.toLowerCase().includes(word));
    
    // Check for plot elements
    const plotWords = ['então', 'depois', 'quando', 'porque', 'mas', 'finalmente', 'começou', 
                     'terminou', 'aconteceu'];
    const hasPlot = plotWords.some(word => words.includes(word));
    
    // Check for creativity elements
    const creativeWords = ['mágico', 'voar', 'dragão', 'fada', 'gigante', 'monstro', 'poder', 
                         'especial', 'transformar', 'magia', 'encantado'];
    const isCreative = creativeWords.some(word => transcript.toLowerCase().includes(word));
    
    // Build the analysis
    let analysis = "";
    
    // Comment on length
    if (wordCount < 20) {
      analysis += "Sua história é curta, mas interessante! ";
    } else if (wordCount < 50) {
      analysis += "Você criou uma história de bom tamanho! ";
    } else {
      analysis += "Você contou uma história bem detalhada! ";
    }
    
    // Comment on characters and setting
    if (hasCharacters && hasSetting) {
      analysis += "Gostei de como você descreveu os personagens e o cenário. ";
    } else if (hasCharacters) {
      analysis += "Os personagens da sua história são muito interessantes! ";
    } else if (hasSetting) {
      analysis += "Você criou um cenário muito imaginativo! ";
    } else {
      analysis += "Da próxima vez, tente incluir mais detalhes sobre personagens e onde a história acontece. ";
    }
    
    // Comment on plot
    if (hasPlot) {
      analysis += "Sua narrativa tem um bom desenvolvimento de começo, meio e fim. ";
    } else {
      analysis += "Tente criar mais conexões entre os eventos da história. ";
    }
    
    // Comment on creativity
    if (isCreative) {
      analysis += "Adorei os elementos criativos e mágicos que você incluiu! ";
    } else {
      analysis += "Sua história é bastante realista e bem contada. ";
    }
    
    // Add encouraging feedback
    analysis += "Continue desenvolvendo sua imaginação contando mais histórias!";
    
    return analysis;
  };

  // Handle continue button
  const handleContinue = () => {
    setShowSummary(false);
    setStoryTranscript("");
    setInterimTranscript("");
    setAnalysisResult("");
    
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

  // Handle unlock app button - fixing the implementation to use imported unlockApp
  const handleUnlock = () => {
    // Calculate unlock time in minutes usando a função melhorada
    const earnedMinutes = getEarnedTime(recordingTime);
    
    // Store the unlock expiry time in localStorage - this is done by unlockApp now
    const expiryTime = Date.now() + (earnedMinutes * 60 * 1000);
    localStorage.setItem('appUnlockExpiryTime', expiryTime.toString());
    localStorage.setItem('wasUnlocked', 'true');
    
    // Show success message
    showToastOnly(
      "App Desbloqueado!", 
      `Você ganhou ${earnedMinutes} minutos de uso! Aproveite!`,
      "default"
    );
    
    // Speak the success message
    speakNaturally(`Parabéns! Você desbloqueou o SuperLeitor por ${earnedMinutes} minutos. Aproveite!`, true);
    
    // Navigate to home screen
    setTimeout(() => {
      navigate("/");
    }, 3000);
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
        onUnlock={handleUnlock}
        analysisResult={analysisResult}
      />
    );
  }

  return null; // This is normally a behavior component, not a visual one
};

export default SpeechRecognitionHandler;
