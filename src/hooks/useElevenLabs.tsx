
import { useState, useEffect } from 'react';
import elevenLabsService from '../services/elevenLabsService';

interface UseElevenLabsOptions {
  apiKey?: string;
  voiceId?: string;
  modelId?: string;
  autoInitialize?: boolean;
}

export const useElevenLabs = ({
  apiKey,
  voiceId = 'EXAVITQu4vr4xnSDxMaL', // Default: Sarah
  modelId = 'eleven_multilingual_v2',
  autoInitialize = false
}: UseElevenLabsOptions = {}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize service if apiKey is provided
  useEffect(() => {
    if (apiKey && autoInitialize) {
      initializeService(apiKey, voiceId, modelId);
    }
  }, [apiKey, voiceId, modelId, autoInitialize]);
  
  const initializeService = (key: string, voice?: string, model?: string) => {
    try {
      elevenLabsService.initialize({
        apiKey: key,
        voiceId: voice || voiceId,
        model: model || modelId
      });
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize ElevenLabs service');
      setIsInitialized(false);
    }
  };
  
  const speakText = async (text: string): Promise<boolean> => {
    if (!elevenLabsService.isReady()) {
      setError('ElevenLabs service is not initialized');
      return false;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await elevenLabsService.speakText(text);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to speak text');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const setVoice = (id: string) => {
    elevenLabsService.setVoice(id);
  };
  
  const setModel = (id: string) => {
    elevenLabsService.setModel(id);
  };
  
  const getAvailableVoices = () => {
    return elevenLabsService.getAvailableVoices();
  };
  
  return {
    isInitialized,
    isLoading,
    error,
    initializeService,
    speakText,
    setVoice,
    setModel,
    getAvailableVoices
  };
};
