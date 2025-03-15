// Enhanced text processor for more natural speech with improved pauses and intonation
export const processTextForSpeech = (text: string): string => {
  return text
    .replace(/\.\s+/g, '... ') // Add longer pause after periods
    .replace(/,\s+/g, ', ') // Ensure comma pauses
    .replace(/(!|\?)\s+/g, '$1... ') // Add pause after exclamation/question marks
    .replace(/:\s+/g, '... ') // Add pause after colons
    .replace(/(\w+)(\W+)$/g, '$1...') // Add pause at the end of sentences
    .replace(/\s{2,}/g, ' ') // Remove extra spaces
    .replace(/\b(e|mas|porém|contudo|entretanto)\b/gi, '... $1') // Add pauses before conjunctions
    .replace(/\b(então|assim|portanto|logo)\b/gi, '... $1... '); // Add pauses around conclusive conjunctions
};

// Helper to add more human-like variations to speech
const addNaturalVariations = (text: string): string => {
  // Add occasional filler words that Brazilians use in casual speech
  const fillers = [
    { probability: 0.15, pattern: /^/g, replacements: ['Bem, ', 'Olha, ', 'Veja, ', 'Ah, ', ''] },
    { probability: 0.25, pattern: /\.\s+/g, replacements: ['. Hmm, ', '. Então, ', '. Agora, ', '. Sabe, ', '. '] },
    { probability: 0.15, pattern: /\?/g, replacements: ['? Né?', '?', '? Sabe?', '?'] },
    { probability: 0.2, pattern: /!/g, replacements: ['! Nossa!', '! Caramba!', '! Poxa!', '!'] }
  ];
  
  let result = text;
  
  fillers.forEach(({ probability, pattern, replacements }) => {
    if (Math.random() < probability) {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      result = result.replace(pattern, replacement);
    }
  });
  
  // Occasionally emphasize with repetition (Brazilian way)
  if (Math.random() < 0.08) {
    const words = result.split(' ');
    const wordToEmphasize = words[Math.floor(Math.random() * words.length)];
    if (wordToEmphasize.length > 3) {
      result = result.replace(new RegExp(`\\b${wordToEmphasize}\\b`), `${wordToEmphasize}, ${wordToEmphasize}`);
    }
  }
  
  return result;
};

// Improved voice configuration for more natural speech
export const configureNaturalVoice = (utterance: SpeechSynthesisUtterance): void => {
  // Set language to Brazilian Portuguese
  utterance.lang = 'pt-BR';
  
  // Set natural speaking parameters - more dynamic values
  utterance.rate = 0.9 + (Math.random() * 0.2 - 0.1); // Range between 0.8-1.0
  utterance.pitch = 1.1 + (Math.random() * 0.3 - 0.15); // Range between 0.95-1.25
  utterance.volume = 1.0;
  
  // Try to select a more natural female voice if available
  const voices = speechSynthesis.getVoices();
  
  // Debug available voices
  console.log("All available voices:", voices.map(v => `${v.name} (${v.lang})`).join(", "));
  
  // First try to find a Brazilian Portuguese female voice
  let selectedVoice = voices.find(voice => 
    voice.lang.includes('pt-BR') && 
    (voice.name.toLowerCase().includes('female') || 
     voice.name.toLowerCase().includes('mulher') ||
     voice.name.toLowerCase().includes('femin'))
  );
  
  // If not found, try any Brazilian Portuguese voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.includes('pt-BR'));
  }
  
  // Fallback to any Portuguese voice
  if (!selectedVoice) {
    selectedVoice = voices.find(voice => voice.lang.includes('pt'));
  }
  
  // Final fallback to any available voice if no Portuguese voice is found
  if (!selectedVoice && voices.length > 0) {
    selectedVoice = voices[0];
  }
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log("Using voice:", selectedVoice.name);
  } else {
    console.log("No voice found, using default browser voice");
  }
};

// Handle voice initialization for mobile
export const initVoices = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported");
      resolve(false);
      return;
    }
    
    // Check if voices are already loaded
    const voices = speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      console.log("Voices already loaded:", voices.length, "voices available");
      console.log("Available Portuguese voices:", voices.filter(v => v.lang.includes('pt')).map(v => v.name).join(', '));
      resolve(true);
      return;
    }
    
    // Wait for voices to be loaded (important for mobile browsers)
    const voicesChanged = () => {
      const availableVoices = speechSynthesis.getVoices();
      console.log("Voices loaded:", availableVoices.length, "voices available");
      console.log("Available Portuguese voices:", availableVoices.filter(v => v.lang.includes('pt')).map(v => v.name).join(', '));
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
      resolve(true);
    };
    
    window.speechSynthesis.addEventListener('voiceschanged', voicesChanged);
    
    // Set a timeout in case voices never load
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', voicesChanged);
      console.warn("Timed out waiting for voices to load");
      resolve(true); // Still resolve true to allow fallback mechanisms
    }, 3000);
  });
};

// Speaks text with a natural, expressive voice - FIXING THE ISSUES WITH SPEECH
export const speakNaturally = (text: string, priority: boolean = false): void => {
  if (!('speechSynthesis' in window)) {
    console.error("Speech synthesis not supported");
    return;
  }
  
  console.log("Speaking text:", text);
  
  // Force cancel any existing speech to ensure our new speech is heard
  try {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
  } catch (e) {
    console.error("Error cancelling speech:", e);
  }
  
  // Small delay to ensure cancellation completes
  setTimeout(() => {
    actuallySpeak(text, priority);
  }, 50);
};

// Helper function to actually perform speech
const actuallySpeak = (text: string, priority: boolean): void => {
  try {
    // Add human-like variations to the text to make it sound more natural
    const naturalText = addNaturalVariations(text);
    
    // Process the text for better speech patterns
    const processedText = processTextForSpeech(naturalText);
    
    console.log("Speaking processed text:", processedText);
    
    // For longer texts, split by sentences to improve naturalness
    const MAX_CHUNK_LENGTH = 25; // Even shorter chunks for more natural delivery
    
    if (processedText.length > MAX_CHUNK_LENGTH) {
      // Split by sentence markers but keep the markers
      const sentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
      let sentenceIndex = 0;
      
      // Function to speak next sentence
      const speakNextSentence = () => {
        if (sentenceIndex >= sentences.length) return;
        
        const sentence = sentences[sentenceIndex];
        sentenceIndex++;
        
        try {
          // Create and configure utterance
          const utterance = new SpeechSynthesisUtterance(sentence);
          configureNaturalVoice(utterance);
          
          // Additional tweaks for more natural voice
          utterance.pitch += (Math.random() * 0.4) - 0.2; // More random pitch variation
          utterance.rate += (Math.random() * 0.3) - 0.15;  // More random rate variation
          
          // Events
          utterance.onstart = () => console.log('Speech started:', sentence.substring(0, 20) + '...');
          utterance.onerror = (e) => {
            console.error('Speech error:', e);
            // Try next sentence on error
            speakNextSentence();
          };
          utterance.onend = () => {
            console.log('Speech chunk ended');
            // Small pause between sentences
            setTimeout(speakNextSentence, 150);
          };
          
          // Speak
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Error in speech synthesis:', e);
          // Try fallback approach
          try {
            const simpleUtterance = new SpeechSynthesisUtterance(sentence);
            simpleUtterance.lang = 'pt-BR';
            
            // Set direct events for fallback
            simpleUtterance.onend = () => setTimeout(speakNextSentence, 150);
            simpleUtterance.onerror = () => setTimeout(speakNextSentence, 150);
            
            window.speechSynthesis.speak(simpleUtterance);
          } catch (e2) {
            console.error('Fallback speech failed:', e2);
            // Continue to next sentence anyway
            setTimeout(speakNextSentence, 150);
          }
        }
      };
      
      // Start speaking sentences
      speakNextSentence();
    } else {
      // For shorter texts, speak as single utterance
      try {
        const utterance = new SpeechSynthesisUtterance(processedText);
        configureNaturalVoice(utterance);
        
        // Additional tweaks for more natural voice
        utterance.pitch += (Math.random() * 0.3) - 0.15; // Random pitch variation
        utterance.rate += (Math.random() * 0.2) - 0.1;  // Random rate variation
        
        // Mobile browser event handlers
        utterance.onstart = () => console.log('Speech started:', processedText.substring(0, 20) + '...');
        utterance.onerror = (e) => console.error('Speech error:', e);
        utterance.onend = () => console.log('Speech ended');
        
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.error('Error in speech synthesis:', e);
        // Try again with a simpler approach
        try {
          const simpleUtterance = new SpeechSynthesisUtterance(processedText);
          simpleUtterance.lang = 'pt-BR';
          window.speechSynthesis.speak(simpleUtterance);
        } catch (e2) {
          console.error('Fallback speech failed:', e2);
        }
      }
    }
  } catch (error) {
    console.error("Error in speech processing:", error);
  }
};

// Process speech recognition results
export const processRecognitionResult = (transcript: string): string => {
  // Clean up the transcript
  let processedText = transcript
    .trim()
    .replace(/\s+/g, ' ') // Remove multiple spaces
    .replace(/^\s+|\s+$/g, ''); // Trim leading/trailing spaces
    
  // Capitalize first letter of sentences
  processedText = processedText.replace(/(^|[.!?]\s+)([a-z])/g, 
    (match, separator, letter) => separator + letter.toUpperCase()
  );
  
  return processedText;
};

// Provide simple response to recognized text
export const generateSimpleResponse = (transcript: string): string => {
  // Simple keyword-based responses
  if (transcript.toLowerCase().includes('olá') || 
      transcript.toLowerCase().includes('oi') || 
      transcript.toLowerCase().includes('bom dia') || 
      transcript.toLowerCase().includes('boa tarde') || 
      transcript.toLowerCase().includes('boa noite')) {
    return 'Olá! Que bom falar com você. Como posso ajudar com sua história hoje?';
  }
  
  if (transcript.toLowerCase().includes('quem é você') || 
      transcript.toLowerCase().includes('como você se chama') || 
      transcript.toLowerCase().includes('qual é o seu nome')) {
    return 'Eu sou a Esfera Sonora, sua amiga que adora ouvir e contar histórias!';
  }
  
  if (transcript.toLowerCase().includes('obrigado') || 
      transcript.toLowerCase().includes('obrigada') || 
      transcript.toLowerCase().includes('valeu')) {
    return 'De nada! Foi um prazer ajudar. Conte-me mais quando quiser!';
  }
  
  // Default response for stories
  if (transcript.length > 30) {
    const responses = [
      'Que história interessante! Conte-me mais sobre isso.',
      'Adorei essa parte da sua história. O que aconteceu depois?',
      'Sua história é muito criativa! Continue contando, estou adorando ouvir.',
      'Que legal! E depois, o que aconteceu com os personagens?',
      'Estou gostando muito da sua história. Você tem muita imaginação!'
    ];
    
    // Select a random response
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Default fallback
  return 'Entendi! Continue contando sua história.';
};
