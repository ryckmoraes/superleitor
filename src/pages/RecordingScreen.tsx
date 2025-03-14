
import { useState, useEffect, useRef } from "react";
import HamburgerMenu from "@/components/HamburgerMenu";
import AudioSphere from "@/components/AudioSphere";
import RecordingControls from "@/components/RecordingControls";
import StoryTranscript from "@/components/StoryTranscript";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";
import usePatternDetection from "@/hooks/usePatternDetection";
import { geminiService } from "@/services/geminiService";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
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

  // Check for microphone permission
  useEffect(() => {
    const checkMicrophonePermission = async () => {
      try {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setHasMicrophonePermission(result.state === 'granted');
        
        // If not granted, request permission
        if (result.state !== 'granted') {
          requestMicrophonePermission();
        }
      } catch (error) {
        console.error("Error checking microphone permission:", error);
        // Fallback to requesting directly if query is not supported
        requestMicrophonePermission();
      }
    };
    
    checkMicrophonePermission();
  }, []);

  // Function to request microphone permission
  const requestMicrophonePermission = async () => {
    try {
      // Just requesting permission will trigger the browser's permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the stream since we only needed to request permission
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

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    // Save theme preference to localStorage
    localStorage.setItem("dark-mode", isDarkMode.toString());
  }, [isDarkMode]);

  // Function to speak welcome message using Web Speech API
  const speakWelcomeMessage = () => {
    if ('speechSynthesis' in window && onboardingData.superReaderName) {
      // Create welcome message with just the SuperLeitor name
      const welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Show toast message
      showToastOnly("Bem-vindo!", welcomeMessage);
      
      // Speak with natural voice
      speakNaturally(welcomeMessage, true);
    } else {
      console.error("Speech synthesis not supported or name not set", {
        speechSynthesisSupported: 'speechSynthesis' in window,
        superReaderName: onboardingData.superReaderName
      });
      
      // Show toast if speech synthesis fails
      if (onboardingData.superReaderName) {
        showToastOnly("Bem-vindo!", `Olá ${onboardingData.superReaderName}! Que bom te ver!`);
      }
    }
  };

  // Speak welcome message when component is loaded
  useEffect(() => {
    if (loaded && !welcomeSpokenRef.current && onboardingData.superReaderName) {
      welcomeSpokenRef.current = true;
      
      // Slight delay to ensure everything is ready
      setTimeout(() => {
        speakWelcomeMessage();
      }, 1000);
    }
  }, [loaded, onboardingData.superReaderName]);

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Animation when component is mounted
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

  // Notify user when a pattern is detected
  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      // Create natural message
      const message = `Ei, percebi um padrão de ${patternType === 'music' ? 'música' : 'ritmo'} na sua história! Que legal!`;
      
      // Show toast notification only
      showToastOnly("Padrão Detectado", message);
      
      // Speak the notification with natural voice
      speakNaturally(message);
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 12000); // Longer timeout to prevent too many notifications
    }
  }, [patternDetected, patternType, isRecording]);

  // Process audio with Gemini when recording stops
  useEffect(() => {
    const processAudioWithGemini = async () => {
      if (!isRecording && audioBlob && !isProcessing && audioBlob.size > 0) {
        setIsProcessing(true);
        try {
          setStoryTranscript("Processando áudio...");
          showToastOnly(
            "Analisando sua história",
            "Estou ouvindo com atenção o que você contou..."
          );
          
          const response = await geminiService.processAudio(audioBlob);
          setStoryTranscript(response);
          setIsStoryMode(true);
          
          // Show response in toast only
          showToastOnly(
            "Sua história é incrível!",
            response.length > 100 ? response.substring(0, 100) + "..." : response
          );
          
          // Speak with natural voice
          speakNaturally(response, true);
          
        } catch (error) {
          console.error("Error processing audio:", error);
          const errorMessage = "Puxa! Não consegui entender sua história. Vamos tentar de novo?";
          
          setStoryTranscript(errorMessage);
          
          showToastOnly(
            "Ops!",
            errorMessage,
            "destructive"
          );
          
          // Speak error message with natural voice
          speakNaturally(errorMessage, true);
        } finally {
          setIsProcessing(false);
        }
      }
    };

    processAudioWithGemini();
  }, [isRecording, audioBlob]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      
      const stopMessage = `Legal! Deixa eu pensar sobre essa história...`;
      
      // Show toast only
      showToastOnly(
        "História recebida!",
        `Gravação finalizada após ${Math.floor(recordingTime)} segundos.`
      );
      
      // Speak notification with natural voice
      speakNaturally(stopMessage, true);
    } else {
      // Check for microphone permission before starting
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      startRecording();
      setStoryTranscript("");
      setIsStoryMode(false);
      
      const startMessage = "Estou ouvindo! Pode contar sua história...";
      
      // Show toast only
      showToastOnly(
        "Modo História Ativado",
        "Conte sua história para a Esfera Sonora!"
      );
      
      // Speak notification with natural voice
      speakNaturally(startMessage, true);
    }
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
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
          recordingTime={recordingTime}
          toggleRecording={toggleRecording}
        />
        
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        <StoryTranscript 
          storyTranscript={storyTranscript}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
};

export default RecordingScreen;
