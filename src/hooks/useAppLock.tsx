
import { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppUnlock } from './useAppUnlock';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from './useTranslations';
import { setupBackButtonLock, exitApp } from '@/utils/androidHelper';

export const useAppLock = () => {
  const navigate = useNavigate();
  const { isUnlocked, remainingTime } = useAppUnlock();
  const { language } = useLanguage();
  const { t } = useTranslations();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Função para verificar se pode sair do app
  const canExitApp = useCallback(() => {
    return isUnlocked && remainingTime > 0;
  }, [isUnlocked, remainingTime]);

  // Função para verificar se existe senha configurada
  const hasPassword = useCallback(() => {
    return !!localStorage.getItem("app_password");
  }, []);

  // Função para lidar com tentativa de saída
  const handleExitAttempt = useCallback(() => {
    if (canExitApp()) {
      return true; // Permitir saída
    }
    
    // Se tem senha, mostrar dialog de senha
    if (hasPassword()) {
      setShowPasswordDialog(true);
      return false;
    }
    
    // Bloquear saída e mostrar mensagem
    showToastOnly(
      t('appLock.exitBlocked'),
      t('appLock.needStoryOrPassword'),
      "destructive"
    );
    
    if (language) {
      speakNaturally(t('appLock.cantExitMessage'), language, true);
    }
    
    // Redirecionar para tela de gravação se não estiver lá
    navigate('/recording');
    return false;
  }, [canExitApp, hasPassword, navigate, language, t]);

  // Função para lidar com sucesso da senha
  const handlePasswordSuccess = useCallback(() => {
    setShowPasswordDialog(false);
    exitApp();
  }, []);

  // Configurar bloqueio do botão voltar/home no Android
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
        // App foi minimizado, mas não deveria
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

    // Adicionar listeners para diferentes eventos de saída
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleExitAttempt, canExitApp, hasPassword, t]);

  // Configurar modo fullscreen e prevenir gestos de saída
  useEffect(() => {
    const preventGestures = () => {
      // Prevenir gestos de navegação no Android
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
