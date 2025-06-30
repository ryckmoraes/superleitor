
import React, { useEffect } from 'react';
import { useAppLock } from '@/hooks/useAppLock';
import { useLocation } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import PasswordDialog from '@/components/PasswordDialog';

interface AppLockProviderProps {
  children: React.ReactNode;
}

const AppLockProvider = ({ children }: AppLockProviderProps) => {
  const { onboardingData } = useOnboarding();
  const location = useLocation();

  // Se o onboarding não foi concluído, não aplicar AppLock
  if (!onboardingData.setupCompleted) {
    return <>{children}</>;
  }

  // Só usar AppLock após setup completo
  return <AppLockProviderInternal>{children}</AppLockProviderInternal>;
};

const AppLockProviderInternal = ({ children }: AppLockProviderProps) => {
  const { 
    isLocked, 
    showPasswordDialog, 
    setShowPasswordDialog, 
    handlePasswordSuccess 
  } = useAppLock();
  const location = useLocation();

  // Aplicar estilos CSS para modo bloqueado
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .app-locked {
        user-select: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -webkit-tap-highlight-color: transparent;
      }
      
      .app-locked * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
      
      .app-locked {
        touch-action: pan-x pan-y;
        -ms-touch-action: pan-x pan-y;
      }
      
      .app-locked::-webkit-scrollbar {
        display: none;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {children}
      {isLocked && location.pathname !== '/recording' && (
        <div className="fixed top-0 left-0 right-0 bg-red-500/90 text-white text-center py-2 text-sm font-medium z-50">
          🔒 App bloqueado - Conte uma história para desbloquear
        </div>
      )}
      
      <PasswordDialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        onSuccess={handlePasswordSuccess}
        mode="verify"
        title="Senha para Sair"
      />
    </>
  );
};

export default AppLockProvider;
