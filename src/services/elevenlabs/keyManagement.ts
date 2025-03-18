
// API Key management for ElevenLabs

/**
 * Service for managing the ElevenLabs API key
 */
export const keyManagement = {
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

  // Get the agent ID (this is separate from the API key)
  getAgentId: (): string => {
    return "eNwyboGu8S4QiAWXpwUM"; // Hardcoded agent ID
  }
};
