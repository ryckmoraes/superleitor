
import { useEffect } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  const { language } = useLanguage();
  const { t } = useTranslations();

  useEffect(() => {
    if (loaded && language) {
      // Delay the greeting slightly to avoid interrupting the user
      setTimeout(() => {
        // Get localized greeting
        const greeting = t('greetings.welcome', {}, 'Bem-vindo!');
        speakNaturally(greeting, language, true);
      }, 1000);
    }
  }, [loaded, language, t]);

  return null; // This component doesn't render anything
};

export default WelcomeHandler;
