import { Button } from "@/components/ui/button";
import { Mic, Square, Loader2 } from "lucide-react";
import AudioSphere from "@/components/AudioSphere";
import RecordingControls from "@/components/RecordingControls";
import StoryTranscript from "@/components/StoryTranscript";

interface RecordingMainViewProps {
  loaded: boolean;
  isDarkMode: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  recordingTime: number;
  toggleRecording: () => void;
  audioData: Uint8Array | null;
  storyTranscript: string;
  interimTranscript: string;
  recognitionStatus?: string;
  processingComplete?: boolean;
  onContinue?: () => void;
  onUnlock?: () => void;
  analysisResult?: string;
  t?: (key: string, values?: Record<string, string | number>) => string;
}

const RecordingMainView = ({
  loaded,
  isDarkMode,
  isRecording,
  isProcessing,
  recordingTime,
  toggleRecording,
  audioData,
  storyTranscript,
  interimTranscript,
  recognitionStatus,
  processingComplete,
  onContinue,
  onUnlock,
  analysisResult,
  t,
}: RecordingMainViewProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className={`transition-all duration-1000 ease-out transform ${
        loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}>
        <div className="relative h-[500px] w-[350px] flex items-center justify-center">
          {/* Audio Visualization Sphere */}
          <AudioSphere audioData={audioData} isRecording={isRecording} isDarkMode={isDarkMode} />
          
          {/* Recording Controls */}
          <RecordingControls 
            isRecording={isRecording} 
            isProcessing={isProcessing} 
            recordingTime={recordingTime} 
            toggleRecording={toggleRecording}
            recognitionStatus={recognitionStatus}
            t={t}
          />
          
          {/* Story Transcript */}
          <StoryTranscript 
            storyTranscript={storyTranscript} 
            isProcessing={isProcessing}
            isInterim={false}
            recognitionStatus={recognitionStatus}
            recordingTime={recordingTime}
            processingComplete={processingComplete}
            onContinue={onContinue}
            onUnlock={onUnlock}
            analysisResult={analysisResult}
          />
          
          {/* Interim Transcript (shown while speaking) */}
          {interimTranscript && (
            <StoryTranscript 
              storyTranscript={interimTranscript} 
              isProcessing={false}
              isInterim={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default RecordingMainView;
