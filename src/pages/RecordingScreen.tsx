import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import AudioSphere from "@/components/AudioSphere";
import RecordingControls from "@/components/RecordingControls";
import StoryTranscript from "@/components/StoryTranscript";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";
import usePatternDetection from "@/hooks/usePatternDetection";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { speakNaturally, processRecognitionResult, generateSimpleResponse, initVoices } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import webSpeechService from "@/services/webSpeechService";
import { isAndroid, keepScreenOn, requestAndroidPermissions } from "@/utils/androidHelper";
import { geminiService } from "@/services/geminiService";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [recognitionStatus, setRecognitionStatus] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Retrieve theme from localStorage or default to false (light mode)
    const savedTheme = localStorage.getItem("dark-mode");
    return savedTheme === "true";
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(false);
  const { onboardingData } = useOnboarding();
  
  const { 
    isRecording, 
    audioData, 
    errorMessage, 
    startRecording, 
    stopRecording,
    recordingTime,
    audioBlob
  } = useAudioAnalyzer();
  const { patternDetected, patternType } = usePatternDetection(audioData);
  const patternNotifiedRef = useRef(false);
  const welcomeSpokenRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const speechInitializedRef = useRef(false);
  const audioTestPerformedRef = useRef(false);

  // NOVO: Testar o áudio na inicialização
  useEffect(() => {
    if (loaded && !audioTestPerformedRef.current) {
      audioTestPerformedRef.current = true;
      
      // Breve delay para garantir que a página esteja completamente carregada
      setTimeout(async () => {
        try {
          // Tentar tocar um som de teste
          const testSound = new Audio();
          testSound.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."
          testSound.volume = 1.0;
          
          // Forçar contexto de áudio para desbloquear áudio no iOS/Safari
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioContext.resume();
          
          // Testar a síntese de voz
          const testText = "Testando o sistema de áudio...";
          console.log("Teste inicial de áudio:", testText);
          speakNaturally(testText, true);
        } catch (e) {
          console.error("Erro no teste de áudio:", e);
        }
      }, 1500);
    }
  }, [loaded]);

  useEffect(() => {
    if (!speechInitializedRef.current) {
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Speech synthesis initialized:", initialized);
      });
    }
  }, []);

  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (isAndroid()) {
          const granted = await requestAndroidPermissions();
          setHasMicrophonePermission(granted);
          return;
        }
        
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasMicrophonePermission(result.state === 'granted');
        
        if (result.state !== 'granted') {
          requestMicrophonePermission();
        }
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        requestMicrophonePermission();
      }
    };
    
    checkMicrophonePermission();
    
    if (isAndroid()) {
      keepScreenOn().catch(error => {
        console.error("Error keeping screen on:", error);
      });
    }
  }, []);

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      showToastOnly(
        "Permissão de Microfone",
        "Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.",
        "destructive"
      );
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("dark-mode", isDarkMode.toString());
  }, [isDarkMode]);

  // Função melhorada para falar mensagem de boas-vindas
  const speakWelcomeMessage = () => {
    if (onboardingData.superReaderName) {
      // Create welcome message with just the SuperLeitor name
      const welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Show toast message
      showToastOnly("Bem-vindo!", welcomeMessage);
      
      // IMPORTANTE: Garantir que o áudio seja reproduzido com prioridade
      setTimeout(() => {
        console.log("Attempting to speak welcome message with delay");
        speakNaturally(welcomeMessage, true);
      }, 1000);
    } else {
      console.error("Name not set", {
        superReaderName: onboardingData.superReaderName
      });
      
      // Show generic toast if name is not set
      showToastOnly("Bem-vindo!", "Olá! Que bom te ver! Que história você quer me contar hoje?");
      
      // Speak generic welcome
      setTimeout(() => {
        speakNaturally("Olá! Que bom te ver! Que história você quer me contar hoje?", true);
      }, 1000);
    }
  };

  useEffect(() => {
    if (loaded && !welcomeSpokenRef.current && onboardingData.superReaderName) {
      welcomeSpokenRef.current = true;
      
      // Longer delay to ensure everything is ready
      setTimeout(() => {
        speakWelcomeMessage();
      }, 2000);
    }
  }, [loaded, onboardingData.superReaderName]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (errorMessage) {
      showToastOnly("Erro", errorMessage, "destructive");
    }
  }, [errorMessage]);

  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      // Create natural message
      const message = `Ei, percebi um padrão de ${patternType === 'music' ? 'música' : 'ritmo'} na sua história! Que legal!`;
      
      // Show toast notification only
      showToastOnly("Padrão Detectado", message);
      
      // IMPORTANTE: Garantir que a notificação seja falada
      setTimeout(() => {
        speakNaturally(message, true);
      }, 500);
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 12000); // Longer timeout to prevent too many notifications
    }
  }, [patternDetected, patternType, isRecording]);

  // Process transcript from speech recognition
  const handleRecognitionResult = (result: { transcript: string, isFinal: boolean }) => {
    const cleanTranscript = processRecognitionResult(result.transcript);
    
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
    if (lastTranscriptRef.current && lastTranscriptRef.current.length > 5) {
      setIsProcessing(true);
      
      // Primeiro uma resposta rápida local
      const quickResponse = generateSimpleResponse(lastTranscriptRef.current);
      showToastOnly("Sua história é incrível!", quickResponse);
      
      // Falar a resposta rápida
      setTimeout(() => {
        speakNaturally(quickResponse, true);
      }, 300);
      
      // Se temos um blob de áudio, processar com o Gemini para resposta mais complexa
      if (audioBlob && audioBlob.size > 1000) {
        console.log("Processing audio with Gemini, size:", audioBlob.size);
        
        // Mostrar feedback durante o processamento
        setTimeout(() => {
          showToastOnly("Analisando", "Estou analisando sua história com mais detalhes...");
        }, 3000);
        
        // Processar o áudio com o Gemini
        geminiService.processAudio(audioBlob)
          .then(response => {
            console.log("Gemini response:", response);
            
            if (response) {
              // Atualizar o transcript com a resposta do Gemini
              setStoryTranscript(response);
              
              // Mostrar como toast
              showToastOnly("Análise completa!", response);
              
              // Falar a resposta do Gemini
              setTimeout(() => {
                speakNaturally(response, true);
              }, 500);
            }
          })
          .catch(error => {
            console.error("Error processing with Gemini:", error);
            // Em caso de erro, ainda mostrar alguma resposta
            showToastOnly("Hmm...", "Sua história é fascinante! Pode me contar mais?");
          })
          .finally(() => {
            setIsProcessing(false);
          });
      } else {
        // Finalizar processamento após um tempo se não houver blob de áudio
        setTimeout(() => {
          setIsProcessing(false);
        }, 2000);
      }
    } else {
      setIsProcessing(false);
    }
  };
  
  // Handle speech recognition start
  const handleRecognitionStart = () => {
    setRecognitionStatus("Ouvindo...");
  };

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
      
      // IMPORTANTE: Garantir que a mensagem seja falada
      setTimeout(() => {
        speakNaturally(stopMessage, true);
      }, 300);
      
      // Process the story
      setIsProcessing(true);
    } else {
      // Check for microphone permission before starting
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      // Limpar estado anterior
      setStoryTranscript("");
      setInterimTranscript("");
      
      // Iniciar gravação
      startRecording();
      setIsStoryMode(true);
      
      // Start speech recognition
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
      
      const startMessage = "Estou ouvindo! Pode contar sua história...";
      
      // Show toast
      showToastOnly(
        "Modo História Ativado",
        "Conte sua história para a Esfera Sonora!"
      );
      
      // IMPORTANTE: Garantir que a mensagem seja falada
      setTimeout(() => {
        speakNaturally(startMessage, true);
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      webSpeechService.stopRecognition();
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-b from-background to-background/90" 
        : "bg-gradient-to-b from-background to-background/90"
    } overflow-hidden`}>
      <HamburgerMenu isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <div 
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ease-out transform ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <RecordingControls 
          isRecording={isRecording}
          isProcessing={isProcessing}
          recordingTime={recordingTime}
          toggleRecording={toggleRecording}
          recognitionStatus={recognitionStatus}
        />
        
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        <StoryTranscript 
          storyTranscript={interimTranscript || storyTranscript}
          isProcessing={isProcessing}
          isInterim={!!interimTranscript}
          recognitionStatus={recognitionStatus}
        />
      </div>
    </div>
  );
};

export default RecordingScreen;
