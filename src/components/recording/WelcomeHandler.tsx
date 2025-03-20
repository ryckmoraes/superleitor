
import { useEffect, useRef } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { speakNaturally, getLocalizedGreeting } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";
import { voskService } from "@/services/voskService";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  const { onboardingData } = useOnboarding();
  const welcomeSpokenRef = useRef(false);

  // Improved welcome message function
  const speakWelcomeMessage = () => {
    // Get the current language
    const currentLanguage = voskService.isVoskWorking() ? voskService.getCurrentLanguage() : 'pt-BR';
    
    if (onboardingData.superReaderName) {
      // Create personalized greeting based on language
      let welcomeMessage = "";
      
      switch (currentLanguage.substring(0, 2)) {
        case 'pt':
          welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
          break;
        case 'en':
          welcomeMessage = `Hello ${onboardingData.superReaderName}! Great to see you! What story would you like to tell me today?`;
          break;
        case 'es':
          welcomeMessage = `¡Hola ${onboardingData.superReaderName}! ¡Qué bueno verte! ¿Qué historia quieres contarme hoy?`;
          break;
        case 'fr':
          welcomeMessage = `Bonjour ${onboardingData.superReaderName}! C'est bon de te voir! Quelle histoire veux-tu me raconter aujourd'hui?`;
          break;
        case 'de':
          welcomeMessage = `Hallo ${onboardingData.superReaderName}! Schön dich zu sehen! Welche Geschichte möchtest du mir heute erzählen?`;
          break;
        case 'it':
          welcomeMessage = `Ciao ${onboardingData.superReaderName}! È bello vederti! Che storia vuoi raccontarmi oggi?`;
          break;
        case 'ru':
          welcomeMessage = `Привет ${onboardingData.superReaderName}! Рад тебя видеть! Какую историю ты хочешь рассказать мне сегодня?`;
          break;
        case 'zh':
          welcomeMessage = `你好 ${onboardingData.superReaderName}！很高兴见到你！今天你想给我讲什么故事？`;
          break;
        case 'ja':
          welcomeMessage = `こんにちは ${onboardingData.superReaderName}！会えて嬉しいです！今日はどんな話を聞かせてくれますか？`;
          break;
        default:
          welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
      }
      
      console.log("Speaking welcome message:", welcomeMessage);
      
      // Show toast message
      showToastOnly("Bem-vindo!", welcomeMessage);
      
      // Ensure audio is played with priority and only once
      setTimeout(() => {
        console.log("Attempting to speak welcome message with delay");
        // Set priority to true to cancel any existing speech
        speakNaturally(welcomeMessage, true);
      }, 1000);
    } else {
      console.error("Name not set", {
        superReaderName: onboardingData.superReaderName
      });
      
      // Get generic greeting in current language
      const genericWelcome = getLocalizedGreeting(currentLanguage);
      
      // Show generic toast
      showToastOnly("Bem-vindo!", genericWelcome);
      
      // Speak generic welcome
      setTimeout(() => {
        speakNaturally(genericWelcome, true);
      }, 1000);
    }
  };

  // Speak welcome message once loaded
  useEffect(() => {
    // Only speak the welcome message if it hasn't been spoken yet
    if (loaded && !welcomeSpokenRef.current) {
      welcomeSpokenRef.current = true;
      
      // Longer delay to ensure everything is ready
      setTimeout(() => {
        speakWelcomeMessage();
      }, 2000);
    }
  }, [loaded, onboardingData.superReaderName]);

  return null; // This is a behavior component, not a visual one
};

export default WelcomeHandler;
