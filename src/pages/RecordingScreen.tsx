
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
      // Create welcome message with SuperLeitor name
      const welcomeMessage = `Bem vindo Superleitor ${onboardingData.superReaderName}. Que histórias irá me contar.`;
      
      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(welcomeMessage);
      utterance.lang = 'pt-BR'; // Set language to Portuguese
      utterance.rate = 1.0;     // Normal speaking rate
      utterance.pitch = 1.0;    // Normal pitch
      utterance.volume = 1.0;   // Full volume
      
      // Speak the welcome message
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speak welcome message on component mount
  useEffect(() => {
    if (loaded && !welcomeSpokenRef.current) {
      welcomeSpokenRef.current = true;
      
      // Slight delay to ensure everything is ready
      setTimeout(() => {
        speakWelcomeMessage();
      }, 800);
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
          
          // Speak the Gemini response instead of showing text
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(response);
            utterance.lang = 'pt-BR';
            window.speechSynthesis.speak(utterance);
          }
          
        } catch (error) {
          console.error("Error processing audio:", error);
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
      
      toast({
        title: "Gravação interrompida",
        description: `A visualização de áudio foi interrompida após ${Math.floor(recordingTime)} segundos.`,
      });
    } else {
      startRecording();
      setStoryTranscript("");
      
      // Use audio for interaction instead of toast
      if ('speechSynthesis' in window) {
        const startMessage = "Estou ouvindo! Conte sua história para a Esfera Sonora.";
        const utterance = new SpeechSynthesisUtterance(startMessage);
        utterance.lang = 'pt-BR';
        window.speechSynthesis.speak(utterance);
      } else {
        toast({
          title: "Modo História Ativado",
          description: "Conte sua história para a Esfera Sonora. Ela está ouvindo e analisando!",
        });
      }
    }
  };

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
        
        {/* Hide visible transcript since we're using audio output */}
        {storyTranscript && isProcessing && (
          <div className="absolute bottom-32 px-6 w-full max-w-md mx-auto">
            <ScrollArea className="h-[150px] rounded-md border p-4 bg-card/50 backdrop-blur-sm">
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm mt-2">Processando com Gemini...</p>
              </div>
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
