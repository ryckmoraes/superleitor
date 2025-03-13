
import { useState, useEffect, useRef } from "react";

type PatternType = 'music' | 'repetitive' | null;

const usePatternDetection = (audioData: Uint8Array | null) => {
  const [patternDetected, setPatternDetected] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>(null);
  
  const historicalDataRef = useRef<Array<Uint8Array>>([]);
  const analysisCounterRef = useRef(0);
  const lastPatternDetectionRef = useRef<number>(0);
  
  // Stores the last N frames of audio for analysis
  useEffect(() => {
    if (!audioData) {
      return;
    }
    
    // Add current audio data to history
    historicalDataRef.current.push(new Uint8Array(audioData));
    
    // Limit history size to last 60 frames
    if (historicalDataRef.current.length > 60) {
      historicalDataRef.current.shift();
    }
    
    // Analyze patterns every 15 frames to save resources and reduce false positives
    analysisCounterRef.current += 1;
    if (analysisCounterRef.current >= 15) {
      analysisCounterRef.current = 0;
      detectPatterns();
    }
  }, [audioData]);
  
  const detectPatterns = () => {
    const history = historicalDataRef.current;
    if (history.length < 30) {
      return; // Need at least 30 frames for reliable analysis
    }
    
    // Implement cooldown period to prevent excessive pattern detection
    const now = Date.now();
    if (now - lastPatternDetectionRef.current < 10000) { // 10-second cooldown
      return;
    }
    
    // Check for background noise level
    const isQuiet = isBackgroundQuiet(history);
    if (isQuiet) {
      setPatternDetected(false);
      setPatternType(null);
      return; // Skip pattern detection during quiet periods
    }
    
    // Musical rhythm pattern detection
    const rhythmDetected = detectRhythmPattern(history);
    if (rhythmDetected) {
      setPatternDetected(true);
      setPatternType('music');
      lastPatternDetectionRef.current = now;
      return;
    }
    
    // Repetitive sound pattern detection with higher threshold
    const repetitiveDetected = detectRepetitivePattern(history);
    if (repetitiveDetected) {
      setPatternDetected(true);
      setPatternType('repetitive');
      lastPatternDetectionRef.current = now;
      return;
    }
    
    // No pattern detected
    setPatternDetected(false);
    setPatternType(null);
  };
  
  // Check if audio is mostly quiet/background noise
  const isBackgroundQuiet = (history: Array<Uint8Array>): boolean => {
    // Calculate average energy across all frames
    const avgEnergy = history.reduce((sum, frame) => {
      const frameEnergy = Array.from(frame).reduce((e, val) => e + val, 0) / frame.length;
      return sum + frameEnergy;
    }, 0) / history.length;
    
    // If average energy is low, consider it background noise
    return avgEnergy < 30;
  };
  
  // Detect rhythmic patterns based on audio energy
  const detectRhythmPattern = (history: Array<Uint8Array>): boolean => {
    // Calculate energy per frame
    const energies = history.map(frame => {
      let sum = 0;
      for (let i = 0; i < frame.length; i++) {
        sum += frame[i];
      }
      return sum / frame.length;
    });
    
    // Find energy peaks
    const peakIndices: number[] = [];
    for (let i = 2; i < energies.length - 2; i++) {
      // More strict peak detection - must be significantly higher than neighbors
      if (energies[i] > energies[i-1] * 1.5 && 
          energies[i] > energies[i-2] * 1.5 &&
          energies[i] > energies[i+1] * 1.5 && 
          energies[i] > energies[i+2] * 1.5) {
        // Only consider significant peaks
        if (energies[i] > 70) { // Higher threshold
          peakIndices.push(i);
        }
      }
    }
    
    // Need at least 4 peaks for reliable rhythm detection
    if (peakIndices.length < 4) {
      return false;
    }
    
    // Calculate intervals between peaks
    const intervals: number[] = [];
    for (let i = 1; i < peakIndices.length; i++) {
      intervals.push(peakIndices[i] - peakIndices[i-1]);
    }
    
    // Calculate variance of intervals (lower = more regular)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Stricter test for regular rhythm - lower variance and consistent interval
    return variance < 2.0 && avgInterval < 12 && avgInterval > 3;
  };
  
  // Detect repetitive patterns based on frame correlation
  const detectRepetitivePattern = (history: Array<Uint8Array>): boolean => {
    // Compare current frame with previous frames for repetition
    const currentFrame = history[history.length - 1];
    
    // Check for repetitions in the last 15 frames
    let repetitionCount = 0;
    let totalComparisons = 0;
    
    for (let i = history.length - 10; i < history.length - 1; i++) {
      if (i < 0) continue;
      
      const pastFrame = history[i];
      const correlation = calculateCorrelation(currentFrame, pastFrame);
      totalComparisons++;
      
      if (correlation > 0.92) { // Higher threshold (92% similarity required)
        repetitionCount++;
      }
    }
    
    // Require more consistent repetitions - at least 60% of comparisons must show high similarity
    return totalComparisons > 0 && (repetitionCount / totalComparisons) > 0.6;
  };
  
  // Calculate correlation (similarity) between two audio arrays
  const calculateCorrelation = (a: Uint8Array, b: Uint8Array): number => {
    if (a.length !== b.length) return 0;
    
    let sum = 0;
    let sumA = 0;
    let sumB = 0;
    
    for (let i = 0; i < a.length; i++) {
      sumA += a[i];
      sumB += b[i];
    }
    
    const avgA = sumA / a.length;
    const avgB = sumB / b.length;
    
    // If either array has very low average energy, skip correlation
    if (avgA < 20 || avgB < 20) return 0;
    
    let numerator = 0;
    let denominatorA = 0;
    let denominatorB = 0;
    
    for (let i = 0; i < a.length; i++) {
      const diffA = a[i] - avgA;
      const diffB = b[i] - avgB;
      numerator += diffA * diffB;
      denominatorA += diffA * diffA;
      denominatorB += diffB * diffB;
    }
    
    if (denominatorA === 0 || denominatorB === 0) return 0;
    
    return numerator / Math.sqrt(denominatorA * denominatorB);
  };
  
  return {
    patternDetected,
    patternType
  };
};

export default usePatternDetection;
