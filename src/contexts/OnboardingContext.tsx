
import React, { createContext, useContext, useState, useEffect } from "react";
import { logger } from "@/utils/logger";

interface OnboardingData {
  adminName: string;
  adminBirthdate: Date | null;
  password: string;
  superReaderName: string;
  superReaderBirthdate: Date | null;
  setupCompleted: boolean;
}

interface OnboardingContextProps {
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  isFirstTimeUser: boolean;
  handleAppExit: () => void;
  isLoaded: boolean;
}

const defaultOnboardingData: OnboardingData = {
  adminName: "",
  adminBirthdate: null,
  password: "",
  superReaderName: "",
  superReaderBirthdate: null,
  setupCompleted: false,
};

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboardingData, setOnboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      logger.onboarding("Carregando dados do onboarding");
      
      try {
        const stored = localStorage.getItem("onboardingData");
        if (stored) {
          const parsedData = JSON.parse(stored);
          
          // Convert string dates back to Date objects
          if (parsedData.adminBirthdate) {
            parsedData.adminBirthdate = new Date(parsedData.adminBirthdate);
          }
          if (parsedData.superReaderBirthdate) {
            parsedData.superReaderBirthdate = new Date(parsedData.superReaderBirthdate);
          }
          
          setOnboardingData(parsedData);
          setIsFirstTimeUser(!parsedData.setupCompleted);
          
          logger.onboarding("Dados carregados", {
            setupCompleted: parsedData.setupCompleted
          });
        } else {
          logger.onboarding("Primeiro uso - dados padrão");
          setIsFirstTimeUser(true);
        }
      } catch (error) {
        logger.error("Erro ao carregar dados:", error);
        setOnboardingData(defaultOnboardingData);
        setIsFirstTimeUser(true);
      }
      
      setIsLoaded(true);
    };

    // Carregamento imediato
    loadData();
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
        logger.onboarding("Dados salvos", {
          setupCompleted: onboardingData.setupCompleted
        });
      } catch (error) {
        logger.error("Erro ao salvar dados:", error);
      }
    }
  }, [onboardingData, isLoaded]);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    logger.onboarding("Atualizando dados", data);
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const resetOnboarding = () => {
    logger.onboarding("Resetando onboarding");
    setOnboardingData(defaultOnboardingData);
    setIsFirstTimeUser(true);
    
    try {
      localStorage.removeItem("onboardingData");
      localStorage.removeItem("app_password");
    } catch (error) {
      logger.error("Erro ao limpar dados:", error);
    }
  };
  
  const handleAppExit = () => {
    logger.onboarding("App saindo");
    try {
      localStorage.setItem("app_exited", "true");
    } catch (error) {
      logger.error("Erro ao salvar flag de saída:", error);
    }
  };

  // Renderizar loading simples enquanto carrega
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      updateOnboardingData, 
      resetOnboarding,
      isFirstTimeUser,
      handleAppExit,
      isLoaded
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
