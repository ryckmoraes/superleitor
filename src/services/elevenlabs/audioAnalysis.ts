
// ElevenLabs audio analysis service
import { AGENT_ID } from './config';
import { speechToTextService } from './speechToText';
import { responseGenerationService } from './responseGeneration';
import { keyManagement } from './keyManagement';

/**
 * Service for analyzing audio with ElevenLabs
 */
export const audioAnalysisService = {
  // Analyze audio using ElevenLabs
  async analyzeAudio(audioBlob: Blob): Promise<string> {
    console.log("Analyzing audio with ElevenLabs agent ID:", AGENT_ID);
    
    if (!keyManagement.hasApiKey()) {
      console.error("ElevenLabs API key not set");
      throw new Error("ElevenLabs API key not set");
    }
    
    try {
      // First, transcribe the audio with ElevenLabs
      const transcript = await speechToTextService.transcribeAudio(audioBlob);
      console.log("ElevenLabs transcription:", transcript);
      
      // Generate a response based on the transcription using the specific agent
      const response = await responseGenerationService.generateResponse(transcript);
      console.log("ElevenLabs agent response:", response);
      
      return response;
    } catch (error) {
      console.error("Error analyzing audio with ElevenLabs:", error);
      return "Adorei sua história! Pode me contar mais detalhes?";
    }
  }
};
