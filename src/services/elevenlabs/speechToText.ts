
// ElevenLabs speech-to-text service
import { ELEVENLABS_API_URL } from './config';
import { keyManagement } from './keyManagement';

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
    
    // Create form data with the audio blob
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');
    formData.append('language', 'pt'); // Portuguese
    
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
