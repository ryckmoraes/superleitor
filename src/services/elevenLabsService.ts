
// ElevenLabs API Service for Text-to-Speech
// This service provides direct API integration with ElevenLabs without requiring the @11labs/react package

interface ElevenLabsConfig {
  apiKey: string;
  voiceId: string;
  model?: string;
}

interface TextToSpeechOptions {
  text: string;
  voice_id: string;
  model_id: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

class ElevenLabsService {
  private apiKey: string = '';
  private voiceId: string = 'EXAVITQu4vr4xnSDxMaL'; // Default voice (Sarah)
  private modelId: string = 'eleven_multilingual_v2'; // Default model
  private apiUrl: string = 'https://api.elevenlabs.io/v1';
  private isInitialized: boolean = false;

  constructor() {}

  initialize(config: ElevenLabsConfig): void {
    this.apiKey = config.apiKey;
    this.voiceId = config.voiceId || this.voiceId;
    this.modelId = config.model || this.modelId;
    this.isInitialized = Boolean(this.apiKey);
    console.log(`ElevenLabs service initialized with voice: ${this.voiceId}, model: ${this.modelId}`);
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  setVoice(voiceId: string): void {
    this.voiceId = voiceId;
  }

  setModel(modelId: string): void {
    this.modelId = modelId;
  }

  async generateSpeech(text: string): Promise<ArrayBuffer | null> {
    if (!this.isInitialized) {
      console.error('ElevenLabs service is not initialized with an API key');
      return null;
    }

    if (!text || text.trim() === '') {
      console.warn('Empty text provided to speech generator');
      return null;
    }

    try {
      const options: TextToSpeechOptions = {
        text,
        voice_id: this.voiceId,
        model_id: this.modelId,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true,
        }
      };

      const response = await fetch(`${this.apiUrl}/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        body: JSON.stringify(options),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API Error (${response.status}): ${errorText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error generating speech with ElevenLabs:', error);
      return null;
    }
  }

  async playAudio(audioData: ArrayBuffer): Promise<HTMLAudioElement> {
    const blob = new Blob([audioData], { type: 'audio/mpeg' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    
    return new Promise((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve(audio);
      };
      
      audio.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(error);
      };
      
      audio.play().catch(reject);
    });
  }

  async speakText(text: string): Promise<boolean> {
    try {
      const audioData = await this.generateSpeech(text);
      if (!audioData) return false;
      
      await this.playAudio(audioData);
      return true;
    } catch (error) {
      console.error('Failed to speak text:', error);
      return false;
    }
  }

  getAvailableVoices(): { id: string, name: string }[] {
    return [
      { id: "9BWtsMINqrJLrRacOk9x", name: "Aria" },
      { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger" },
      { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" },
      { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura" },
      { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie" },
      { id: "JBFqnCBsd6RMkjVDRZzb", name: "George" },
      { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" },
      { id: "SAz9YHcvj6GT2YYXdXww", name: "River" },
      { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam" },
      { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte" },
      { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice" },
      { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda" },
      { id: "bIHbv24MWmeRgasZH58o", name: "Will" },
      { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica" },
      { id: "cjVigY5qzO86Huf0OWal", name: "Eric" },
      { id: "iP95p4xoKVk53GoZ742B", name: "Chris" },
      { id: "nPczCjzI2devNBz1zQrb", name: "Brian" },
      { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel" },
      { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily" },
      { id: "pqHfZKP75CvOlQylNhV4", name: "Bill" }
    ];
  }
}

// Create and export a singleton instance
const elevenLabsService = new ElevenLabsService();
export default elevenLabsService;
