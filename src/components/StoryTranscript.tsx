
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, BookOpen } from "lucide-react";

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
  
  // Mostrar a caixa mesmo se for apenas status, para melhor feedback
  
  return (
    <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-10">
      <ScrollArea className="max-h-[150px] rounded-md border p-3 bg-background/90 backdrop-blur-sm shadow-lg">
        {isProcessing ? (
          <div className="flex flex-col items-center justify-center h-full py-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-sm mt-1 font-medium">Analisando sua história...</p>
          </div>
        ) : (
          <div className="relative pl-7">
            <BookOpen className="absolute left-0 top-1 h-4 w-4 text-primary opacity-70" />
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
