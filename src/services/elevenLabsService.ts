
// ElevenLabs voice API service
// This service manages voice synthesis and conversation analysis using the ElevenLabs API

// Configuration constants
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_VOICE_ID = "eNwyboGu8S4QiAWXpwUM"; // The specified voice ID
const DEFAULT_MODEL = "eleven_multilingual_v2"; // Higher quality model

// Types for our API calls
interface TextToSpeechRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface AnalyzeAudioRequest {
  audio: Blob;
  language?: string;
}

// Main ElevenLabs service for text-to-speech functionality
export const elevenLabsService = {
  // Get the API key from session storage
  getApiKey: (): string | null => {
    return sessionStorage.getItem('elevenlabs_api_key');
  },

  // Set the API key in session storage
  setApiKey: (apiKey: string): void => {
    sessionStorage.setItem('elevenlabs_api_key', apiKey);
    console.log("ElevenLabs API key set:", apiKey.substring(0, 3) + "...");
  },
  
  // Check if the API key exists
  hasApiKey: (): boolean => {
    const apiKey = sessionStorage.getItem('elevenlabs_api_key');
    return !!apiKey && apiKey.length > 0;
  },
  
  // Clear the API key
  clearApiKey: (): void => {
    sessionStorage.removeItem('elevenlabs_api_key');
  },

  // Convert text to speech and return the audio blob
  async textToSpeech(
    text: string, 
    voiceId: string = DEFAULT_VOICE_ID,
    modelId: string = DEFAULT_MODEL
  ): Promise<Blob> {
    const apiKey = elevenLabsService.getApiKey();
    
    if (!apiKey) {
      throw new Error("ElevenLabs API key not set");
    }
    
    const requestBody: TextToSpeechRequest = {
      text,
      model_id: modelId,
      voice_settings: {
        stability: 0.5,        // Medium stability for natural variations
        similarity_boost: 0.75, // High similarity for consistent voice
        use_speaker_boost: true
      }
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
  
  // Analyze audio using ElevenLabs
  async analyzeAudio(audioBlob: Blob): Promise<string> {
    // Skip Gemini and directly use ElevenLabs
    console.log("Analyzing audio with ElevenLabs");
    
    const apiKey = elevenLabsService.getApiKey();
    
    if (!apiKey) {
      console.error("ElevenLabs API key not set");
      throw new Error("ElevenLabs API key not set");
    }
    
    try {
      // First, transcribe the audio with ElevenLabs
      const transcript = await this.transcribeAudio(audioBlob);
      console.log("ElevenLabs transcription:", transcript);
      
      // Generate a response based on the transcription
      const response = await this.generateResponse(transcript);
      console.log("ElevenLabs generated response:", response);
      
      return response;
    } catch (error) {
      console.error("Error analyzing audio with ElevenLabs:", error);
      return "Adorei sua história! Pode me contar mais detalhes?";
    }
  },
  
  // Transcribe audio using ElevenLabs speech-to-text
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const apiKey = elevenLabsService.getApiKey();
    
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
  },
  
  // Generate a response based on the transcription
  async generateResponse(transcription: string): Promise<string> {
    // If transcription is empty or too short, return a generic response
    if (!transcription || transcription.length < 3) {
      return "Não consegui entender bem. Pode repetir de forma mais clara?";
    }
    
    try {
      // Generate a custom response based on the transcription
      // Using pattern matching for common scenarios
      
      if (transcription.toLowerCase().includes("olá") || 
          transcription.toLowerCase().includes("oi") || 
          transcription.toLowerCase().includes("bom dia") || 
          transcription.toLowerCase().includes("boa tarde") || 
          transcription.toLowerCase().includes("boa noite")) {
        return "Olá! Que bom ouvir você. Como posso ajudar com sua leitura hoje?";
      }
      
      if (transcription.toLowerCase().includes("música") || 
          transcription.toLowerCase().includes("cantar") || 
          transcription.toLowerCase().includes("canção")) {
        return "Percebi que você mencionou música! As histórias com ritmo são muito envolventes!";
      }
      
      if (transcription.toLowerCase().includes("livro") || 
          transcription.toLowerCase().includes("história") || 
          transcription.toLowerCase().includes("leitura")) {
        return "Adoro histórias! Continue contando, estou ouvindo atentamente.";
      }
      
      if (transcription.toLowerCase().includes("pergunta") || 
          transcription.toLowerCase().includes("dúvida") || 
          transcription.toLowerCase().includes("como")) {
        return "Que pergunta interessante! Adoro quando as crianças são curiosas assim!";
      }
      
      // Check for animal mentions
      const animals = ["cachorro", "gato", "leão", "tigre", "elefante", "girafa", "macaco", "zebra", "pássaro"];
      for (const animal of animals) {
        if (transcription.toLowerCase().includes(animal)) {
          return `Você mencionou um ${animal}! Que legal! Os animais são personagens maravilhosos nas histórias!`;
        }
      }
      
      // Default enthusiastic responses
      const responses = [
        "Que história incrível! Continue contando, estou adorando!",
        "Nossa, que legal! E o que aconteceu depois?",
        "Que imaginação maravilhosa você tem! Continue sua história!",
        "Estou encantada com sua história! Pode me contar mais?",
        "Que aventura emocionante! Mal posso esperar para ouvir o resto!",
        "Uau! Sua história é muito criativa! Continue contando!",
        "Adorei o que você contou até agora! O que acontece em seguida?"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error("Error generating response from ElevenLabs:", error);
      return "Sua história é fascinante! Conte-me mais sobre isso.";
    }
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
  },
  
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
      
      // Always use ElevenLabs for voice
      console.log("Speaking with ElevenLabs:", text);
      const audioBlob = await this.textToSpeech(text);
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
