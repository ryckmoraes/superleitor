
import React, { createContext, useContext, useState, useEffect } from "react";

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

  // Inicialização simplificada
  useEffect(() => {
    try {
      const stored = localStorage.getItem("onboardingData");
      if (stored) {
        const parsedData = JSON.parse(stored);
        
        // Converter datas
        if (parsedData.adminBirthdate) {
          parsedData.adminBirthdate = new Date(parsedData.adminBirthdate);
        }
        if (parsedData.superReaderBirthdate) {
          parsedData.superReaderBirthdate = new Date(parsedData.superReaderBirthdate);
        }
        
        setOnboardingData(parsedData);
        setIsFirstTimeUser(!parsedData.setupCompleted);
      }
    } catch (error) {
      // Falha silenciosa, usar dados padrão
    }
    
    // Marcar como carregado após 100ms para evitar travamentos
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Salvar dados quando mudarem
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
      } catch (error) {
        // Falha silenciosa
      }
    }
  }, [onboardingData, isLoaded]);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    setIsFirstTimeUser(true);
    
    try {
      localStorage.removeItem("onboardingData");
      localStorage.removeItem("app_password");
    } catch (error) {
      // Falha silenciosa
    }
  };
  
  const handleAppExit = () => {
    try {
      localStorage.setItem("app_exited", "true");
    } catch (error) {
      // Falha silenciosa
    }
  };

  // Renderizar loading simples
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando...</p>
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
