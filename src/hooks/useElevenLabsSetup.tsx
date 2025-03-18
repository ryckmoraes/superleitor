
import { useState, useEffect } from 'react';
import { elevenLabsService } from '@/services/elevenlabs';

// Default API key that was provided by the user
const DEFAULT_API_KEY = "sk_991eeee8228acc5e57847014484ae347026ddf3178d02ee9";

export const useElevenLabsSetup = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists on mount and set it if not
  useEffect(() => {
    const exists = elevenLabsService.hasApiKey();
    setHasApiKey(exists);
    
    if (exists) {
      setApiKey(elevenLabsService.getApiKey() || '');
    } else if (DEFAULT_API_KEY) {
      // Use the provided key
      saveApiKey(DEFAULT_API_KEY);
      console.log("Using provided ElevenLabs API key");
    } else {
      console.warn("No ElevenLabs API key found. Voice features will use fallback.");
    }
  }, []);
  
  // Save API key
  const saveApiKey = (key: string) => {
    if (key && key.trim()) {
      elevenLabsService.setApiKey(key.trim());
      setHasApiKey(true);
      setApiKey(key.trim());
      return true;
    }
    return false;
  };
  
  // Clear API key
  const clearApiKey = () => {
    elevenLabsService.clearApiKey();
    setApiKey('');
    setHasApiKey(false);
  };
  
  return {
    apiKey,
    setApiKey,
    hasApiKey,
    saveApiKey,
    clearApiKey
  };
};
