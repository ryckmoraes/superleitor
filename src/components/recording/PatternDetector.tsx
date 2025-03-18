
import { useEffect, useRef } from "react";
import usePatternDetection from "@/hooks/usePatternDetection";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";

interface PatternDetectorProps {
  audioData: Uint8Array | null;
  isRecording: boolean;
}

const PatternDetector = ({ audioData, isRecording }: PatternDetectorProps) => {
  const { patternDetected, patternType, resetDetection } = usePatternDetection(audioData);
  const patternNotifiedRef = useRef(false);
  
  // Reset detection when needed
  useEffect(() => {
    if (!isRecording) {
      resetDetection();
      patternNotifiedRef.current = false;
    }
  }, [isRecording, resetDetection]);

  // Handle pattern detection
  useEffect(() => {
    if (patternDetected && !patternNotifiedRef.current && isRecording) {
      patternNotifiedRef.current = true;
      
      // Create natural message
      const message = `Ei, percebi um padrão de ${patternType === 'music' ? 'música' : 'ritmo'} na sua história! Que legal!`;
      
      // Show toast notification only
      showToastOnly("Padrão Detectado", message);
      
      // Ensure notification is spoken
      setTimeout(() => {
        speakNaturally(message, true);
      }, 500);
      
      // Reset notification after a time to allow future notifications
      setTimeout(() => {
        patternNotifiedRef.current = false;
      }, 15000); // Longer timeout to prevent too many notifications
    }
  }, [patternDetected, patternType, isRecording]);

  return null; // This is a behavior component, not a visual one
};

export default PatternDetector;
