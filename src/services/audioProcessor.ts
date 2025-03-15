
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
  utterance.lang = 'pt-BR';
  utterance.rate = 0.85; // Even slower for better clarity
  utterance.pitch = 1.1; // Higher pitch for more expressive voice
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
  
  if (selectedVoice) {
    utterance.voice = selectedVoice;
    console.log("Using voice:", selectedVoice.name);
  } else {
    console.log("No Portuguese voice found, using default voice");
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
      resolve(false);
    }, 3000);
  });
};

// Speaks text with a natural, expressive voice - FIXING THE ISSUES WITH SPEECH
export const speakNaturally = (text: string, priority: boolean = false): void => {
  if (!('speechSynthesis' in window)) {
    console.error("Speech synthesis not supported");
    return;
  }
  
  // Force cancel any existing speech to ensure our new speech is heard
  if (speechSynthesis.speaking) {
    speechSynthesis.cancel();
    // Small delay to ensure cancellation completes
    setTimeout(() => {
      actuallySpeak(text, priority);
    }, 100);
  } else {
    actuallySpeak(text, priority);
  }
};

// Helper function to actually perform speech
const actuallySpeak = (text: string, priority: boolean): void => {
  // Add human-like variations to the text to make it sound more natural
  const naturalText = addNaturalVariations(text);
  
  // Process the text for better speech patterns
  const processedText = processTextForSpeech(naturalText);
  
  console.log("Speaking text:", processedText);
  
  // For longer texts, split by sentences to improve naturalness
  const MAX_CHUNK_LENGTH = 30; // Even shorter chunks for more natural delivery
  
  if (processedText.length > MAX_CHUNK_LENGTH) {
    // Split by sentence markers but keep the markers
    const sentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
    
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      configureNaturalVoice(utterance);
      
      // Additional tweaks for more natural voice
      utterance.pitch += (Math.random() * 0.3) - 0.15; // More random pitch variation
      utterance.rate += (Math.random() * 0.25) - 0.125;  // More random rate variation
      
      // Mobile browser workaround - add utterance events for reliability
      utterance.onstart = () => console.log('Speech started:', sentence.substring(0, 20) + '...');
      utterance.onerror = (e) => console.error('Speech error:', e);
      utterance.onend = () => console.log('Speech chunk ended');
      
      // Add a slight delay between sentences for more natural pacing
      setTimeout(() => {
        try {
          speechSynthesis.speak(utterance);
        } catch (e) {
          console.error('Error speaking:', e);
          // Try again with a simpler approach if the first attempt fails
          try {
            const simpleUtterance = new SpeechSynthesisUtterance(sentence);
            simpleUtterance.lang = 'pt-BR';
            speechSynthesis.speak(simpleUtterance);
          } catch (e2) {
            console.error('Final speech attempt failed:', e2);
          }
        }
      }, index * 600); // Longer pause between sentences for better understanding
    });
  } else {
    // For shorter texts, speak as single utterance
    const utterance = new SpeechSynthesisUtterance(processedText);
    configureNaturalVoice(utterance);
    
    // Additional tweaks for more natural voice
    utterance.pitch += (Math.random() * 0.25) - 0.125; // Random pitch variation
    utterance.rate += (Math.random() * 0.2) - 0.1;  // Random rate variation
    
    // Mobile browser workaround
    utterance.onstart = () => console.log('Speech started:', processedText.substring(0, 20) + '...');
    utterance.onerror = (e) => console.error('Speech error:', e);
    utterance.onend = () => console.log('Speech ended');
    
    try {
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Error speaking:', e);
      // Try again with a simpler approach
      try {
        const simpleUtterance = new SpeechSynthesisUtterance(processedText);
        simpleUtterance.lang = 'pt-BR';
        speechSynthesis.speak(simpleUtterance);
      } catch (e2) {
        console.error('Final speech attempt failed:', e2);
      }
    }
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
