
import { useEffect, useRef } from "react";
import { initVoices } from "@/services/audioProcessor";

const SpeechInitializer = () => {
  const speechInitializedRef = useRef(false);
  
  // Initialize speech synthesis (without audio test)
  useEffect(() => {
    if (!speechInitializedRef.current) {
      initVoices().then((initialized) => {
        speechInitializedRef.current = initialized;
        console.log("Speech synthesis initialized:", initialized);
      });
    }
  }, []);

  return null; // This is a setup component, not a visual one
};

export default SpeechInitializer;
