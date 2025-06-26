
import { useState, useEffect } from 'react';
import { elevenLabsService } from '@/services/elevenlabs';
import { showToastOnly } from '@/services/notificationService';

// Default API key that was provided by the user
const DEFAULT_API_KEY = "sk_991eeee8228acc5e57847014484ae347026ddf3178d02ee9";

export const useElevenLabsSetup = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Check if API key exists on mount and set it if not
  useEffect(() => {
    const checkApiKey = async () => {
      const exists = await elevenLabsService.hasApiKey();
      setHasApiKey(exists);
      
      if (exists) {
        const key = await elevenLabsService.getApiKey();
        setApiKey(key || '');
      } else if (DEFAULT_API_KEY) {
        // Use the provided key
        const success = await saveApiKey(DEFAULT_API_KEY);
        if (success) {
          console.log("Using provided ElevenLabs API key");
        }
      } else {
        console.warn("No ElevenLabs API key found. Voice features will use fallback.");
      }
    };
    
    checkApiKey();
  }, []);
  
  // Save API key
  const saveApiKey = async (key: string): Promise<boolean> => {
    if (key && key.trim()) {
      try {
        await elevenLabsService.setApiKey(key.trim());
        
        // Test the API key with a simple request
        console.log("ElevenLabs API key saved");
        
        setHasApiKey(true);
        setApiKey(key.trim());
        return true;
      } catch (error) {
        console.error("Error saving ElevenLabs API key:", error);
        showToastOnly("Erro", "Não foi possível validar a chave da API ElevenLabs", "destructive");
        return false;
      }
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
