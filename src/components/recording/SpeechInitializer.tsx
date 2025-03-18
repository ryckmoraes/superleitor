
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
      
      // Ensure ElevenLabs API key is set to the agent ID
      if (!elevenLabsService.hasApiKey()) {
        // Use the agent ID as the API key for ElevenLabs
        const agentId = "eNwyboGu8S4QiAWXpwUM";
        elevenLabsService.setApiKey(agentId);
        console.log("ElevenLabs agent ID set:", agentId);
      }
    }
  }, []);

  return null; // This is a setup component, not a visual one
};

export default SpeechInitializer;
