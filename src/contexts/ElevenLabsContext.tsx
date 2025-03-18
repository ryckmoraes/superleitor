
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import elevenLabsService from '../services/elevenLabsService';

interface ElevenLabsContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
  voiceId: string;
  setVoiceId: (id: string) => void;
  isInitialized: boolean;
  voiceOptions: Array<{ id: string; name: string }>;
}

const ElevenLabsContext = createContext<ElevenLabsContextType>({
  apiKey: '',
  setApiKey: () => {},
  voiceId: 'EXAVITQu4vr4xnSDxMaL', // Default to Sarah
  setVoiceId: () => {},
  isInitialized: false,
  voiceOptions: []
});

export const useElevenLabsContext = () => useContext(ElevenLabsContext);

const LOCAL_STORAGE_API_KEY = 'elevenLabsApiKey';
const LOCAL_STORAGE_VOICE_ID = 'elevenLabsVoiceId';

export const ElevenLabsProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKeyState] = useState<string>('');
  const [voiceId, setVoiceIdState] = useState<string>('EXAVITQu4vr4xnSDxMaL');
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load saved API key and voice ID from localStorage on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(LOCAL_STORAGE_API_KEY);
    const savedVoiceId = localStorage.getItem(LOCAL_STORAGE_VOICE_ID);
    
    if (savedApiKey) {
      setApiKeyState(savedApiKey);
    }
    
    if (savedVoiceId) {
      setVoiceIdState(savedVoiceId);
    }
  }, []);
  
  // Initialize service when API key changes
  useEffect(() => {
    if (apiKey) {
      elevenLabsService.initialize({
        apiKey,
        voiceId
      });
      setIsInitialized(elevenLabsService.isReady());
    } else {
      setIsInitialized(false);
    }
  }, [apiKey, voiceId]);
  
  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem(LOCAL_STORAGE_API_KEY, key);
  };
  
  const setVoiceId = (id: string) => {
    setVoiceIdState(id);
    localStorage.setItem(LOCAL_STORAGE_VOICE_ID, id);
    elevenLabsService.setVoice(id);
  };
  
  return (
    <ElevenLabsContext.Provider
      value={{
        apiKey,
        setApiKey,
        voiceId,
        setVoiceId,
        isInitialized,
        voiceOptions: elevenLabsService.getAvailableVoices()
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
};
