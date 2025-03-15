
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
  
  return (
    <div className="absolute bottom-32 px-6 w-full max-w-md mx-auto">
      <ScrollArea className="h-[150px] rounded-md border p-4 bg-card/50 backdrop-blur-sm">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm mt-2">Analisando sua história...</p>
          </div>
        ) : (
          <div>
            <p className={`text-sm ${isInterim ? 'opacity-70' : ''}`}>
              {storyTranscript}
              {isInterim && <span className="animate-pulse">...</span>}
            </p>
            {recognitionStatus && (
              <p className="text-xs text-muted-foreground mt-2 italic">
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
