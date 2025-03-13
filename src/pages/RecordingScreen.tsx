
import { useState, useEffect, useRef } from "react";
import { Mic, Square, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import HamburgerMenu from "@/components/HamburgerMenu";
import AudioSphere from "@/components/AudioSphere";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";
import usePatternDetection from "@/hooks/usePatternDetection";
import { geminiService } from "@/services/geminiService";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOnboarding } from "@/contexts/OnboardingContext";

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
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

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
      toast({
        title: "Permissão de Microfone",
        description: "Por favor, permita o acesso ao microfone para que a Esfera Sonora funcione corretamente.",
        variant: "destructive",
      });
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
      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      // Create welcome message with just the SuperLeitor name - fixed!
      const welcomeMessage = `Bem vindo ${onboardingData.superReaderName}. Que histórias irá me contar.`;
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Create speech utterance with improved parameters for more natural voice
      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.lang = 'pt-BR'; // Set language to Portuguese
      utterance.rate = 0.9;     // Slightly slower speaking rate for more natural sound
      utterance.pitch = 1.1;    // Slightly higher pitch
      utterance.volume = 1.0;   // Full volume
      
      // Store reference to utterance
      speechSynthesisRef.current = utterance;
      
      // Add event handlers
      utterance.onstart = () => console.log("Speech started");
      utterance.onend = () => console.log("Speech ended");
      utterance.onerror = (event) => console.error("Speech error:", event);
      
      // Speak the welcome message
      speechSynthesis.speak(utterance);
      
      // Also show toast message
      toast({
        title: "Bem-vindo!",
        description: welcomeMessage,
      });
    } else {
      console.error("Speech synthesis not supported or SuperLeitor name not set", {
        speechSynthesisSupported: 'speechSynthesis' in window,
        superReaderName: onboardingData.superReaderName
      });
      
      // Show toast if speech synthesis fails
      if (onboardingData.superReaderName) {
        toast({
          title: "Bem-vindo!",
          description: `Bem vindo ${onboardingData.superReaderName}. Que histórias irá me contar.`,
        });
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
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [errorMessage]);

  // Notify user when a pattern is detected
  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      // Use speech synthesis for notification
      if ('speechSynthesis' in window) {
        const message = `Um padrão de ${patternType === 'music' ? 'música' : 'som repetitivo'} foi identificado!`;
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9; // Slightly slower for more natural sound
        speechSynthesis.speak(utterance);
      }
      
      // Also show toast notification
      toast({
        title: "Padrão Detectado",
        description: `Um padrão de ${patternType === 'music' ? 'música' : 'som repetitivo'} foi identificado!`,
        variant: "default",
      });
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 10000);
    }
  }, [patternDetected, patternType, isRecording]);

  // Process audio with Gemini when recording stops
  useEffect(() => {
    const processAudioWithGemini = async () => {
      if (!isRecording && audioBlob && !isProcessing) {
        setIsProcessing(true);
        try {
          setStoryTranscript("Processando áudio...");
          const response = await geminiService.processAudio(audioBlob);
          setStoryTranscript(response);
          setIsStoryMode(true);
          
          // Speak the Gemini response with more natural voice settings
          if ('speechSynthesis' in window) {
            // Cancel any ongoing speech
            if (speechSynthesis.speaking) {
              speechSynthesis.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.lang = 'pt-BR';
            utterance.rate = 0.9; // Slightly slower for more natural sound
            utterance.pitch = 1.05; // Slightly higher pitch
            speechSynthesis.speak(utterance);
          }
          
          // Show the response in toast
          toast({
            title: "História Processada",
            description: response.length > 100 ? response.substring(0, 100) + "..." : response,
          });
          
        } catch (error) {
          console.error("Error processing audio:", error);
          
          // Speak error message
          if ('speechSynthesis' in window) {
            const errorMessage = "Não foi possível processar o áudio. Por favor, tente novamente.";
            const utterance = new SpeechSynthesisUtterance(errorMessage);
            utterance.lang = 'pt-BR';
            speechSynthesis.speak(utterance);
          }
          
          toast({
            title: "Erro de Processamento",
            description: "Não foi possível processar o áudio com o Gemini.",
            variant: "destructive",
          });
          
          setStoryTranscript("");
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
      
      // Use speech for notification
      if ('speechSynthesis' in window) {
        const stopMessage = `Gravação interrompida após ${Math.floor(recordingTime)} segundos. Processando sua história...`;
        const utterance = new SpeechSynthesisUtterance(stopMessage);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9; // More natural rate
        speechSynthesis.speak(utterance);
      }
      
      // Also show toast
      toast({
        title: "Gravação interrompida",
        description: `A visualização de áudio foi interrompida após ${Math.floor(recordingTime)} segundos.`,
      });
    } else {
      // Check for microphone permission before starting
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      startRecording();
      setStoryTranscript("");
      
      // Use audio for interaction
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
        }
        
        const startMessage = "Estou ouvindo! Conte sua história para a Esfera Sonora.";
        const utterance = new SpeechSynthesisUtterance(startMessage);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.9; // More natural rate
        speechSynthesis.speak(utterance);
      }
      
      // Show toast
      toast({
        title: "Modo História Ativado",
        description: "Conte sua história para a Esfera Sonora. Ela está ouvindo e analisando!",
      });
    }
  };

  // Clean up speech synthesis on component unmount
  useEffect(() => {
    return () => {
      if (speechSynthesis && speechSynthesis.speaking) {
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
        <div className="absolute top-6 left-0 right-0 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            {isRecording ? "Modo História" : "Esfera Sonora"}
          </h1>
          {isRecording && (
            <p className="text-sm text-muted-foreground mt-1">
              Tempo de gravação: {Math.floor(recordingTime)} segundos
            </p>
          )}
        </div>
        
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        {/* Show transcript when available */}
        {storyTranscript && (
          <div className="absolute bottom-32 px-6 w-full max-w-md mx-auto">
            <ScrollArea className="h-[150px] rounded-md border p-4 bg-card/50 backdrop-blur-sm">
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm mt-2">Processando com Gemini...</p>
                </div>
              ) : (
                <p className="text-sm">{storyTranscript}</p>
              )}
            </ScrollArea>
          </div>
        )}
        
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
            disabled={isProcessing}
            className={`group relative overflow-hidden rounded-full shadow-md transition-all duration-300 ease-out ${
              isRecording 
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2 font-medium">
              {isRecording ? (
                <>
                  <Square className="w-5 h-5" />
                  Parar Gravação
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Iniciar História
                </>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecordingScreen;
