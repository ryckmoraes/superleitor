
// ElevenLabs Configuration

// API base URL
export const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Agent (Voice) ID to use for speech responses
// Using a standard voice ID that's available in ElevenLabs
export const AGENT_ID = "21m00Tcm4TlvDq8ikWAM"; // Rachel voice ID

// Default voice ID for TTS
export const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; // Same as AGENT_ID (Rachel voice)

// Default model ID to use
export const DEFAULT_MODEL = "eleven_multilingual_v2";

// Default settings for voice playback
export const DEFAULT_VOICE_SETTINGS = {
  stability: 0.5,
  similarity_boost: 0.75,
  use_speaker_boost: true,
};

// Audio format for playback
export const AUDIO_FORMAT = "mp3";
