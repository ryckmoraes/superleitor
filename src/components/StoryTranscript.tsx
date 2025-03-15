
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface StoryTranscriptProps {
  storyTranscript: string;
  isProcessing: boolean;
  isInterim?: boolean;
  recognitionStatus?: string;
}

const StoryTranscript = ({ 
  storyTranscript, 
  isProcessing, 
  isInterim = false,
  recognitionStatus
}: StoryTranscriptProps) => {
  if (!storyTranscript && !isProcessing && !recognitionStatus) return null;
  
  // Don't show the box if it's just the "Reconhecimento finalizado" status
  if (!storyTranscript && !isProcessing && 
      recognitionStatus && recognitionStatus.includes("finalizado")) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-10">
      <ScrollArea className="max-h-[100px] rounded-md border p-2 bg-background/70 backdrop-blur-sm">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <p className="text-xs mt-1">Analisando sua história...</p>
          </div>
        ) : (
          <div>
            <p className={`text-xs ${isInterim ? 'opacity-70' : ''}`}>
              {storyTranscript}
              {isInterim && <span className="animate-pulse">...</span>}
            </p>
            {recognitionStatus && !recognitionStatus.includes("finalizado") && (
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
