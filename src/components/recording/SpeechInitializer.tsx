
import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";
import { elevenLabsService } from "@/services/elevenlabs";

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
      
      // Check if ElevenLabs API key is set
      if (!elevenLabsService.hasApiKey()) {
        console.log("No ElevenLabs API key set - voice features will use fallback");
      } else {
        console.log("ElevenLabs API key is configured:", elevenLabsService.getApiKey()?.substring(0, 3) + "...");
        console.log("Using agent ID:", elevenLabsService.getAgentId());
      }
    }
  }, []);

  return null; // This is a setup component, not a visual one
};

export default SpeechInitializer;
