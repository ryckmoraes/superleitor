
import React from 'react';
import { useOnboarding } from '@/contexts/OnboardingContext';

interface AppLockProviderProps {
  children: React.ReactNode;
}

const AppLockProvider = ({ children }: AppLockProviderProps) => {
  const { onboardingData } = useOnboarding();

  // Desabilitar completamente AppLock se setup não foi concluído
  if (!onboardingData.setupCompleted) {
    return <>{children}</>;
  }

  // Por enquanto, apenas renderizar children mesmo com setup concluído
  // para evitar travamentos
  return <>{children}</>;
};

export default AppLockProvider;
