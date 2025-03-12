
import { useState, useEffect, useRef } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import HamburgerMenu from "@/components/HamburgerMenu";
import AudioSphere from "@/components/AudioSphere";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";
import usePatternDetection from "@/hooks/usePatternDetection";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyTranscript, setStoryTranscript] = useState("");
  const { 
    isRecording, 
    audioData, 
    errorMessage, 
    startRecording, 
    stopRecording,
    recordingTime
  } = useAudioAnalyzer();
  const { patternDetected, patternType } = usePatternDetection(audioData);
  const patternNotifiedRef = useRef(false);

  // Animação quando o componente é montado
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

  // Notifica o usuário quando um padrão é detectado
  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      toast({
        title: "Padrão Detectado",
        description: `Um padrão de ${patternType === 'music' ? 'música' : 'som repetitivo'} foi identificado!`,
        variant: "default",
      });
      
      // Reset a notificação após um tempo para permitir notificações futuras
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 10000);
    }
  }, [patternDetected, patternType, isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      setIsStoryMode(false);
      
      toast({
        title: "Gravação interrompida",
        description: `A visualização de áudio foi interrompida após ${Math.floor(recordingTime)} segundos.`,
      });
    } else {
      startRecording();
      setIsStoryMode(true);
      
      toast({
        title: "Modo História Ativado",
        description: "Conte sua história para a Esfera Sonora. Ela está ouvindo!",
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/90 overflow-hidden">
      <HamburgerMenu />
      
      <div 
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ease-out transform ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="absolute top-6 left-0 right-0 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            {isStoryMode ? "Modo História" : "Esfera Sonora"}
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
        
        {isStoryMode && storyTranscript && (
          <div className="mb-8 px-6 max-w-md text-center">
            <p className="text-sm opacity-75">{storyTranscript}</p>
          </div>
        )}
        
        <div className="absolute bottom-12 left-0 right-0 flex justify-center">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "default"}
            size="lg"
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
