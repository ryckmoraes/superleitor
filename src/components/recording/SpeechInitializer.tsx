
import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";
import { elevenLabsService } from "@/services/elevenLabsService";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  
  // Initialize speech synthesis (without audio test)
  useEffect(() => {
    if (!speechInitializedRef.current) {
      // Initialize browser speech synthesis
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Speech synthesis initialized:", initialized);
      });
      
      // Ensure ElevenLabs API key is set
      if (!elevenLabsService.hasApiKey()) {
        // Use the voice ID as a placeholder key for testing
        elevenLabsService.setApiKey("eNwyboGu8S4QiAWXpwUM");
        console.log("ElevenLabs voice ID set");
      }
    }
  }, []);

  return null; // This is a setup component, not a visual one
};

export default SpeechInitializer;
