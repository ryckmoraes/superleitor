
import { voskService } from './voskService';
import { elevenLabsService } from './elevenlabs';

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
 * Speaks text using Web Speech API with enhanced naturalness
 */
export const speakNaturally = async (text: string, priority: boolean = false): Promise<void> => {
  try {
    // First try to use ElevenLabs for more natural speech if available
    if (elevenLabsService.hasApiKey()) {
      try {
        await elevenLabsService.speak(text, priority);
        return;
      } catch (error) {
        console.log("ElevenLabs fallback to native TTS:", error);
        // Fall back to native TTS if ElevenLabs fails
      }
    }
    
    // Use native TTS with enhanced settings for more natural speech
    if ('speechSynthesis' in window) {
      // Cancel any current speech if this is prioritary
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // Adjust pitch and rate for more natural speech
      utterance.pitch = 1.0;
      utterance.rate = 0.95; // Slightly slower for more natural pacing
      utterance.volume = 1.0;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      
      // Find the best Portuguese voice available
      const brazilianVoice = voices.find(voice => 
        voice.lang.includes('pt-BR') && (voice.name.includes('female') || voice.localService === true)
      );
      const portugueseVoice = voices.find(voice => 
        voice.lang.includes('pt') && (voice.name.includes('female') || voice.localService === true)
      );
      
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      } else if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }
      
      // Add a slight pause before speaking for more natural rhythm
      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 50);
    }
  } catch (error) {
    console.error("Erro ao usar TTS:", error);
  }
};
