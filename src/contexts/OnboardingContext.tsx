
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
      } catch (error) {
        console.error("Error parsing onboarding data:", error);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("onboardingData", JSON.stringify(onboardingData));
  }, [onboardingData]);

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    setIsFirstTimeUser(true);
    localStorage.removeItem("onboardingData");
    localStorage.removeItem("app_password"); // Also clear the app password
  };

  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      updateOnboardingData, 
      resetOnboarding,
      isFirstTimeUser 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
