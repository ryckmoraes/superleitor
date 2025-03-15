
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
  const { patternDetected, patternType, resetDetection } = usePatternDetection(audioData);
  const patternNotifiedRef = useRef(false);
  const welcomeSpokenRef = useRef(false);
  const lastTranscriptRef = useRef("");
  const speechInitializedRef = useRef(false);
  const audioTestPerformedRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasAudioDataRef = useRef(false);

  // Test audio on initialization
  useEffect(() => {
    if (loaded && !audioTestPerformedRef.current) {
      audioTestPerformedRef.current = true;
      
      // Brief delay to ensure page is fully loaded
      setTimeout(async () => {
        try {
          // Try to play a test sound
          const testSound = new Audio();
          testSound.src = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU..."
          testSound.volume = 1.0;
          
          // Force audio context to unlock audio on iOS/Safari
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          await audioContext.resume();
          
          // Test speech synthesis
          const testText = "Testando o sistema de áudio...";
          console.log("Teste inicial de áudio:", testText);
          speakNaturally(testText, true);
        } catch (e) {
          console.error("Erro no teste de áudio:", e);
        }
      }, 1500);
    }
  }, [loaded]);

  // Initialize speech synthesis
  useEffect(() => {
    if (!speechInitializedRef.current) {
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Speech synthesis initialized:", initialized);
      });
    }
  }, []);

  // Check microphone permissions
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

  // Request microphone permission
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

  // Speak welcome message once loaded
  useEffect(() => {
    if (loaded && !welcomeSpokenRef.current && onboardingData.superReaderName) {
      welcomeSpokenRef.current = true;
      
      // Longer delay to ensure everything is ready
      setTimeout(() => {
        speakWelcomeMessage();
      }, 2000);
    }
  }, [loaded, onboardingData.superReaderName]);

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
        
        // FIX: Set a timeout to make sure we finish processing eventually
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        processingTimeoutRef.current = setTimeout(() => {
          if (isProcessing) {
            console.log("Processing timeout reached, showing fallback response");
            setIsProcessing(false);
            showToastOnly("Análise completa!", "Adorei sua história! Continue contando mais!");
            speakNaturally("Adorei sua história! Continue contando mais!", true);
          }
        }, 20000); // 20 second timeout
        
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
            showToastOnly("Hmm...", "Sua história é fascinante! Pode me contar mais?");
            speakNaturally("Sua história é fascinante! Pode me contar mais?", true);
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
