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

// Improved voice configuration for more natural speech
const configureNaturalVoice = (utterance: SpeechSynthesisUtterance): void => {
  utterance.lang = 'pt-BR';
  utterance.rate = 0.85; // Slower for more natural pacing
  utterance.pitch = 1.05; // Slightly higher for children's content
  utterance.volume = 1.0;
  
  // Try to select a more natural female voice if available
  const voices = speechSynthesis.getVoices();
  
  // First try to find a Brazilian Portuguese female voice
  let selectedVoice = voices.find(voice => 
    voice.lang.includes('pt-BR') && 
    (voice.name.toLowerCase().includes('female') || 
     voice.name.toLowerCase().includes('mulher') ||
     voice.name.toLowerCase().includes('feminin'))
  );
  
  // If not found, try any Brazilian Portuguese voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.includes('pt-BR'));
  }
  
  // Fallback to any Portuguese voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.includes('pt'));
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
};

// Enhanced text processor for more natural speech with pauses and intonation
const processTextForSpeech = (text: string): string => {
  return text
    .replace(/\.\s+/g, '... ') // Add longer pause after periods
    .replace(/,\s+/g, ', ') // Ensure comma pauses
    .replace(/(!|\?)\s+/g, '$1... ') // Add pause after exclamation/question marks
    .replace(/:\s+/g, '... ') // Add pause after colons
    .replace(/(\w+)(\W+)$/g, '$1...') // Add pause at the end of sentences
    .replace(/\s{2,}/g, ' '); // Remove extra spaces
};

// Speaks text with a natural, expressive voice
const speakNaturally = (text: string, priority: boolean = false): void => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech if priority message
  if (priority && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Don't interrupt if already speaking and not priority
  if (!priority && speechSynthesis.speaking) return;
  
  // Split long text into smaller chunks for more natural delivery
  const MAX_CHUNK_LENGTH = 100;
  const processedText = processTextForSpeech(text);
  
  // Split by sentence markers but keep the markers
  const sentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
  
  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    configureNaturalVoice(utterance);
    
    // Add a slight delay between sentences for more natural pacing
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, index * 200);
  });
};

// Only show toast, don't speak it
const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
  });
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
