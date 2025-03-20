import { useState, useEffect, useRef } from 'react';

type PatternType = 'music' | 'rhythm' | 'voice-change' | null;

const usePatternDetection = (audioData: Uint8Array | null, isRecording: boolean) => {
  const [patternDetected, setPatternDetected] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>(null);
  
  // Refs for pattern detection
  const frameCountRef = useRef(0);
  const lastPatternsRef = useRef<number[]>([]);
  const detectionCooldownRef = useRef(0);
  const baselineRef = useRef<number[]>([]);
  const initialDataCollectedRef = useRef(false);
  
  // Voice profile data
  const voiceProfileRef = useRef<number[]>([]);
  const voiceChangesDetectedRef = useRef(0);
  
  // Enhanced detection constants with improved thresholds to prevent false positives
  const DETECTION_THRESHOLD = 0.95;  // Much more strict to prevent false positives (was 0.93)
  const REQUIRED_CONSISTENT_FRAMES = 90; // More frames for reliable detection (was 60)
  const COOLDOWN_FRAMES = 240; // 4 seconds of cooldown to avoid repeated detections (was 180)
  const PATTERN_MEMORY = 50; // More frames to analyze for better pattern detection (was 40)
  const MIN_AMPLITUDE = 85; // Higher limit to avoid false positives (was 70)
  const INITIAL_COLLECTION_FRAMES = 240; // Collect baseline data for 4 seconds before detection (was 180)
  const VOICE_PROFILE_SIZE = 600; // 10 seconds of voice data for the profile
  const VOICE_CHANGE_THRESHOLD = 0.62; // More flexible to prevent false positives (was 0.65)
  
  // Reset detection state at the beginning
  useEffect(() => {
    if (!isRecording) {
      resetDetection();
    }
  }, [isRecording]);
  
  useEffect(() => {
    // Don't process if not recording or if no audio data
    if (!isRecording || !audioData || audioData.length === 0) {
      return;
    }
    
    // Skip processing if in cooldown
    if (detectionCooldownRef.current > 0) {
      detectionCooldownRef.current--;
      return;
    }
    
    // Process only every fourth frame to reduce CPU usage and false positives (was third)
    frameCountRef.current++;
    if (frameCountRef.current % 4 !== 0) {
      return;
    }
    
    // Reduce the audio data to a simple pattern signature (sum of frequency bands)
    const currentPattern = Array.from(audioData).slice(1, 15); // Use more frequency bands
    
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
    
    // Voice profile collection - collect audio patterns for voice fingerprinting
    if (voiceProfileRef.current.length < VOICE_PROFILE_SIZE) {
      // Only add to voice profile if it's likely actual speech (not music or silence)
      if (avgAmplitude > MIN_AMPLITUDE && avgAmplitude < 150) {
        voiceProfileRef.current.push(...currentPattern);
        
        // Keep profile at the right size
        if (voiceProfileRef.current.length > VOICE_PROFILE_SIZE) {
          voiceProfileRef.current = voiceProfileRef.current.slice(-VOICE_PROFILE_SIZE);
        }
      }
    } else {
      // Once we have a voice profile, check for significant voice changes
      detectVoiceChanges(currentPattern);
    }
    
    // Wait for initial data collection before starting detection
    // This prevents false positives in the first few seconds of recording
    if (!initialDataCollectedRef.current) {
      if (frameCountRef.current > INITIAL_COLLECTION_FRAMES) {
        initialDataCollectedRef.current = true;
        // Initialize baseline with current data
        baselineRef.current = lastPatternsRef.current.slice(0, currentPattern.length);
        console.log("[usePatternDetection] Initial audio data collected, pattern detection active");
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
    
    // Enhanced music detection - more strict to prevent false positives
    detectMusicalPatterns(currentPattern);
    
  }, [audioData, isRecording]);
  
  /**
   * Enhanced music detection with more reliable algorithm
   */
  const detectMusicalPatterns = (currentPattern: number[]) => {
    // Look for repeating patterns
    let patternDetected = false;
    
    // Create chunks for rhythm/music pattern detection
    const chunks = [];
    for (let i = 0; i < lastPatternsRef.current.length; i += currentPattern.length) {
      if (i + currentPattern.length <= lastPatternsRef.current.length) {
        chunks.push(lastPatternsRef.current.slice(i, i + currentPattern.length));
      }
    }
    
    // Need more chunks for reliable detection (was 10)
    if (chunks.length >= 12) {
      // Compare chunks to detect repetition using a sliding window approach
      let similarChunks = 0;
      let consecutiveSimilar = 0;
      
      for (let i = 1; i < chunks.length; i++) {
        const similarity = calculateSimilarity(chunks[i-1], chunks[i]);
        
        // Enhanced detection of musical patterns
        if (similarity > DETECTION_THRESHOLD) {
          similarChunks++;
          consecutiveSimilar++;
          
          // Check for highly regular patterns (more likely to be music)
          if (i >= 3) {
            const similarity13 = calculateSimilarity(chunks[i-2], chunks[i]);
            const similarity24 = calculateSimilarity(chunks[i-3], chunks[i-1]);
            
            // If we detect a repeating pattern of high similarity every other chunk
            // This is very characteristic of music with consistent beat patterns
            if (similarity13 > 0.90 && similarity24 > 0.90) { // More strict (was 0.85)
              similarChunks += 1; // Add less boost (was 2)
            }
          }
        } else {
          consecutiveSimilar = 0;
        }
      }
      
      // More strict criteria for music detection:
      // We need more similar chunks AND a clear rhythm pattern
      // Increased both thresholds to reduce false positives
      if ((similarChunks >= Math.min(9, chunks.length - 1) && hasBeatPattern(chunks)) || 
          (similarChunks >= 12)) { // Increased from 8 and 10
        
        // Detect pattern type based on frequency distribution
        const isMusic = isMusicPattern(chunks.flat());
        
        console.log(`[usePatternDetection] Possível padrão musical detectado: ${isMusic ? 'música' : 'ritmo'}, similarChunks: ${similarChunks}`);
        
        setPatternType(isMusic ? 'music' : 'rhythm');
        setPatternDetected(true);
        
        // Set cooldown to prevent repeated detections
        detectionCooldownRef.current = COOLDOWN_FRAMES;
      }
    }
  };
  
  /**
   * Detect voice changes that might indicate trying to cheat the system
   */
  const detectVoiceChanges = (currentPattern: number[]) => {
    // Only check if we have a full voice profile
    if (voiceProfileRef.current.length >= VOICE_PROFILE_SIZE) {
      
      // Compare current audio snippet with voice profile
      let totalSimilarity = 0;
      const profileChunks = Math.floor(voiceProfileRef.current.length / currentPattern.length);
      
      for (let i = 0; i < profileChunks; i++) {
        const startIndex = i * currentPattern.length;
        const profileChunk = voiceProfileRef.current.slice(startIndex, startIndex + currentPattern.length);
        const similarity = calculateSimilarity(profileChunk, currentPattern);
        totalSimilarity += similarity;
      }
      
      // Average similarity across all profile chunks
      const avgSimilarity = totalSimilarity / profileChunks;
      
      // If similarity is below threshold, voice might have changed significantly
      if (avgSimilarity < VOICE_CHANGE_THRESHOLD) {
        voiceChangesDetectedRef.current++;
        
        // If we detect multiple voice changes in succession
        if (voiceChangesDetectedRef.current > 15) { // Increased from 12 for fewer false positives
          console.log("[usePatternDetection] Significant voice change detected");
          setPatternType('voice-change');
          setPatternDetected(true);
          
          // Reset detection counter and set cooldown
          voiceChangesDetectedRef.current = 0;
          detectionCooldownRef.current = COOLDOWN_FRAMES;
        }
      } else {
        // Gradually decrease the counter if voice matches profile
        if (voiceChangesDetectedRef.current > 0) {
          voiceChangesDetectedRef.current--;
        }
      }
    }
  };
  
  /**
   * Calculate similarity between two patterns
   */
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
  
  /**
   * Check if audio has beat patterns characteristic of music
   */
  const hasBeatPattern = (chunks: number[][]) => {
    // Extract energy over time from chunks
    const energyProfile = chunks.map(chunk => 
      chunk.reduce((sum, val) => sum + val, 0) / chunk.length
    );
    
    // Look for regular oscillations in energy (characteristic of music)
    let peakCount = 0;
    let lastPeakIndex = -1;
    const peakDistances = [];
    
    // Find peaks
    for (let i = 1; i < energyProfile.length - 1; i++) {
      if (energyProfile[i] > energyProfile[i-1] && 
          energyProfile[i] > energyProfile[i+1] &&
          energyProfile[i] > 1.25 * (energyProfile.reduce((a, b) => a + b, 0) / energyProfile.length)) { // Increased threshold
        
        peakCount++;
        
        if (lastPeakIndex !== -1) {
          peakDistances.push(i - lastPeakIndex);
        }
        
        lastPeakIndex = i;
      }
    }
    
    // If we have enough peaks, check if distances are regular
    if (peakDistances.length >= 4) { // Require more peaks (was 3)
      const avgDistance = peakDistances.reduce((a, b) => a + b, 0) / peakDistances.length;
      
      // Calculate how consistent the peak distances are
      const distanceVariance = peakDistances.reduce((sum, dist) => 
        sum + Math.abs(dist - avgDistance), 0) / peakDistances.length;
      
      // If variance is low, peaks are regularly spaced (like in music)
      // More restrictive threshold (was 0.25)
      return distanceVariance / avgDistance < 0.22;
    }
    
    return false;
  };
  
  /**
   * Determine if a pattern is likely music vs. rhythm
   */
  const isMusicPattern = (pattern: number[]): boolean => {
    // Music typically has more frequencies in mid-high range
    const lowFreqs = pattern.slice(0, Math.floor(pattern.length / 3));
    const midFreqs = pattern.slice(Math.floor(pattern.length / 3), Math.floor(2 * pattern.length / 3));
    const highFreqs = pattern.slice(Math.floor(2 * pattern.length / 3));
    
    const lowAvg = lowFreqs.reduce((sum, val) => sum + val, 0) / lowFreqs.length;
    const midAvg = midFreqs.reduce((sum, val) => sum + val, 0) / midFreqs.length;
    const highAvg = highFreqs.reduce((sum, val) => sum + val, 0) / highFreqs.length;
    
    // Enhanced music detection criteria
    // 1. Check for balanced frequency distribution (music has more harmonics)
    const isBalanced = (midAvg > lowAvg * 0.75) && (highAvg > lowAvg * 0.55);
    
    // 2. Check for strong peaks in certain frequency ranges (music instruments)
    const hasMusicPeaks = pattern.some(val => val > 175); // Increased threshold (was 160)
    
    // 3. Check the ratio between highest and lowest frequency components
    const maxVal = Math.max(...pattern);
    const minVal = Math.min(...pattern.filter(v => v > 0));
    const dynamicRange = maxVal / (minVal || 1);
    
    // Combined criteria - require more conditions to be true
    return isBalanced && hasMusicPeaks && dynamicRange > 12; // Increased threshold (was 10)
  };
  
  /**
   * Reset detection state when needed
   */
  const resetDetection = () => {
    setPatternDetected(false);
    setPatternType(null);
    initialDataCollectedRef.current = false;
    frameCountRef.current = 0;
    lastPatternsRef.current = [];
    baselineRef.current = [];
    detectionCooldownRef.current = 0;
    voiceChangesDetectedRef.current = 0;
    // Keep voice profile between sessions for better cheat detection
  };
  
  return { patternDetected, patternType, resetDetection };
};

export default usePatternDetection;
