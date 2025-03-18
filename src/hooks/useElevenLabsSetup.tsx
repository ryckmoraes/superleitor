
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
      // Set the ElevenLabs API key to the agent ID
      const agentId = "eNwyboGu8S4QiAWXpwUM";
      saveApiKey(agentId);
      console.log("Set ElevenLabs agent ID:", agentId);
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
