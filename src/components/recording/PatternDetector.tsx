
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
      
      let message = '';
      let title = '';
      
      switch (patternType) {
        case 'music':
          title = "Música Detectada";
          message = "Ei, parece que você está reproduzindo música em vez de contar uma história. Que tal usar sua própria voz para criar uma história original?";
          break;
        
        case 'rhythm':
          title = "Ritmo Detectado";
          message = "Percebi um padrão rítmico na sua história! Isso é muito criativo!";
          break;
          
        case 'voice-change':
          title = "Mudança de Voz Detectada";
          message = "Hmm, sua voz parece ter mudado bastante. Lembre-se que o SuperLeitor é para você contar histórias com sua própria voz!";
          break;
          
        default:
          title = "Padrão Detectado";
          message = "Detectei um padrão interessante na sua história!";
      }
      
      // Show toast notification
      showToastOnly(title, message, patternType === 'music' || patternType === 'voice-change' ? 'destructive' : 'default');
      
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
