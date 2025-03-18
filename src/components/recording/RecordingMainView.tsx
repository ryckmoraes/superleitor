
import { useEffect } from 'react';
import RecordingControls from "@/components/RecordingControls";
import AudioSphere from "@/components/AudioSphere";
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
  recognitionStatus: string;
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
  recognitionStatus
}: RecordingMainViewProps) => {
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center justify-center min-h-screen ${
      isDarkMode 
        ? "bg-gradient-to-b from-background to-background/90" 
        : "bg-gradient-to-b from-background to-background/90"
    } overflow-hidden`}>
      <div 
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-1000 ease-out transform ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <RecordingControls 
          isRecording={isRecording}
          isProcessing={isProcessing}
          recordingTime={recordingTime}
          toggleRecording={toggleRecording}
          recognitionStatus={recognitionStatus}
        />
        
        <div className="w-full max-w-[500px] h-[500px] flex items-center justify-center">
          <AudioSphere audioData={audioData} isRecording={isRecording} />
        </div>
        
        <StoryTranscript 
          storyTranscript={interimTranscript || storyTranscript}
          isProcessing={isProcessing}
          isInterim={!!interimTranscript}
          recognitionStatus={recognitionStatus}
        />
      </div>
    </div>
  );
};

export default RecordingMainView;
