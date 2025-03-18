
// Main ElevenLabs service
import { DEFAULT_VOICE_ID, AGENT_ID } from './config';
import { keyManagement } from './keyManagement';
import { textToSpeechService } from './textToSpeech';
import { audioAnalysisService } from './audioAnalysis';

/**
 * Main ElevenLabs service for text-to-speech functionality
 */
export const elevenLabsService = {
  // API key management
  getApiKey: keyManagement.getApiKey,
  setApiKey: keyManagement.setApiKey,
  hasApiKey: keyManagement.hasApiKey,
  clearApiKey: keyManagement.clearApiKey,
  
  // Get the agent ID
  getAgentId: (): string => {
    return AGENT_ID;
  },
  
  // Text to speech conversion
  textToSpeech: textToSpeechService.textToSpeech,
  playAudio: textToSpeechService.playAudio,
  
  // Audio analysis
  analyzeAudio: audioAnalysisService.analyzeAudio,
  
  // Speak text directly (convert and play)
  async speak(text: string, priority: boolean = false): Promise<void> {
    try {
      // Skip if empty text or already speaking with non-priority
      if (!text || (window.speechSynthesis.speaking && !priority)) {
        return;
      }

      // Cancel any current speech if this is a priority message
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // Always use ElevenLabs for voice with our specific voice ID
      console.log("Speaking with ElevenLabs voice ID:", DEFAULT_VOICE_ID);
      const audioBlob = await this.textToSpeech(text, DEFAULT_VOICE_ID);
      return await this.playAudio(audioBlob);
    } catch (error) {
      console.error("Error speaking with ElevenLabs:", error);
      // Fallback to native speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }
};
