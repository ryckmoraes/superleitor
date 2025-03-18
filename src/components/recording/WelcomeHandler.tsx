
import { useEffect, useRef } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { speakNaturally } from "@/services/audioProcessor";
import { showToastOnly } from "@/services/notificationService";

interface WelcomeHandlerProps {
  loaded: boolean;
}

const WelcomeHandler = ({ loaded }: WelcomeHandlerProps) => {
  const { onboardingData } = useOnboarding();
  const welcomeSpokenRef = useRef(false);

  // Improved welcome message function
  const speakWelcomeMessage = () => {
    if (onboardingData.superReaderName) {
      // Create welcome message with the SuperLeitor name
      const welcomeMessage = `Olá ${onboardingData.superReaderName}! Que bom te ver! Que história você quer me contar hoje?`;
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
      
      // Show generic toast if name is not set
      showToastOnly("Bem-vindo!", "Olá! Que bom te ver! Que história você quer me contar hoje?");
      
      // Speak generic welcome
      setTimeout(() => {
        speakNaturally("Olá! Que bom te ver! Que história você quer me contar hoje?", true);
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
