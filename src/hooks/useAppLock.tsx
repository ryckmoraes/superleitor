
import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppUnlock } from './useAppUnlock';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from './useTranslations';

export const useAppLock = () => {
  const navigate = useNavigate();
  const { isUnlocked, remainingTime } = useAppUnlock();
  const { language } = useLanguage();
  const { t } = useTranslations();

  // Função para verificar se pode sair do app
  const canExitApp = useCallback(() => {
    return isUnlocked && remainingTime > 0;
  }, [isUnlocked, remainingTime]);

  // Função para lidar com tentativa de saída
  const handleExitAttempt = useCallback(() => {
    if (canExitApp()) {
      return true; // Permitir saída
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
  }, [canExitApp, navigate, language, t]);

  // Configurar bloqueio do botão voltar/home no Android
  useEffect(() => {
    const handleBackButton = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
      
      if (!handleExitAttempt()) {
        // Bloquear a ação padrão
        return false;
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!canExitApp()) {
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
    document.addEventListener('backbutton', handleBackButton, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Para Capacitor (Android nativo)
    const setupCapacitorBackButton = async () => {
      try {
        const capacitorWindow = window as any;
        if (capacitorWindow.Capacitor?.isNativePlatform()) {
          const { App } = capacitorWindow.Capacitor.Plugins;
          if (App) {
            App.addListener('backButton', (data: any) => {
              if (!handleExitAttempt()) {
                // Prevenir saída
                data.canGoBack = false;
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro ao configurar bloqueio do botão voltar:', error);
      }
    };

    setupCapacitorBackButton();

    // Cleanup
    return () => {
      document.removeEventListener('backbutton', handleBackButton, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleExitAttempt, canExitApp, t]);

  // Configurar modo fullscreen e prevenir gestos de saída
  useEffect(() => {
    const preventGestures = () => {
      // Prevenir gestos de navegação no Android
      document.body.style.overscrollBehavior = 'none';
      document.body.style.touchAction = 'pan-x pan-y';
      
      // Adicionar classe para fullscreen
      document.body.classList.add('app-locked');
    };

    const restoreGestures = () => {
      document.body.style.overscrollBehavior = '';
      document.body.style.touchAction = '';
      document.body.classList.remove('app-locked');
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
    isLocked: !canExitApp()
  };
};
