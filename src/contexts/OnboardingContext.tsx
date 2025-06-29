
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      logger.onboarding("Iniciando carregamento de dados");
      
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
          
          logger.onboarding("Dados carregados com sucesso", {
            setupCompleted: parsedData.setupCompleted,
            isFirstTimeUser: !parsedData.setupCompleted
          });
        } else {
          logger.onboarding("Nenhum dado encontrado - usuário novo");
          setIsFirstTimeUser(true);
        }
      } catch (error) {
        logger.error("Erro ao carregar dados do onboarding:", error);
        // Em caso de erro, manter dados padrão
        setOnboardingData(defaultOnboardingData);
        setIsFirstTimeUser(true);
      } finally {
        setIsLoaded(true);
        logger.onboarding("Carregamento de dados finalizado");
      }
    };

    loadData();
  }, []);

  // Save data to localStorage when it changes (só se já foi carregado)
  useEffect(() => {
    if (isLoaded) {
      logger.onboarding("Salvando dados", {
        setupCompleted: onboardingData.setupCompleted
      });
      
      try {
        localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
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

  // Só renderizar filhos quando dados estiverem carregados
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Carregando dados...</p>
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
      handleAppExit
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
