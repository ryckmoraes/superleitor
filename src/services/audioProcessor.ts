
import { voskService } from './voskService';

/**
 * Initializes available voices for speech synthesis.
 * @returns {Promise<boolean>} - Resolves with true if voices are initialized, false otherwise.
 */
export const initVoices = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    let voices = window.speechSynthesis.getVoices();

    if (voices.length) {
      resolve(true);
      return;
    }

    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(true);
    };
  });
};

/**
 * Processes the recognition result to clean up the transcript.
 * @param {string} transcript - The transcript to process.
 * @returns {string} - The cleaned transcript.
 */
export const processRecognitionResult = (transcript: string): string => {
  // Trim whitespace
  return transcript.trim();
};

/**
 * Speaks text using Web Speech API
 */
export const speakNaturally = async (text: string, priority: boolean = false): Promise<void> => {
  try {
    // Cancela qualquer fala atual se esta for prioritária
    if (priority && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    // Usa o TTS nativo
    if ('speechSynthesis' in window) {
      // Cancela qualquer fala atual se esta for prioritária
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // Ajusta pitch e rate para uma fala mais natural
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      
      // Procura uma boa voz se disponível
      const voices = window.speechSynthesis.getVoices();
      const brazilianVoice = voices.find(voice => voice.lang.includes('pt-BR'));
      const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
      
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      } else if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  } catch (error) {
    console.error("Erro ao usar TTS:", error);
  }
};
