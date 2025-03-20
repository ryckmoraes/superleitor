
import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import usePatternDetection from "@/hooks/usePatternDetection";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";

interface PatternDetectorProps {
  audioData: Uint8Array | null;
  isRecording: boolean;
}

// Define the ref type
export interface PatternDetectorRef {
  resetPatternDetection: () => void;
}

const PatternDetector = forwardRef<PatternDetectorRef, PatternDetectorProps>(
  ({ audioData, isRecording }, ref) => {
    const { patternDetected, patternType, resetDetection } = usePatternDetection(audioData, isRecording);
    const patternNotifiedRef = useRef(false);
    const patternDetectionCountRef = useRef(0);
    
    // Expose resetDetection to parent components through ref
    useImperativeHandle(ref, () => ({
      resetPatternDetection: () => {
        resetDetection();
        patternNotifiedRef.current = false;
        patternDetectionCountRef.current = 0;
      }
    }));
    
    // Reset detection when needed
    useEffect(() => {
      if (!isRecording) {
        resetDetection();
        patternNotifiedRef.current = false;
        patternDetectionCountRef.current = 0;
      }
    }, [isRecording, resetDetection]);

    // Handle pattern detection only when recording
    useEffect(() => {
      // Só processa detecções se estiver gravando e se tiver um padrão detectado que ainda não foi notificado
      if (patternDetected && !patternNotifiedRef.current && isRecording) {
        // Increment count of detections for the same pattern
        patternDetectionCountRef.current++;
        
        // Only notify if we've detected the pattern multiple times
        // This helps prevent false positives, especially for music detection
        if (patternDetectionCountRef.current >= 3) {
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
          
          // Logs para debug
          console.log(`[PatternDetector] Padrão detectado: ${patternType}`);
          
          // Show toast notification
          showToastOnly(title, message, patternType === 'music' || patternType === 'voice-change' ? 'destructive' : 'default');
          
          // Ensure notification is spoken
          setTimeout(() => {
            speakNaturally(message, true);
          }, 500);
          
          // Reset notification after a time to allow future notifications
          setTimeout(() => {
            patternNotifiedRef.current = false;
            patternDetectionCountRef.current = 0;
          }, 15000); // Longer timeout to prevent too many notifications
        }
      }
    }, [patternDetected, patternType, isRecording]);

    return null; // This is a behavior component, not a visual one
  }
);

PatternDetector.displayName = "PatternDetector";

export default PatternDetector;
