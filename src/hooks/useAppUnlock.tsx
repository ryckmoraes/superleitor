
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';
import { calculateEarnedTime } from '@/utils/formatUtils';

export const useAppUnlock = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();

  // Check if app is unlocked
  const checkUnlockStatus = useCallback(() => {
    // Não executar se onboarding não foi concluído
    if (!onboardingData.setupCompleted) {
      return false;
    }

    const expiryTimeStr = localStorage.getItem('appUnlockExpiryTime');
    
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      const currentTime = Date.now();
      
      if (expiryTime > currentTime) {
        setIsUnlocked(true);
        const remainingMs = expiryTime - currentTime;
        setRemainingTime(Math.ceil(remainingMs / (60 * 1000)));
        return true;
      } else {
        setIsUnlocked(false);
        setRemainingTime(0);
        localStorage.removeItem('appUnlockExpiryTime');
        return false;
      }
    }
    
    return false;
  }, [onboardingData.setupCompleted]);

  // Initialize unlock status checking
  useEffect(() => {
    // Não executar se onboarding não foi concluído
    if (!onboardingData.setupCompleted) {
      return;
    }

    const isCurrentlyUnlocked = checkUnlockStatus();
    
    if (!isCurrentlyUnlocked && localStorage.getItem('wasUnlocked') === 'true') {
      showToastOnly(
        "Tempo Expirado",
        "Seu tempo de uso terminou. Conte uma nova história para desbloquear mais tempo!",
        "default"
      );
      
      localStorage.removeItem('wasUnlocked');
      
      setTimeout(() => {
        speakNaturally("Seu tempo acabou! Conte uma nova história para ganhar mais tempo de uso.", true);
      }, 500);
      
      setTimeout(() => {
        navigate('/recording');
      }, 4000);
    }
    
    const interval = setInterval(() => {
      const stillUnlocked = checkUnlockStatus();
      
      if (!stillUnlocked && isUnlocked) {
        showToastOnly(
          "Tempo Expirado",
          "Seu tempo de uso terminou. Conte uma nova história para desbloquear mais tempo.",
          "default"
        );
        
        localStorage.setItem('wasUnlocked', 'true');
        speakNaturally("Seu tempo acabou! Conte uma nova história para continuar usando o app.", true);
        
        setTimeout(() => {
          navigate('/recording');
        }, 3000);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [checkUnlockStatus, isUnlocked, navigate, onboardingData.setupCompleted]);

  const resetUnlock = useCallback(() => {
    localStorage.removeItem('appUnlockExpiryTime');
    localStorage.removeItem('wasUnlocked');
    setIsUnlocked(false);
    setRemainingTime(0);
  }, []);

  const unlockApp = useCallback((recordingSeconds: number) => {
    const earnedMinutes = calculateEarnedTime(recordingSeconds);
    const expiryTime = Date.now() + (earnedMinutes * 60 * 1000);
    
    localStorage.setItem('appUnlockExpiryTime', expiryTime.toString());
    setIsUnlocked(true);
    setRemainingTime(earnedMinutes);
    localStorage.setItem('wasUnlocked', 'true');
    
    console.log(`App unlocked for ${earnedMinutes} minutes until ${new Date(expiryTime).toLocaleTimeString()}`);
    
    return earnedMinutes;
  }, []);

  return {
    isUnlocked,
    remainingTime,
    checkUnlockStatus,
    resetUnlock,
    unlockApp
  };
};

export default useAppUnlock;
