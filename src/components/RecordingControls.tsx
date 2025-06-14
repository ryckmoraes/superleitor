
import { Button } from "@/components/ui/button";
import { Mic, Square } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  toggleRecording: () => void;
  recognitionStatus?: string;
  t?: (key: string, values?: Record<string, string | number>) => string;
}

const RecordingControls = ({ 
  isRecording, 
  isProcessing, 
  recordingTime, 
  toggleRecording,
  recognitionStatus,
  t
}: RecordingControlsProps) => {
  return (
    <div className="absolute top-6 left-0 right-0 text-center">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">
        {isRecording ? t?.("recordingControls.storyMode") || "Modo História" : t?.("recordingControls.appName") || "SuperLeitor"}
      </h1>
      {isRecording && (
        <p className="text-sm text-muted-foreground mt-1">
          {t ? t("recordingControls.recordingTime", { time: Math.floor(recordingTime) }) : `Tempo de gravação: ${Math.floor(recordingTime)} segundos`}
          {recognitionStatus && (
            <span className="ml-2 text-xs opacity-70">{recognitionStatus}</span>
          )}
        </p>
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
                {t ? t("recordingControls.stopStory") : "Parar História"}
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                {t ? t("recordingControls.startStory") : "Iniciar História"}
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RecordingControls;
