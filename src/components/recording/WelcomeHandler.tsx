
import { useEffect, useRef } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  const { language } = useLanguage();
  const { t } = useTranslations();
  const welcomeSpokenRef = useRef(false);

  useEffect(() => {
    if (loaded && language && !welcomeSpokenRef.current) {
      welcomeSpokenRef.current = true;
      
      // Delay the greeting to avoid conflicts
      setTimeout(() => {
        const greeting = t('greetings.welcome', {}, 'Bem-vindo!');
        speakNaturally(greeting, language, true);
      }, 2000); // Increased delay
    }
  }, [loaded, language, t]);

  return null;
};

export default WelcomeHandler;
