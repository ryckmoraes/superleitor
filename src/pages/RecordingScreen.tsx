
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

// Configures voice to be more natural
const configureVoice = (utterance: SpeechSynthesisUtterance): void => {
  utterance.lang = 'pt-BR';
  utterance.rate = 0.9; // Slightly slower
  utterance.pitch = 1.1; // Slightly higher pitch
  utterance.volume = 1.0;
  
  // Try to select a more natural female voice if available
  const voices = speechSynthesis.getVoices();
  const brazilianVoice = voices.find(voice => 
    voice.lang.includes('pt-BR') && voice.name.includes('female')
  );
  
  if (brazilianVoice) {
    utterance.voice = brazilianVoice;
  }
};

// Controls speech synthesis
const speakText = (text: string, priority: boolean = false): void => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech if priority message
  if (priority && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Don't interrupt if already speaking and not priority
  if (!priority && speechSynthesis.speaking) return;
  
  const utterance = new SpeechSynthesisUtterance(text);
  configureVoice(utterance);
  
  // Add some natural pauses with commas
  const processedText = text
    .replace(/\./g, ', ') // Replace periods with commas and pauses
    .replace(/(!|\?)/g, '$1, '); // Add pauses after exclamation/question marks
    
  utterance.text = processedText;
  speechSynthesis.speak(utterance);
};

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
      // Create welcome message with just the SuperLeitor name
      const welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver por aqui. Que história você quer me contar hoje?`;
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Show toast message
      toast({
        title: "Bem-vindo!",
        description: welcomeMessage,
      });
      
      // Speak with improved voice
      speakText(welcomeMessage, true);
    } else {
      console.error("Speech synthesis not supported or SuperLeitor name not set", {
        speechSynthesisSupported: 'speechSynthesis' in window,
        superReaderName: onboardingData.superReaderName
      });
      
      // Show toast if speech synthesis fails
      if (onboardingData.superReaderName) {
        toast({
          title: "Bem-vindo!",
          description: `Olá ${onboardingData.superReaderName}! Que bom te ver por aqui.`,
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
      
      // Create natural message
      const message = `Ei, detectei um padrão de ${patternType === 'music' ? 'música' : 'sons repetitivos'} na sua história! Que legal!`;
      
      // Show toast notification
      toast({
        title: "Padrão Detectado",
        description: message,
        variant: "default",
      });
      
      // Speak the notification
      speakText(message);
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 10000);
    }
  }, [patternDetected, patternType, isRecording]);

  // Process audio with Gemini when recording stops
  useEffect(() => {
    const processAudioWithGemini = async () => {
      if (!isRecording && audioBlob && !isProcessing && audioBlob.size > 0) {
        setIsProcessing(true);
        try {
          setStoryTranscript("Processando áudio...");
          toast({
            title: "Analisando sua história",
            description: "Estou ouvindo com atenção o que você contou...",
          });
          
          const response = await geminiService.processAudio(audioBlob);
          setStoryTranscript(response);
          setIsStoryMode(true);
          
          // Show response in toast
          toast({
            title: "Sua história é incrível!",
            description: response.length > 100 ? response.substring(0, 100) + "..." : response,
          });
          
          // Speak with improved voice
          speakText(response, true);
          
        } catch (error) {
          console.error("Error processing audio:", error);
          const errorMessage = "Ops! Tive um probleminha para entender sua história. Vamos tentar de novo?";
          
          setStoryTranscript(errorMessage);
          
          toast({
            title: "Pequeno problema",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Speak error message
          speakText(errorMessage, true);
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
      
      const stopMessage = `Entendi! Estou pensando sobre a sua história...`;
      
      // Show toast
      toast({
        title: "História recebida!",
        description: `Gravação finalizada após ${Math.floor(recordingTime)} segundos.`,
      });
      
      // Speak notification
      speakText(stopMessage, true);
    } else {
      // Check for microphone permission before starting
      if (!hasMicrophonePermission) {
        requestMicrophonePermission();
        return;
      }
      
      startRecording();
      setStoryTranscript("");
      setIsStoryMode(false);
      
      const startMessage = "Estou ouvindo! Pode começar a contar sua história...";
      
      // Show toast
      toast({
        title: "Modo História Ativado",
        description: "Conte sua história para a Esfera Sonora!",
      });
      
      // Speak notification
      speakText(startMessage, true);
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
                  <p className="text-sm mt-2">Analisando sua história...</p>
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
                  Parar História
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
