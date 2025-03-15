
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
import { isAndroid, keepScreenOn, requestAndroidPermissions, checkAndInitTTS } from "@/utils/androidHelper";
import { geminiService } from "@/services/geminiService";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mic } from "lucide-react";

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
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [ttsStatus, setTtsStatus] = useState<"checking" | "ready" | "error">("checking");
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
  const { patternDetected, patternType, resetDetection } = usePatternDetection(audioData);
  const patternNotifiedRef = useRef(false);
  const welcomeSpokenRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const speechInitializedRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAudioDataRef = useRef(false);
  const permissionCheckedRef = useRef(false);

  // Initialize speech synthesis with enhanced testing
  useEffect(() => {
    const setupTTS = async () => {
      try {
        setTtsStatus("checking");
        
        // First try the standard initialization
        const standardInit = await initVoices();
        
        if (standardInit) {
          console.log("TTS inicializado com sucesso (método padrão)");
          
          // Teste adicional para confirmar que a síntese de voz está funcionando
          if (isAndroid()) {
            const ttsWorks = await checkAndInitTTS();
            if (ttsWorks) {
              console.log("TTS testado e funcionando corretamente no Android");
              setTtsStatus("ready");
              speechInitializedRef.current = true;
            } else {
              console.warn("Teste de TTS falhou no Android");
              setTtsStatus("error");
              // Tentar falar mesmo assim, para ver se funciona
              setTimeout(() => {
                speakNaturally("Olá! Bem-vindo à Esfera Sonora!", true);
              }, 1000);
            }
          } else {
            setTtsStatus("ready");
            speechInitializedRef.current = true;
          }
        } else {
          console.error("Falha ao inicializar TTS (método padrão)");
          setTtsStatus("error");
          
          // Tente uma inicialização mais direta como último recurso
          setTimeout(() => {
            try {
              const utterance = new SpeechSynthesisUtterance("Teste de inicialização");
              utterance.volume = 1.0;
              utterance.rate = 1.0;
              utterance.lang = 'pt-BR';
              speechSynthesis.speak(utterance);
              console.log("Tentativa direta de fala executada");
            } catch (e) {
              console.error("Erro na tentativa direta de fala:", e);
            }
          }, 2000);
        }
      } catch (error) {
        console.error("Erro durante a inicialização do TTS:", error);
        setTtsStatus("error");
      }
    };
    
    setupTTS();
  }, []);

  // Check microphone permissions
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        if (permissionCheckedRef.current) return;
        permissionCheckedRef.current = true;
        
        console.log("Verificando permissões de microfone");
        
        if (isAndroid()) {
          const granted = await requestAndroidPermissions();
          console.log("Permissão de microfone no Android:", granted ? "concedida" : "negada");
          setHasMicrophonePermission(granted);
          
          if (!granted) {
            setShowPermissionAlert(true);
            showToastOnly(
              "Permissão Necessária",
              "Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.",
              "destructive"
            );
          } else {
            setShowPermissionAlert(false);
            // Se tudo estiver pronto, falamos a mensagem de boas-vindas
            if (ttsStatus === "ready" && !welcomeSpokenRef.current) {
              setTimeout(() => speakWelcomeMessage(), 1000);
            }
          }
          
          await keepScreenOn().catch(error => {
            console.error("Error keeping screen on:", error);
          });
          
          return;
        }
        
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        console.log("Status de permissão do microfone:", result.state);
        setHasMicrophonePermission(result.state === 'granted');
        
        if (result.state !== 'granted') {
          setShowPermissionAlert(true);
          requestMicrophonePermission();
        } else {
          setShowPermissionAlert(false);
          // Se tudo estiver pronto, falamos a mensagem de boas-vindas
          if (ttsStatus === "ready" && !welcomeSpokenRef.current) {
            setTimeout(() => speakWelcomeMessage(), 1000);
          }
        }
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        setShowPermissionAlert(true);
        requestMicrophonePermission();
      }
    };
    
    if (loaded) {
      checkMicrophonePermission();
    }
  }, [loaded, ttsStatus]);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
      setShowPermissionAlert(false);
      
      // Se agora temos permissão e TTS está pronto, fale a mensagem de boas-vindas
      if (ttsStatus === "ready" && !welcomeSpokenRef.current) {
        setTimeout(() => speakWelcomeMessage(), 1000);
      }
    } catch (error) {
      console.error("Error requesting microphone permission:", error);
      setShowPermissionAlert(true);
      showToastOnly(
        "Permissão de Microfone",
        "Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.",
        "destructive"
      );
    }
  };

  // Handle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("dark-mode", isDarkMode.toString());
  }, [isDarkMode]);

  // Improved welcome message function
  const speakWelcomeMessage = () => {
    if (welcomeSpokenRef.current) return;
    welcomeSpokenRef.current = true;
    
    if (onboardingData.superReaderName) {
      // Create welcome message with the SuperLeitor name
      const welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Show toast message
      showToastOnly("Bem-vindo!", welcomeMessage);
      
      // Ensure audio is played with priority
      setTimeout(() => {
        console.log("Attempting to speak welcome message with delay");
        speakNaturally(welcomeMessage, true);
      }, 1000);
    } else {
      console.log("Name not set", {
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

  // Toggle dark mode
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

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

  // Handle pattern detection
  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      // Create natural message
      const message = `Ei, percebi um padrão de ${patternType === 'music' ? 'música' : 'ritmo'} na sua história! Que legal!`;
      
      // Show toast notification only
      showToastOnly("Padrão Detectado", message);
      
      // Ensure notification is spoken
      setTimeout(() => {
        speakNaturally(message, true);
      }, 500);
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 15000); // Longer timeout to prevent too many notifications
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
      setShowPermissionAlert(true);
    }
  };
  
  // Handle when speech recognition ends
  const handleRecognitionEnd = () => {
    // Update status but don't display it prominently
    setRecognitionStatus("Finalizando reconhecimento...");
    
    // Only respond if there's meaningful transcript and we have an audio blob
    if (lastTranscriptRef.current && lastTranscriptRef.current.length > 5) {
      setIsProcessing(true);
      
      // First a quick local response
      const quickResponse = generateSimpleResponse(lastTranscriptRef.current);
      showToastOnly("Sua história é incrível!", quickResponse);
      
      // Speak the quick response
      setTimeout(() => {
        speakNaturally(quickResponse, true);
      }, 300);
      
      // If we have an audio blob, process with Gemini for more complex response
      if (audioBlob && audioBlob.size > 1000) {
        console.log("Processing audio with Gemini, size:", audioBlob.size);
        
        // Show feedback during processing
        setTimeout(() => {
          showToastOnly("Analisando", "Estou analisando sua história com mais detalhes...");
        }, 3000);
        
        // CRITICAL FIX: Set a strict timeout to ensure we finish processing
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (isProcessing) {
            console.log("Processing timeout reached, showing fallback response");
            setIsProcessing(false);
            const fallbackResponse = "Adorei sua história! Continue contando mais!";
            showToastOnly("Análise completa!", fallbackResponse);
            speakNaturally(fallbackResponse, true);
          }
        }, 10000); // Shorter 10 second timeout
        
        // Process the audio with Gemini
        geminiService.processAudio(audioBlob)
          .then(response => {
            // Clear the timeout since we got a response
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
            
            console.log("Gemini response:", response);
            
            if (response) {
              // Update the transcript with the Gemini response
              setStoryTranscript(response);
              
              // Show as toast
              showToastOnly("Análise completa!", response);
              
              // Speak the Gemini response
              setTimeout(() => {
                speakNaturally(response, true);
              }, 500);
            }
          })
          .catch(error => {
            console.error("Error processing with Gemini:", error);
            // In case of error, still show some response
            const errorResponse = "Sua história é fascinante! Pode me contar mais?";
            showToastOnly("Hmm...", errorResponse);
            speakNaturally(errorResponse, true);
          })
          .finally(() => {
            setIsProcessing(false);
            
            // Clear the timeout if it's still active
            if (processingTimeoutRef.current) {
              clearTimeout(processingTimeoutRef.current);
              processingTimeoutRef.current = null;
            }
          });
      } else {
        // Finish processing after a time if there's no audio blob
        setTimeout(() => {
          setIsProcessing(false);
          speakNaturally("Que história legal! Conte-me mais!", true);
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
      
      // Ensure the message is spoken
      setTimeout(() => {
        speakNaturally(stopMessage, true);
      }, 300);
      
      // Process the story
      setIsProcessing(true);
      
      // Reset audio data detection flag
      hasAudioDataRef.current = false;
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
      
      // Ensure the message is spoken
      setTimeout(() => {
        speakNaturally(startMessage, true);
      }, 300);
    }
  };

  // Função para testar explicitamente a síntese de voz
  const testSpeech = () => {
    const testMessage = "Olá! Estou testando minha voz. Você consegue me ouvir?";
    console.log("Testando síntese de voz...");
    speakNaturally(testMessage, true);
    
    showToastOnly(
      "Teste de Voz",
      "Testando a síntese de voz. Você deveria ouvir uma mensagem.",
      "default"
    );
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      webSpeechService.stopRecognition();
      
      // Clear any processing timeouts
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
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
          recordingTime={hasAudioDataRef.current ? recordingTime : 0} // Only show time if audio detected
          toggleRecording={toggleRecording}
          recognitionStatus={recognitionStatus}
        />
        
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        {/* Alerta de permissão de microfone */}
        {showPermissionAlert && (
          <div className="fixed bottom-4 left-4 right-4 z-50">
            <Alert variant="destructive" className="bg-destructive text-white">
              <AlertTitle className="text-white font-bold">Permissão de Microfone</AlertTitle>
              <AlertDescription className="text-white">
                <p className="mb-3">Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.</p>
                <Button 
                  onClick={requestMicrophonePermission} 
                  className="bg-white text-destructive hover:bg-gray-100"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Permitir Microfone
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        {/* Botão de teste de voz quando TTS tiver problemas */}
        {ttsStatus === "error" && (
          <div className="fixed bottom-20 right-4 z-50">
            <Button 
              onClick={testSpeech} 
              variant="secondary"
              className="shadow-lg"
            >
              Testar Voz
            </Button>
          </div>
        )}
        
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
