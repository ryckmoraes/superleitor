
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
  const getCurrentLanguage = () => voskModelsService.getCurrentLanguage();

  const [modelId, setModelId] = useState<string>(getCurrentModelId());
  const [language, setLanguage] = useState<string>(getCurrentLanguage());

  // Listener for explicit storage events (multi-tab syncing)
  useEffect(() => {
    const handleModelChanged = (event: Event) => {
      if ((event as CustomEvent)?.detail?.newModelId) {
        const newId = (event as CustomEvent).detail.newModelId;
        setModelId(newId);
        setLanguage(voskModelsService.getLanguageForModel(newId));
      }
    };
    window.addEventListener("voskModelChanged", handleModelChanged);
    return () => window.removeEventListener("voskModelChanged", handleModelChanged);
  }, []);

  // Listen for raw changes (fallback)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (
        e.key === "vosk_current_model" &&
        e.newValue &&
        e.newValue !== modelId
      ) {
        setModelId(e.newValue);
        setLanguage(voskModelsService.getLanguageForModel(e.newValue));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line
  }, [modelId]);

  // Update react state if localstorage changed imperatively
  const refreshFromStorage = () => {
    const curId = getCurrentModelId();
    setModelId(curId);
    setLanguage(voskModelsService.getLanguageForModel(curId));
  };

  // Change helper
  const setLanguageModel = (id: string) => {
    voskModelsService.setCurrentModel(id); // will update localStorage & fire event
    setModelId(id);
    setLanguage(voskModelsService.getLanguageForModel(id));
  };

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
