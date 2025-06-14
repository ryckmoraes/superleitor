
import { useEffect } from "react";
import { speakNaturally, getLocalizedGreeting } from "@/services/audioProcessor";
import { useLanguage } from "@/contexts/LanguageContext";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  const { language } = useLanguage();

  useEffect(() => {
    if (loaded && language) {
      // Delay the greeting slightly to avoid interrupting the user
      setTimeout(() => {
        // Get localized greeting
        const greeting = getLocalizedGreeting(language);
        speakNaturally(greeting, language, true);
      }, 1000);
    }
  }, [loaded, language]);

  return null; // This component doesn't render anything
};

export default WelcomeHandler;
