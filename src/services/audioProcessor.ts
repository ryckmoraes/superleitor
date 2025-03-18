
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
  // Remove filler words and hesitations
  let cleanTranscript = transcript.replace(/\b(?:hm+|uhm+|ah+|er+|um+)\b/gi, '');

  // Remove redundant words and phrases
  cleanTranscript = cleanTranscript.replace(/\b(?:I mean|you know|like)\b/gi, '');

  // Remove starting conjunctions
  cleanTranscript = cleanTranscript.replace(/^(and|but|so|or)\s+/i, '');

  // Remove stuttering
  cleanTranscript = cleanTranscript.replace(/\b(\w+)\s+\1\b/gi, '$1');

  // Trim whitespace
  cleanTranscript = cleanTranscript.trim();

  return cleanTranscript;
};

/**
 * Generates a simple response based on the transcript.
 * @param {string} transcript - The transcript to generate a response for.
 * @returns {string} - The generated response.
 */
export const generateSimpleResponse = (transcript: string): string => {
  // Basic sentiment analysis
  const positiveKeywords = ['good', 'great', 'amazing', 'fantastic', 'wonderful', 'happy', 'excited'];
  const negativeKeywords = ['bad', 'terrible', 'awful', 'sad', 'upset', 'angry', 'frustrated'];

  let sentimentScore = 0;
  positiveKeywords.forEach(keyword => {
    if (transcript.toLowerCase().includes(keyword)) sentimentScore++;
  });
  negativeKeywords.forEach(keyword => {
    if (transcript.toLowerCase().includes(keyword)) sentimentScore--;
  });

  if (sentimentScore > 0) {
    return "Que bom que você está se sentindo bem! Continue contando!";
  } else if (sentimentScore < 0) {
    return "Sinto muito que você não esteja se sentindo bem. Conte-me mais para que eu possa ajudar.";
  } else {
    return "Continue contando! Estou adorando ouvir sua história.";
  }
};

import { elevenLabsService } from './elevenLabsService';

/**
 * Speaks text using ElevenLabs voice service
 * Falls back to Web Speech API if ElevenLabs is not available
 */
export const speakNaturally = async (text: string, priority: boolean = false): Promise<void> => {
  try {
    // Always try to use ElevenLabs for speech synthesis
    return await elevenLabsService.speak(text, priority);
  } catch (error) {
    console.error("Error in speakNaturally with ElevenLabs:", error);
    
    // Fall back to native TTS
    if ('speechSynthesis' in window) {
      // Cancel any current speech if this is a priority message
      if (priority && speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      
      // Adjust pitch and rate for natural sounding speech
      utterance.pitch = 1.0;
      utterance.rate = 1.0;
      
      // Find a good voice if available
      const voices = speechSynthesis.getVoices();
      const brazilianVoice = voices.find(voice => voice.lang.includes('pt-BR'));
      const portugueseVoice = voices.find(voice => voice.lang.includes('pt'));
      
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      } else if (portugueseVoice) {
        utterance.voice = portugueseVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  }
};
