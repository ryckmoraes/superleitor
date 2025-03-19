
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, RefreshCw, Home } from "lucide-react";
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
}

const StoryTranscript = ({ 
  storyTranscript, 
  isProcessing, 
  isInterim = false,
  recognitionStatus,
  recordingTime,
  onContinue,
  onExit
}: StoryTranscriptProps) => {
  const [showSummary, setShowSummary] = useState(false);
  
  // Show summary when recording stops and there's a transcript
  useEffect(() => {
    if (!isProcessing && !isInterim && storyTranscript && recordingTime && recordingTime > 5) {
      // Show summary after a short delay to allow for final speech to complete
      const timer = setTimeout(() => {
        setShowSummary(true);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isProcessing, isInterim, storyTranscript, recordingTime]);
  
  if (!storyTranscript && !isProcessing && !recognitionStatus && !showSummary) return null;
  
  // Show recording summary with time and controls
  if (showSummary && recordingTime) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm pointer-events-auto">
        <div className="max-w-md w-full mx-auto bg-card rounded-lg border shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Resumo da História
          </h3>
          
          <ScrollArea className="h-56 mb-4 rounded border p-3">
            <p className="text-sm">{storyTranscript}</p>
          </ScrollArea>
          
          <div className="text-sm text-muted-foreground mb-4">
            Tempo de gravação: {Math.floor(recordingTime)} segundos
          </div>
          
          <div className="flex space-x-3 justify-between">
            {onContinue && (
              <Button 
                onClick={onContinue} 
                className="flex-1 bg-primary hover:bg-primary/90 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Continuar História
              </Button>
            )}
            
            {onExit && (
              <Button 
                onClick={onExit} 
                variant="outline" 
                className="flex-1 flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
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
