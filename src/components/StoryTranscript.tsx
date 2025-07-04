
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Clock, LockOpen, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { calculateEarnedTime } from "@/utils/formatUtils";

interface StoryTranscriptProps {
  storyTranscript: string;
  isProcessing: boolean;
  isInterim?: boolean;
  recognitionStatus?: string;
  recordingTime?: number;
  onContinue?: () => void;
  onExit?: () => void;
  onUnlock?: (recordingTime?: number) => void;
  analysisResult?: string;
  processingComplete?: boolean;
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
  analysisResult,
  processingComplete = false
}: StoryTranscriptProps) => {
  const [showSummary, setShowSummary] = useState(false);
  const [summaryDismissed, setSummaryDismissed] = useState(false);

  // Mostra o resumo quando parte final da gravação, desde que não esteja minimizado
  useEffect(() => {
    if ((!isProcessing && !isInterim && storyTranscript && recordingTime && recordingTime > 3) ||
      processingComplete) {
      // Só mostra se ainda não foi minimizado
      if (!summaryDismissed) {
        const timer = setTimeout(() => {
          setShowSummary(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isProcessing, isInterim, storyTranscript, recordingTime, processingComplete, summaryDismissed]);

  // Reseta o modal se uma nova história começar (novo transcript)
  useEffect(() => {
    if (!storyTranscript && !isProcessing && summaryDismissed) {
      setSummaryDismissed(false);
      setShowSummary(false);
    }
  }, [storyTranscript, isProcessing, summaryDismissed]);

  if (!storyTranscript && !isProcessing && !recognitionStatus && !showSummary) return null;

  // Tempo desbloqueado conforme gravação
  const getEarnedTime = (seconds: number): number => {
    return calculateEarnedTime(seconds);
  };

  // Mostrar resumo final, com botões ajustados
  if (showSummary && recordingTime) {
    const earnedMinutes = getEarnedTime(recordingTime);

    return (
      <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/70 backdrop-blur-sm">
        <div className="max-w-md w-full mx-auto bg-card rounded-lg border shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-primary">
            <Clock className="w-6 h-6 text-primary" />
            História Concluída!
          </h3>

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
            {onContinue && (
              <Button
                onClick={() => {
                  setShowSummary(false);
                  setSummaryDismissed(true);
                  if (onContinue) onContinue();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-base flex items-center justify-center gap-2"
                size="lg"
              >
                <BookOpen className="w-5 h-5" />
                Continuar a História para Ganhar Mais Tempo
              </Button>
            )}
            {onUnlock && (
              <Button
                onClick={() => {
                  // Desbloqueia, esconde modal, impede reabertura com mesmo transcript
                  if (onUnlock) onUnlock(recordingTime);
                  setShowSummary(false);
                  setSummaryDismissed(true);
                }}
                variant="outline"
                className="w-full text-base flex items-center justify-center gap-2"
                size="lg"
              >
                <LockOpen className="w-5 h-5" />
                Desbloquear App e Finalizar
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular transcript display while gravando/processando
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
              {isInterim ? storyTranscript : recognitionStatus || ""}
              {isInterim && <span className="animate-pulse">...</span>}
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default StoryTranscript;
