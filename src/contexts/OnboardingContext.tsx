
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

  // Inicialização ultra-simplificada para Android
  useEffect(() => {
    let mounted = true;
    
    const loadData = () => {
      try {
        const stored = localStorage.getItem("onboardingData");
        if (stored && mounted) {
          const parsedData = JSON.parse(stored);
          
          // Converter datas apenas se existirem
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
        console.log("Erro ao carregar dados - usando padrão");
      }
      
      if (mounted) {
        setIsLoaded(true);
      }
    };

    // Carregar imediatamente sem timeout
    loadData();
    
    return () => {
      mounted = false;
    };
  }, []);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => {
      const newData = { ...prev, ...data };
      
      // Salvar imediatamente
      try {
        localStorage.setItem("onboardingData", JSON.stringify(newData));
      } catch (error) {
        console.log("Erro ao salvar dados");
      }
      
      return newData;
    });
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    setIsFirstTimeUser(true);
    
    try {
      localStorage.removeItem("onboardingData");
      localStorage.removeItem("app_password");
    } catch (error) {
      console.log("Erro ao limpar dados");
    }
  };
  
  const handleAppExit = () => {
    try {
      localStorage.setItem("app_exited", "true");
    } catch (error) {
      console.log("Erro ao marcar saída");
    }
  };

  // Não mostrar loading - renderizar imediatamente
  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      updateOnboardingData, 
      resetOnboarding,
      isFirstTimeUser,
      handleAppExit,
      isLoaded: true // Sempre true para evitar travamento
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
