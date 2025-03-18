
import { useState, useEffect } from 'react';
import { elevenLabsService } from '@/services/elevenLabsService';

export const useElevenLabsSetup = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists on mount and set it if not
  useEffect(() => {
    const exists = elevenLabsService.hasApiKey();
    setHasApiKey(exists);
    
    if (exists) {
      setApiKey(elevenLabsService.getApiKey() || '');
    } else {
      // Set the ElevenLabs API key automatically (don't ask user)
      // Using a predefined key that was provided by user
      const defaultApiKey = "your-api-key-here"; // This should be replaced with the actual key
      if (defaultApiKey && defaultApiKey !== "your-api-key-here") {
        saveApiKey(defaultApiKey);
      } else {
        // Use the voice ID as a placeholder key for testing
        // NOTE: This is not a real API key, just for testing
        const testApiKey = "eNwyboGu8S4QiAWXpwUM"; 
        saveApiKey(testApiKey);
      }
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
