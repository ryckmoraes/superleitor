
import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAppUnlock } from './useAppUnlock';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from './useTranslations';
import { setupBackButtonLock, exitApp } from '@/utils/androidHelper';

export const useAppLock = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const { isUnlocked, remainingTime } = useAppUnlock();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Não executar se onboarding não foi concluído
  if (!onboardingData.setupCompleted) {
    return {
      canExitApp: () => true,
      handleExitAttempt: () => true,
      isLocked: false,
      showPasswordDialog: false,
      setShowPasswordDialog: () => {},
      handlePasswordSuccess: () => {}
    };
  }

  const canExitApp = useCallback(() => {
    return isUnlocked && remainingTime > 0;
  }, [isUnlocked, remainingTime]);

  const hasPassword = useCallback(() => {
    return !!localStorage.getItem("app_password");
  }, []);

  const handleExitAttempt = useCallback(() => {
    if (canExitApp()) {
      return true;
    }
    
    if (hasPassword()) {
      setShowPasswordDialog(true);
      return false;
    }
    
    showToastOnly(
      t('appLock.exitBlocked'),
      t('appLock.needStoryOrPassword'),
      "destructive"
    );
    
    if (language) {
      speakNaturally(t('appLock.cantExitMessage'), language, true);
    }
    
    navigate('/recording');
    return false;
  }, [canExitApp, hasPassword, navigate, language, t]);

  const handlePasswordSuccess = useCallback(() => {
    setShowPasswordDialog(false);
    exitApp();
  }, []);

  useEffect(() => {
    const cleanup = setupBackButtonLock(() => {
      return handleExitAttempt();
    });

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!canExitApp() && !hasPassword()) {
        event.preventDefault();
        event.returnValue = t('appLock.confirmExit');
        return t('appLock.confirmExit');
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !canExitApp()) {
        setTimeout(() => {
          if (document.hidden) {
            showToastOnly(
              t('appLock.appMinimized'),
              t('appLock.returnToApp'),
              "destructive"
            );
          }
        }, 1000);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleExitAttempt, canExitApp, hasPassword, t]);

  useEffect(() => {
    const preventGestures = () => {
      document.body.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'pan-x pan-y';
    };

    const restoreGestures = () => {
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
    };

    if (!canExitApp()) {
      preventGestures();
    } else {
      restoreGestures();
    }

    return () => {
      restoreGestures();
    };
  }, [canExitApp]);

  return {
    canExitApp,
    handleExitAttempt,
    isLocked: !canExitApp(),
    showPasswordDialog,
    setShowPasswordDialog,
    handlePasswordSuccess
  };
};
