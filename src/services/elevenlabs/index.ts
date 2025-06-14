// Main ElevenLabs service
import { DEFAULT_VOICE_ID, AGENT_ID } from './config';
import { keyManagement } from './keyManagement';
import { textToSpeechService } from './textToSpeech';
import { audioAnalysisService } from './audioAnalysis';
import { speechToTextService } from './speechToText';
import { voskModelsService } from '../voskModelsService';

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
  
  // Speech to text
  transcribeAudio: speechToTextService.transcribeAudio,
  
  // Speak text directly (convert and play)
  async speak(text: string, priority: boolean = false): Promise<void> {
    try {
      // Skip if empty text or already speaking with non-priority
      if (!text || (window.speechSynthesis.speaking && !priority)) {
        return;
      }

      // Cancel current if priority required
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      if (!this.hasApiKey()) {
        console.error("ElevenLabs API key não definida, usando fallback");
        throw new Error("No API key");
      }
      
      console.log("Falando com ElevenLabs usando voice ID:", DEFAULT_VOICE_ID);
      const audioBlob = await this.textToSpeech(text, DEFAULT_VOICE_ID);
      return await this.playAudio(audioBlob);
    } catch (error) {
      // Fallback para síntese de fala nativa
      if ('speechSynthesis' in window) {
        if (priority && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        // NOVO: idioma do modelo VOSK atual
        const lang = voskModelsService.getCurrentLanguage() || 'pt-BR';
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find(voice => voice.lang.includes(lang));
        if (match) {
          utterance.voice = match;
        }
        window.speechSynthesis.speak(utterance);
      }
    }
  }
};
