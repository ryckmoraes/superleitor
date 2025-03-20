
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, LockOpen, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface StoryTranscriptProps {
  storyTranscript: string;
  isProcessing: boolean;
  isInterim?: boolean;
  recognitionStatus?: string;
  recordingTime?: number;
  onContinue?: () => void;
  onExit?: () => void;
  onUnlock?: () => void;
  analysisResult?: string;
}

const StoryTranscript = ({ 
  storyTranscript, 
  isProcessing, 
  isInterim = false,
  recognitionStatus,
  recordingTime,
  onContinue,
  onExit,
  onUnlock,
  analysisResult
}: StoryTranscriptProps) => {
  const [showSummary, setShowSummary] = useState(false);
  
  // Show summary when recording stops and there's a transcript
  useEffect(() => {
    if (!isProcessing && !isInterim && storyTranscript && recordingTime && recordingTime > 3) {
      // Show summary after a short delay to allow for final speech to complete
      const timer = setTimeout(() => {
        setShowSummary(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isInterim, storyTranscript, recordingTime]);
  
  if (!storyTranscript && !isProcessing && !recognitionStatus && !showSummary) return null;
  
  // Calculate earned time based on recording duration
  const getEarnedTime = (seconds: number): number => {
    // For every 30 seconds of story, grant 5 minutes of app time (adjust as needed)
    return Math.ceil(seconds / 30) * 5;
  };
  
  // Show recording summary with time and controls
  if (showSummary && recordingTime) {
    const earnedMinutes = getEarnedTime(recordingTime);
    
    return (
      <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/70 backdrop-blur-sm">
        <div className="max-w-md w-full mx-auto bg-card rounded-lg border shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
            <Clock className="w-6 h-6 text-primary" />
            História Concluída!
          </h3>
          
          <ScrollArea className="h-48 mb-6 rounded border p-4 bg-muted/20">
            <p className="text-sm">{storyTranscript}</p>
          </ScrollArea>
          
          {analysisResult && (
            <div className="mb-4 p-3 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-medium mb-1">Análise da História:</h4>
              <p className="text-sm text-muted-foreground">{analysisResult}</p>
            </div>
          )}
          
          <div className="text-center mb-6 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              Tempo de gravação: <span className="font-semibold">{Math.floor(recordingTime)} segundos</span>
            </p>
            <p className="text-base font-semibold text-primary">
              Tempo desbloqueado: {earnedMinutes} minutos
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {onUnlock && (
              <Button 
                onClick={onUnlock} 
                className="w-full bg-primary hover:bg-primary/90 text-base flex items-center justify-center gap-2"
                size="lg"
              >
                <LockOpen className="w-5 h-5" />
                Desbloquear App por {earnedMinutes} minutos
              </Button>
            )}
            
            {onContinue && (
              <Button 
                onClick={onContinue} 
                variant="outline" 
                className="w-full text-base flex items-center justify-center gap-2"
                size="lg"
              >
                <BookOpen className="w-5 h-5" />
                Continuar a História
              </Button>
            )}
            
            {onExit && (
              <Button 
                onClick={onExit} 
                variant="ghost" 
                className="w-full mt-2"
              >
                Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  // Regular transcript display during recording/processing
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-10">
      <ScrollArea className="max-h-[150px] rounded-md border p-3 bg-background/90 backdrop-blur-sm shadow-lg">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm mt-1 font-medium">Analisando sua história...</p>
          </div>
        ) : (
          <div>
            <p className={`text-sm ${isInterim ? 'opacity-80' : 'font-medium'}`}>
              {storyTranscript}
              {isInterim && <span className="animate-pulse">...</span>}
            </p>
            {recognitionStatus && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                {recognitionStatus}
              </p>
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default StoryTranscript;
