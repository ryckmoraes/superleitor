
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { voskModelsService } from "@/services/voskModelsService";

interface LanguageContextType {
  modelId: string;
  language: string;
  setLanguageModel: (modelId: string) => void;
  refreshFromStorage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const getCurrentModelId = () =>
    localStorage.getItem("vosk_current_model") ||
    voskModelsService.getCurrentModel()?.id ||
    "pt-br-small";
  
  const [modelId, setModelId] = useState<string>(getCurrentModelId());
  
  // Initialize language based on modelId
  const [language, setLanguage] = useState<string>(
    voskModelsService.getLanguageForModel(modelId)
  );

  // Listener for explicit storage events (multi-tab syncing)
  useEffect(() => {
    const handleModelChanged = (event: Event) => {
      if ((event as CustomEvent)?.detail?.newModelId) {
        const newId = (event as CustomEvent).detail.newModelId;
        console.log('[LanguageContext] Received voskModelChanged event with new modelId:', newId);
        setModelId(newId);
      }
    };
    window.addEventListener("voskModelChanged", handleModelChanged);
    return () => window.removeEventListener("voskModelChanged", handleModelChanged);
  }, []);

  // Listen for raw storage changes (e.g., from other tabs)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "vosk_current_model" &&
        e.newValue &&
        e.newValue !== modelId
      ) {
        console.log('[LanguageContext] Received storage event for vosk_current_model:', e.newValue);
        setModelId(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [modelId]);

  // Update react state if localStorage was changed imperatively
  const refreshFromStorage = () => {
    const curId = getCurrentModelId();
    if (curId !== modelId) {
        console.log('[LanguageContext] Refreshing from storage. New modelId:', curId);
        setModelId(curId);
    }
  };

  // Helper function to change the language model
  const setLanguageModel = (id: string) => {
    console.log('[LanguageContext] Setting language model to:', id);
    voskModelsService.setCurrentModel(id); // This will update localStorage & fire the 'voskModelChanged' event
    // The event listener will handle updating the state
  };
  
  // Effect to update language when modelId changes
  useEffect(() => {
    setLanguage(voskModelsService.getLanguageForModel(modelId));
  }, [modelId]);


  return (
    <LanguageContext.Provider
      value={{
        modelId,
        language,
        setLanguageModel,
        refreshFromStorage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
};
