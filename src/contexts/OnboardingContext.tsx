
import React, { createContext, useContext, useState } from "react";

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

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    const newData = { ...onboardingData, ...data };
    setOnboardingData(newData);
    
    try {
      localStorage.setItem("onboardingData", JSON.stringify(newData));
    } catch (error) {
      console.log("Error saving onboarding data");
    }
  };

  const resetOnboarding = () => {
    setOnboardingData(defaultOnboardingData);
    try {
      localStorage.removeItem("onboardingData");
      localStorage.removeItem("app_password");
    } catch (error) {
      console.log("Error clearing onboarding data");
    }
  };
  
  const handleAppExit = () => {
    try {
      localStorage.setItem("app_exited", "true");
    } catch (error) {
      console.log("Error marking app exit");
    }
  };

  return (
    <OnboardingContext.Provider value={{ 
      onboardingData, 
      updateOnboardingData, 
      resetOnboarding,
      isFirstTimeUser: !onboardingData.setupCompleted,
      handleAppExit,
      isLoaded: true
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export default OnboardingContext;
