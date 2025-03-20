
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showToastOnly } from '@/services/notificationService';
import { speakNaturally } from '@/services/audioProcessor';

export const useAppUnlock = () => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const navigate = useNavigate();

  // Check if app is unlocked
  const checkUnlockStatus = useCallback(() => {
    const expiryTimeStr = localStorage.getItem('appUnlockExpiryTime');
    
    if (expiryTimeStr) {
      const expiryTime = parseInt(expiryTimeStr, 10);
      const currentTime = Date.now();
      
      if (expiryTime > currentTime) {
        // App is still unlocked
        setIsUnlocked(true);
        // Calculate remaining time in minutes
        const remainingMs = expiryTime - currentTime;
        setRemainingTime(Math.ceil(remainingMs / (60 * 1000)));
        return true;
      } else {
        // Unlock has expired
        setIsUnlocked(false);
        setRemainingTime(0);
        localStorage.removeItem('appUnlockExpiryTime');
        return false;
      }
    }
    
    return false;
  }, []);

  // Initialize unlock status checking
  useEffect(() => {
    const isCurrentlyUnlocked = checkUnlockStatus();
    
    // If app just expired, show notification
    if (!isCurrentlyUnlocked && localStorage.getItem('wasUnlocked') === 'true') {
      showToastOnly(
        "Tempo Expirado",
        "Seu tempo de uso terminou. Conte uma nova história para desbloquear mais tempo!",
        "default"
      );
      
      // Remove the flag
      localStorage.removeItem('wasUnlocked');
      
      // Speak message after a short delay
      setTimeout(() => {
        speakNaturally("Seu tempo acabou! Conte uma nova história para ganhar mais tempo de uso.", true);
      }, 500);
      
      // Navigate to recording screen after a few seconds
      setTimeout(() => {
        navigate('/recording');
      }, 4000);
    }
    
    // Set up interval to check unlock status periodically
    const interval = setInterval(() => {
      const stillUnlocked = checkUnlockStatus();
      
      // If app just expired during this check, show notification and redirect
      if (!stillUnlocked && isUnlocked) {
        showToastOnly(
          "Tempo Expirado",
          "Seu tempo de uso terminou. Conte uma nova história para desbloquear mais tempo.",
          "default"
        );
        
        // Set a flag to indicate it was unlocked before expiry
        localStorage.setItem('wasUnlocked', 'true');
        
        // Speak message
        speakNaturally("Seu tempo acabou! Conte uma nova história para continuar usando o app.", true);
        
        // Navigate to recording screen after a short delay
        setTimeout(() => {
          navigate('/recording');
        }, 3000);
      }
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(interval);
  }, [checkUnlockStatus, isUnlocked, navigate]);

  // Reset unlock status (for testing)
  const resetUnlock = useCallback(() => {
    localStorage.removeItem('appUnlockExpiryTime');
    localStorage.removeItem('wasUnlocked');
    setIsUnlocked(false);
    setRemainingTime(0);
  }, []);

  return {
    isUnlocked,
    remainingTime,
    checkUnlockStatus,
    resetUnlock
  };
};

export default useAppUnlock;
