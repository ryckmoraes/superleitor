import { useState, useEffect, useRef } from "react";

const useAudioAnalyzer = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const significantAudioDetectedRef = useRef(false);
  const consecutiveAudioDetectionsRef = useRef(0);
  const silenceCountRef = useRef(0);
  const recordingStartedRef = useRef(false);

  const startRecording = async () => {
    try {
      // Reset states
      setErrorMessage(null);
      setRecordingTime(0);
      significantAudioDetectedRef.current = false;
      consecutiveAudioDetectionsRef.current = 0;
      silenceCountRef.current = 0;
      recordingStartedRef.current = false;
      
      // Request audio permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      streamRef.current = stream;
      
      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyserRef.current = analyser;
      
      // Connect to audio source
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Configure analyzer
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      dataArrayRef.current = dataArray;
      
      // Start analysis loop with improved audio detection
      const analyzeAudio = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        
        // IMPROVED: More reliable audio detection with threshold and consecutive frames
        const audioValues = Array.from(dataArrayRef.current);
        const average = audioValues.reduce((sum, val) => sum + val, 0) / audioValues.length;
        
        // Higher threshold to better distinguish actual speech from background noise
        const significantAudio = average > 20;
        
        if (significantAudio) {
          consecutiveAudioDetectionsRef.current++;
          silenceCountRef.current = 0;
        } else {
          silenceCountRef.current++;
          if (silenceCountRef.current > 15) { // Longer silence required to reset detection
            consecutiveAudioDetectionsRef.current = Math.max(0, consecutiveAudioDetectionsRef.current - 1);
          }
        }
        
        // Start timer after 5 consecutive detections to avoid false triggers
        if (consecutiveAudioDetectionsRef.current >= 5 && !significantAudioDetectedRef.current) {
          significantAudioDetectedRef.current = true;
          recordingStartedRef.current = true;
          console.log("Significant audio detected, starting timer now");
          
          // Start timer now
          recordingStartTimeRef.current = Date.now();
          
          if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
          }
          
          timerIntervalRef.current = setInterval(() => {
            if (recordingStartTimeRef.current) {
              const elapsed = (Date.now() - recordingStartTimeRef.current) / 1000;
              setRecordingTime(elapsed);
            }
          }, 1000);
        }
        
        setAudioData(new Uint8Array(dataArrayRef.current));
        
        animationFrameRef.current = requestAnimationFrame(analyzeAudio);
      };
      
      analyzeAudio();
      
      // Set up MediaRecorder to capture audio for processing
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.log("No audio chunks recorded");
          setAudioBlob(null);
          return;
        }
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log("Audio recording completed, size:", audioBlob.size, "bytes");
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      
      mediaRecorder.start(1000); // Collect data in 1-second chunks
      
      setIsRecording(true);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setErrorMessage("Acesso ao microfone negado. Por favor, permita o acesso ao microfone e tente novamente.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop the timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    
    // Reset refs
    analyserRef.current = null;
    dataArrayRef.current = null;
    
    // Keep recording time and significant audio detection for displaying final summary
    // significantAudioDetectedRef.current = false;
    // consecutiveAudioDetectionsRef.current = 0;
    silenceCountRef.current = 0;
    
    setAudioData(null);
    setIsRecording(false);
    // Don't reset recordingTime here to display total time at the end
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { 
    isRecording, 
    audioData, 
    errorMessage, 
    startRecording, 
    stopRecording,
    recordingTime,
    audioBlob,
    hasStartedRecording: recordingStartedRef.current
  };
};

export default useAudioAnalyzer;
