
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

  // Load data from localStorage on mount
  useEffect(() => {
    logger.onboarding("Carregando dados do localStorage");
    
    const savedData = localStorage.getItem("onboardingData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
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
          setupCompleted: parsedData.setupCompleted,
          isFirstTimeUser: !parsedData.setupCompleted
        });
      } catch (error) {
        logger.error("Erro ao carregar dados do onboarding:", error);
      }
    } else {
      logger.onboarding("Nenhum dado salvo encontrado - usuário novo");
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    logger.onboarding("Salvando dados no localStorage", {
      setupCompleted: onboardingData.setupCompleted
    });
    localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
  }, [onboardingData]);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    logger.onboarding("Atualizando dados", data);
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const resetOnboarding = () => {
    logger.onboarding("Resetando onboarding");
    setOnboardingData(defaultOnboardingData);
    setIsFirstTimeUser(true);
    localStorage.removeItem("onboardingData");
    localStorage.removeItem("app_password");
  };
  
  const handleAppExit = () => {
    logger.onboarding("Aplicativo saindo");
    localStorage.setItem("app_exited", "true");
  };

  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      updateOnboardingData, 
      resetOnboarding,
      isFirstTimeUser,
      handleAppExit
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
