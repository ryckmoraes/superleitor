
import { useState, useEffect } from 'react';
import { elevenLabsService } from '@/services/elevenlabs';

// Default API key for development/testing (replace with your own key)
const DEFAULT_TEST_API_KEY = ""; // You should prompt users to enter their own key

export const useElevenLabsSetup = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists on mount and set it if not
  useEffect(() => {
    const exists = elevenLabsService.hasApiKey();
    setHasApiKey(exists);
    
    if (exists) {
      setApiKey(elevenLabsService.getApiKey() || '');
    } else if (DEFAULT_TEST_API_KEY) {
      // If we have a default key, use it
      saveApiKey(DEFAULT_TEST_API_KEY);
      console.log("Using default ElevenLabs API key");
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
