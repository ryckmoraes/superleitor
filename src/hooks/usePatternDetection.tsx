
import { useState, useEffect, useRef } from 'react';

type PatternType = 'music' | 'rhythm' | null;

const usePatternDetection = (audioData: Uint8Array | null) => {
  const [patternDetected, setPatternDetected] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>(null);
  
  // Refs for pattern detection
  const frameCountRef = useRef(0);
  const lastPatternsRef = useRef<number[]>([]);
  const detectionCooldownRef = useRef(0);
  const baselineRef = useRef<number[]>([]);
  const initialDataCollectedRef = useRef(false);
  
  // Much less sensitive constants for pattern detection
  const DETECTION_THRESHOLD = 0.95;  // Increased from 0.85 for much less sensitivity
  const REQUIRED_CONSISTENT_FRAMES = 45; // Increased from 30 for much more reliable detection
  const COOLDOWN_FRAMES = 240; // ~4 seconds at 60fps to prevent repeated detections
  const PATTERN_MEMORY = 30; // More frames to analyze
  const MIN_AMPLITUDE = 60; // Significantly increased from 30 to avoid false positives
  const INITIAL_COLLECTION_FRAMES = 120; // Collect baseline data for 2 seconds before detection
  
  useEffect(() => {
    if (!audioData || audioData.length === 0) {
      return;
    }
    
    // Skip processing if in cooldown
    if (detectionCooldownRef.current > 0) {
      detectionCooldownRef.current--;
      return;
    }
    
    // Process only every third frame to reduce CPU usage and false positives
    frameCountRef.current++;
    if (frameCountRef.current % 3 !== 0) {
      return;
    }
    
    // Reduce the audio data to a simple pattern signature (sum of frequency bands)
    const currentPattern = Array.from(audioData).slice(1, 12);
    
    // Calculate average amplitude of current pattern
    const avgAmplitude = currentPattern.reduce((sum, val) => sum + val, 0) / currentPattern.length;
    
    // Skip low amplitude audio (silence or background noise)
    if (avgAmplitude < MIN_AMPLITUDE) {
      return;
    }
    
    // Store the pattern
    lastPatternsRef.current.push(...currentPattern);
    
    // Keep only the most recent patterns
    if (lastPatternsRef.current.length > PATTERN_MEMORY * currentPattern.length) {
      lastPatternsRef.current = lastPatternsRef.current.slice(-PATTERN_MEMORY * currentPattern.length);
    }
    
    // Wait for initial data collection before starting detection
    // This prevents false positives in the first few seconds of recording
    if (!initialDataCollectedRef.current) {
      if (frameCountRef.current > INITIAL_COLLECTION_FRAMES) {
        initialDataCollectedRef.current = true;
        // Initialize baseline with current data
        baselineRef.current = lastPatternsRef.current.slice(0, currentPattern.length);
        console.log("Initial audio data collected, pattern detection active");
      } else {
        // Still collecting initial data
        return;
      }
    }
    
    // Initialize baseline if needed
    if (baselineRef.current.length === 0 && lastPatternsRef.current.length >= currentPattern.length * 5) {
      baselineRef.current = lastPatternsRef.current.slice(0, currentPattern.length);
    }
    
    // Need enough data for pattern detection
    if (lastPatternsRef.current.length < currentPattern.length * 3 || !baselineRef.current.length) {
      return;
    }
    
    // Look for repeating patterns
    let patternDetected = false;
    
    // Check for rhythm/music patterns (repeating amplitude patterns)
    const chunks = [];
    for (let i = 0; i < lastPatternsRef.current.length; i += currentPattern.length) {
      if (i + currentPattern.length <= lastPatternsRef.current.length) {
        chunks.push(lastPatternsRef.current.slice(i, i + currentPattern.length));
      }
    }
    
    if (chunks.length >= 6) { // Require more chunks for detection (increased from 4)
      // Compare chunks to detect repetition
      let similarChunks = 0;
      
      for (let i = 1; i < chunks.length; i++) {
        const similarity = calculateSimilarity(chunks[i-1], chunks[i]);
        if (similarity > DETECTION_THRESHOLD) {
          similarChunks++;
        }
      }
      
      // If we have enough similar consecutive chunks, pattern detected
      // Require more consecutive similar chunks (increased from 4)
      if (similarChunks >= Math.min(6, chunks.length - 1)) {
        // Detect pattern type based on frequency distribution
        const isMusic = isMusicPattern(chunks.flat());
        
        setPatternType(isMusic ? 'music' : 'rhythm');
        patternDetected = true;
      }
    }
    
    // Update detection state
    if (patternDetected) {
      setPatternDetected(true);
      // Set cooldown to prevent repeated detections
      detectionCooldownRef.current = COOLDOWN_FRAMES;
    }
  }, [audioData]);
  
  // Calculate similarity between two patterns
  const calculateSimilarity = (pattern1: number[], pattern2: number[]): number => {
    if (pattern1.length !== pattern2.length) return 0;
    
    let similarity = 0;
    for (let i = 0; i < pattern1.length; i++) {
      // Calculate how similar the two values are (0-1)
      const maxVal = Math.max(pattern1[i], pattern2[i]);
      const minVal = Math.min(pattern1[i], pattern2[i]);
      
      // Avoid division by zero
      if (maxVal < 1) continue;
      
      similarity += minVal / maxVal;
    }
    
    return similarity / pattern1.length;
  };
  
  // Determine if a pattern is likely music vs. rhythm
  const isMusicPattern = (pattern: number[]): boolean => {
    // Music typically has more frequencies in mid-high range
    const lowFreqs = pattern.slice(0, Math.floor(pattern.length / 3));
    const midFreqs = pattern.slice(Math.floor(pattern.length / 3), Math.floor(2 * pattern.length / 3));
    const highFreqs = pattern.slice(Math.floor(2 * pattern.length / 3));
    
    const lowAvg = lowFreqs.reduce((sum, val) => sum + val, 0) / lowFreqs.length;
    const midAvg = midFreqs.reduce((sum, val) => sum + val, 0) / midFreqs.length;
    const highAvg = highFreqs.reduce((sum, val) => sum + val, 0) / highFreqs.length;
    
    // Music often has more balanced frequency distribution
    return (midAvg > lowAvg * 0.7) && (highAvg > lowAvg * 0.5);
  };
  
  // Reset detection state when needed (e.g., when starting a new recording)
  const resetDetection = () => {
    setPatternDetected(false);
    setPatternType(null);
    initialDataCollectedRef.current = false;
    frameCountRef.current = 0;
    lastPatternsRef.current = [];
    baselineRef.current = [];
    detectionCooldownRef.current = 0;
  };
  
  return { patternDetected, patternType, resetDetection };
};

export default usePatternDetection;
