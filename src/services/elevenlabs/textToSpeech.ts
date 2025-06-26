
// ElevenLabs text-to-speech service
import { ELEVENLABS_API_URL, DEFAULT_MODEL, DEFAULT_VOICE_SETTINGS } from './config';
import { TextToSpeechRequest } from './types';
import { keyManagement } from './keyManagement';

/**
 * Service for converting text to speech using ElevenLabs
 */
export const textToSpeechService = {
  // Convert text to speech and return the audio blob
  async textToSpeech(
    text: string, 
    voiceId: string
  ): Promise<Blob> {
    const apiKey = await keyManagement.getApiKey();
    
    if (!apiKey) {
      throw new Error("ElevenLabs API key not set");
    }
    
    const requestBody: TextToSpeechRequest = {
      text,
      model_id: DEFAULT_MODEL,
      voice_settings: DEFAULT_VOICE_SETTINGS
    };
    
    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", errorText);
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    return await response.blob();
  },
  
  // Play audio from a blob
  async playAudio(audioBlob: Blob): Promise<void> {
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }
};
