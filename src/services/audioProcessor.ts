
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

// Keeps track of active speech instances to prevent overlap
let activeAudioElements: HTMLAudioElement[] = [];
let activeSpeechSynthesisUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Get the localized greeting for the selected language
 */
export const getLocalizedGreeting = (language: string): string => {
  switch (language.substring(0, 2)) {
    case 'pt':
      return "Olá! Como posso ajudar?";
    case 'en':
      return "Hello! How can I help you?";
    case 'es':
      return "¡Hola! ¿Cómo puedo ayudarte?";
    case 'fr':
      return "Bonjour! Comment puis-je vous aider?";
    case 'de':
      return "Hallo! Wie kann ich Ihnen helfen?";
    case 'it':
      return "Ciao! Come posso aiutarti?";
    case 'ru':
      return "Привет! Чем я могу помочь?";
    case 'zh':
      return "你好！我能帮你什么忙？";
    case 'ja':
      return "こんにちは！どのようにお手伝いできますか？";
    default:
      return "Hello! How can I help you?";
  }
};

/**
 * Speaks text using ElevenLabs or Web Speech API with enhanced naturalness
 */
export const speakNaturally = async (text: string, priority: boolean = false): Promise<void> => {
  try {
    // Cancel any current speech if this is priority
    if (priority) {
      // Cancel any active audio elements
      activeAudioElements.forEach(audio => {
        audio.pause();
        audio.remove();
      });
      activeAudioElements = [];
      
      // Cancel any active speech synthesis
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      if (activeSpeechSynthesisUtterance) {
        activeSpeechSynthesisUtterance = null;
      }
    } else if (window.speechSynthesis.speaking || activeAudioElements.length > 0) {
      // Skip non-priority speech if already speaking
      console.log("Already speaking, skipping non-priority speech");
      return;
    }
    
    // First try to use ElevenLabs for more natural speech if available
    if (elevenLabsService.hasApiKey()) {
      try {
        const audioBlob = await elevenLabsService.textToSpeech(text, elevenLabsService.getAgentId());
        
        // Create an audio element to play the response
        const audioElement = new Audio();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        audioElement.src = audioUrl;
        
        // Add to active elements
        activeAudioElements.push(audioElement);
        
        // Play the audio
        await new Promise<void>((resolve, reject) => {
          audioElement.onended = () => {
            // Clean up resources
            URL.revokeObjectURL(audioUrl);
            const index = activeAudioElements.indexOf(audioElement);
            if (index !== -1) {
              activeAudioElements.splice(index, 1);
            }
            audioElement.remove();
            resolve();
          };
          
          audioElement.onerror = (error) => {
            URL.revokeObjectURL(audioUrl);
            const index = activeAudioElements.indexOf(audioElement);
            if (index !== -1) {
              activeAudioElements.splice(index, 1);
            }
            audioElement.remove();
            reject(error);
          };
          
          // Small delay before playing to prevent audio overlap
          setTimeout(() => {
            audioElement.play().catch(reject);
          }, 150);
        });
        
        return;
      } catch (error) {
        console.log("ElevenLabs fallback to native TTS:", error);
        // Fall back to native TTS if ElevenLabs fails
      }
    }
    
    // Use native TTS with enhanced settings for more natural speech
    if ('speechSynthesis' in window) {
      // Create utterance with enhanced settings
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Get the current language from VOSK service or default to Portuguese
      const currentLanguage = voskService.isVoskWorking() 
        ? voskService.getCurrentLanguage() 
        : 'pt-BR';
      
      utterance.lang = currentLanguage;
      
      // Adjust pitch and rate for more natural speech
      utterance.pitch = 1.0;
      utterance.rate = 0.92; // Slightly slower for more natural pacing
      utterance.volume = 1.0;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      
      // Find the best voice for the current language
      const primaryVoice = voices.find(voice => 
        voice.lang.includes(currentLanguage) && (voice.name.includes('female') || voice.localService === true)
      );
      
      // Fallback to any voice for the language
      const fallbackVoice = voices.find(voice => 
        voice.lang.includes(currentLanguage.substring(0, 2))
      );
      
      if (primaryVoice) {
        utterance.voice = primaryVoice;
      } else if (fallbackVoice) {
        utterance.voice = fallbackVoice;
      }
      
      // Set up tracking for the current utterance
      activeSpeechSynthesisUtterance = utterance;
      
      // Clear tracking when speech finishes
      utterance.onend = () => {
        if (activeSpeechSynthesisUtterance === utterance) {
          activeSpeechSynthesisUtterance = null;
        }
      };
      
      // Add a slight pause before speaking for more natural rhythm
      setTimeout(() => {
        if (priority) {
          window.speechSynthesis.cancel(); // Ensure no other speech is happening
        }
        window.speechSynthesis.speak(utterance);
      }, 200);
    }
  } catch (error) {
    console.error("Erro ao usar TTS:", error);
  }
};
