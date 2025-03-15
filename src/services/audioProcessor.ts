
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
  
  // NEW: Faster rate for more natural sound (increased from 0.95)
  utterance.rate = 1.15;  // Slightly faster than normal for more natural flow
  utterance.pitch = 1.05; // Slightly higher pitch sounds more engaging
  utterance.volume = 1.0; // Maximum volume
  
  // Try to select a more natural female voice if available
  const voices = window.speechSynthesis.getVoices();
  
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
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      console.log("Voices already loaded:", voices.length, "voices available");
      console.log("Available Portuguese voices:", voices.filter(v => v.lang.includes('pt')).map(v => v.name).join(', '));
      resolve(true);
      return;
    }
    
    // Wait for voices to be loaded (important for mobile browsers)
    const voicesChanged = () => {
      const availableVoices = window.speechSynthesis.getVoices();
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
    }, 5000); // Extended timeout
  });
};

// IMPROVED: SPEECH SYSTEM COMPLETELY REVISED FOR MORE NATURAL SPEECH
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
  
  // Longer delay to ensure cancellation completes
  setTimeout(() => {
    try {
      // Force device volume to be high using web audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 1.0; // max volume
        gainNode.connect(audioCtx.destination);
      } catch (e) {
        console.error("Could not initialize audio context for volume", e);
      }
      
      actuallySpeak(text, priority);
    } catch (e) {
      console.error("Error initializing speech:", e);
      // Fallback to simple speech on error
      simpleSpeakFallback(text);
    }
  }, 300); // Longer delay to ensure previous speech is canceled
};

// Super simplified fallback for speech when everything else fails
const simpleSpeakFallback = (text: string): void => {
  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.volume = 1.0;
    // NEW: Faster rate for more natural speech
    utterance.rate = 1.2;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
    console.log("Using simple fallback speech");
  } catch (e) {
    console.error("Even fallback speech failed:", e);
  }
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
    const MAX_CHUNK_LENGTH = 15; // MUCH shorter chunks for more reliable delivery
    
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
          
          // NEW: Increased speed for more natural flow
          utterance.rate = 1.15; // Faster rate makes it sound more natural
          utterance.volume = 1.0; // Maximum volume always
          
          // Events
          utterance.onstart = () => console.log('Speech started:', sentence.substring(0, 20) + '...');
          utterance.onerror = (e) => {
            console.error('Speech error:', e);
            // Try next sentence on error
            setTimeout(speakNextSentence, 200); // Reduced delay between sentences
          };
          utterance.onend = () => {
            console.log('Speech chunk ended');
            // Smaller pause between sentences for more natural flow
            setTimeout(speakNextSentence, 200); // Quicker transition feels more natural
          };
          
          // Speak
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Error in speech synthesis:', e);
          // Try fallback approach with longer delay
          setTimeout(() => {
            try {
              const simpleUtterance = new SpeechSynthesisUtterance(sentence);
              simpleUtterance.lang = 'pt-BR';
              simpleUtterance.volume = 1.0;
              simpleUtterance.rate = 1.2; // Faster for more natural sound
              
              // Set direct events for fallback
              simpleUtterance.onend = () => setTimeout(speakNextSentence, 200);
              simpleUtterance.onerror = () => setTimeout(speakNextSentence, 200);
              
              window.speechSynthesis.speak(simpleUtterance);
            } catch (e2) {
              console.error('Fallback speech failed:', e2);
              // Continue to next sentence anyway
              setTimeout(speakNextSentence, 200);
            }
          }, 200);
        }
      };
      
      // Start speaking sentences
      speakNextSentence();
    } else {
      // For shorter texts, speak as single utterance with multiple attempts
      const attemptSpeech = (attemptCount = 0) => {
        if (attemptCount > 2) {
          console.error("Failed after multiple speech attempts");
          simpleSpeakFallback(processedText);
          return;
        }
        
        try {
          const utterance = new SpeechSynthesisUtterance(processedText);
          configureNaturalVoice(utterance);
          
          // NEW: Override with faster rate
          utterance.rate = 1.15; // Faster rate sounds more natural
          utterance.volume = 1.0; // Always maximum volume
          
          // Mobile browser event handlers with error recovery
          utterance.onstart = () => console.log('Speech started:', processedText.substring(0, 20) + '...');
          utterance.onerror = (e) => {
            console.error('Speech error:', e);
            // Try again on error
            setTimeout(() => attemptSpeech(attemptCount + 1), 200);
          };
          utterance.onend = () => console.log('Speech ended');
          
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Error in speech synthesis, attempt ' + attemptCount + ':', e);
          // Try again with a delay
          setTimeout(() => attemptSpeech(attemptCount + 1), 200);
        }
      };
      
      // Start first attempt
      attemptSpeech();
    }
  } catch (error) {
    console.error("Error in speech processing:", error);
    // Use the simplest possible fallback
    simpleSpeakFallback(text);
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
