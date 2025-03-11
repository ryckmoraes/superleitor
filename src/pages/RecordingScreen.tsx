
import { useState, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import HamburgerMenu from "@/components/HamburgerMenu";
import AudioSphere from "@/components/AudioSphere";
import useAudioAnalyzer from "@/hooks/useAudioAnalyzer";

const RecordingScreen = () => {
  const [loaded, setLoaded] = useState(false);
  const { isRecording, audioData, errorMessage, startRecording, stopRecording } = useAudioAnalyzer();

  // Animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Show error toast if microphone access is denied
  useEffect(() => {
    if (errorMessage) {
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [errorMessage]);

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
      toast({
        title: "Recording stopped",
        description: "Audio visualization has stopped.",
      });
    } else {
      startRecording();
      toast({
        title: "Recording started",
        description: "Audio visualization is active.",
      });
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-background/90 overflow-hidden">
      {/* Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Content container */}
      <div 
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ease-out transform ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        {/* Title */}
        <div className="absolute top-6 left-0 right-0 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-primary">
            Sound Sphere
          </h1>
        </div>
        
        {/* Main sphere visualization */}
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        {/* Controls */}
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
                  Stop Recording
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  Start Recording
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
