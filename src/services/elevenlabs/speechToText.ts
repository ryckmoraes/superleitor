
// ElevenLabs speech-to-text service
import { ELEVENLABS_API_URL } from './config';
import { keyManagement } from './keyManagement';
import { voskService } from '../voskService';

/**
 * Service for transcribing audio using ElevenLabs
 */
export const speechToTextService = {
  // Transcribe audio using ElevenLabs speech-to-text
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const apiKey = keyManagement.getApiKey();
    
    if (!apiKey) {
      throw new Error("ElevenLabs API key not set");
    }
    
    // Get the current language code
    const currentLanguage = voskService.isVoskWorking() 
      ? voskService.getCurrentLanguage() 
      : 'pt-BR';
    
    // Convert to two-letter code for ElevenLabs API
    const languageCode = currentLanguage.substring(0, 2);
    
    // Create form data with the audio blob
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('language', languageCode); // Use current language
    
    try {
      const response = await fetch(
        // Using the speech-to-text endpoint
        `${ELEVENLABS_API_URL}/speech-to-text`,
        {
          method: "POST",
          headers: {
            "xi-api-key": apiKey
          },
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("ElevenLabs speech-to-text API error:", errorText);
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.text || "";
    } catch (error) {
      console.error("Error transcribing audio with ElevenLabs:", error);
      throw error;
    }
  }
};
