import { useEffect } from "react";
import { speakNaturally } from "@/services/audioProcessor";
import { getLocalizedGreeting } from "@/services/audioProcessor";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  useEffect(() => {
    if (loaded) {
      // Delay the greeting slightly to avoid interrupting the user
      setTimeout(() => {
        // Get localized greeting
        const greeting = getLocalizedGreeting();
        speakNaturally(greeting, true);
      }, 1000);
    }
  }, [loaded]);

  return null; // This component doesn't render anything
};

export default WelcomeHandler;
