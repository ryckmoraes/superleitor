
import { useState, useEffect } from 'react';
import { elevenLabsService } from '@/services/elevenLabsService';

export const useElevenLabsSetup = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists on mount
  useEffect(() => {
    const exists = elevenLabsService.hasApiKey();
    setHasApiKey(exists);
    
    if (exists) {
      setApiKey(elevenLabsService.getApiKey() || '');
    } else {
      // If no API key is set, use the one provided (eNwyboGu8S4QiAWXpwUM is the voice ID, not the API key)
      // In a real scenario, we'd need an actual API key here
      const defaultApiKey = "your-default-api-key"; // Replace with actual key if available
      if (defaultApiKey && defaultApiKey !== "your-default-api-key") {
        saveApiKey(defaultApiKey);
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
