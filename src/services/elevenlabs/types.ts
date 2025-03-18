
// Types for ElevenLabs API calls

export interface TextToSpeechRequest {
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

export interface AnalyzeAudioRequest {
  audio: Blob;
  language?: string;
}
