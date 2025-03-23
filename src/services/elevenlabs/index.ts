
// Main ElevenLabs service
import { DEFAULT_VOICE_ID, AGENT_ID } from './config';
import { keyManagement } from './keyManagement';
import { textToSpeechService } from './textToSpeech';
import { audioAnalysisService } from './audioAnalysis';
import { speechToTextService } from './speechToText';

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

      // Cancel any current speech if this is a priority message
      if (priority && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      
      // Verifica se temos uma chave API válida
      if (!this.hasApiKey()) {
        console.error("ElevenLabs API key não definida, usando fallback");
        throw new Error("No API key");
      }
      
      console.log("Falando com ElevenLabs usando voice ID:", DEFAULT_VOICE_ID);
      const audioBlob = await this.textToSpeech(text, DEFAULT_VOICE_ID);
      return await this.playAudio(audioBlob);
    } catch (error) {
      console.error("Erro ao falar com ElevenLabs:", error);
      // Fallback para síntese de fala nativa
      if ('speechSynthesis' in window) {
        if (priority && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 1.0;
        
        // Procura por vozes em português
        const voices = window.speechSynthesis.getVoices();
        const brazilianVoice = voices.find(voice => voice.lang.includes('pt-BR'));
        if (brazilianVoice) {
          utterance.voice = brazilianVoice;
        }
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }
};
