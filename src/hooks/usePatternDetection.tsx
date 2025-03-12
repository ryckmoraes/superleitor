
import { useState, useEffect, useRef } from "react";

type PatternType = 'music' | 'repetitive' | null;

const usePatternDetection = (audioData: Uint8Array | null) => {
  const [patternDetected, setPatternDetected] = useState(false);
  const [patternType, setPatternType] = useState<PatternType>(null);
  
  const historicalDataRef = useRef<Array<Uint8Array>>([]);
  const analysisCounterRef = useRef(0);
  
  // Armazena os últimos N frames de áudio para análise
  useEffect(() => {
    if (!audioData) {
      return;
    }
    
    // Adiciona os dados de áudio atuais ao histórico
    historicalDataRef.current.push(new Uint8Array(audioData));
    
    // Limita o tamanho do histórico aos últimos 50 frames
    if (historicalDataRef.current.length > 50) {
      historicalDataRef.current.shift();
    }
    
    // Analisa padrões a cada 10 frames para economizar recursos
    analysisCounterRef.current += 1;
    if (analysisCounterRef.current >= 10) {
      analysisCounterRef.current = 0;
      detectPatterns();
    }
  }, [audioData]);
  
  const detectPatterns = () => {
    const history = historicalDataRef.current;
    if (history.length < 20) {
      return; // Precisamos de pelo menos 20 frames para análise
    }
    
    // Análise de padrões musicais (ritmo regular)
    const rhythmDetected = detectRhythmPattern(history);
    if (rhythmDetected) {
      setPatternDetected(true);
      setPatternType('music');
      return;
    }
    
    // Análise de sons repetitivos
    const repetitiveDetected = detectRepetitivePattern(history);
    if (repetitiveDetected) {
      setPatternDetected(true);
      setPatternType('repetitive');
      return;
    }
    
    // Nenhum padrão detectado
    setPatternDetected(false);
    setPatternType(null);
  };
  
  // Detecta padrões rítmicos baseados na energia do áudio
  const detectRhythmPattern = (history: Array<Uint8Array>): boolean => {
    // Calcula a energia total de cada frame
    const energies = history.map(frame => {
      let sum = 0;
      for (let i = 0; i < frame.length; i++) {
        sum += frame[i];
      }
      return sum / frame.length;
    });
    
    // Procura por picos de energia em intervalos regulares
    const peakIndices: number[] = [];
    for (let i = 1; i < energies.length - 1; i++) {
      if (energies[i] > energies[i-1] && energies[i] > energies[i+1]) {
        // Pico detectado
        if (energies[i] > 50) { // Ignorar picos muito pequenos
          peakIndices.push(i);
        }
      }
    }
    
    // Verifica se os picos têm intervalos regulares
    if (peakIndices.length < 3) {
      return false;
    }
    
    // Calcula intervalos entre picos
    const intervals: number[] = [];
    for (let i = 1; i < peakIndices.length; i++) {
      intervals.push(peakIndices[i] - peakIndices[i-1]);
    }
    
    // Calcula a variância dos intervalos (quanto menor, mais regular)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, interval) => {
      return sum + Math.pow(interval - avgInterval, 2);
    }, 0) / intervals.length;
    
    // Se a variância for baixa, temos um ritmo regular
    return variance < 2.5 && avgInterval < 10;
  };
  
  // Detecta padrões repetitivos baseados na correlação entre frames
  const detectRepetitivePattern = (history: Array<Uint8Array>): boolean => {
    // Compara o frame atual com frames anteriores para detectar repetições
    const currentFrame = history[history.length - 1];
    
    // Verifica repetições nos últimos 10 frames
    let repetitionCount = 0;
    for (let i = history.length - 10; i < history.length - 1; i++) {
      if (i < 0) continue;
      
      const pastFrame = history[i];
      const correlation = calculateCorrelation(currentFrame, pastFrame);
      
      if (correlation > 0.85) { // 85% de semelhança
        repetitionCount++;
      }
    }
    
    // Se mais de 5 frames forem muito semelhantes, consideramos repetitivo
    return repetitionCount >= 5;
  };
  
  // Calcula a correlação (semelhança) entre dois arrays de áudio
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
