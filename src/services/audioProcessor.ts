// Enhanced text processor for more natural speech with pauses and intonation
export const processTextForSpeech = (text: string): string => {
  return text
    .replace(/\.\s+/g, '... ') // Add longer pause after periods
    .replace(/,\s+/g, ', ') // Ensure comma pauses
    .replace(/(!|\?)\s+/g, '$1... ') // Add pause after exclamation/question marks
    .replace(/:\s+/g, '... ') // Add pause after colons
    .replace(/(\w+)(\W+)$/g, '$1...') // Add pause at the end of sentences
    .replace(/\s{2,}/g, ' '); // Remove extra spaces
};

// Improved voice configuration for more natural speech
export const configureNaturalVoice = (utterance: SpeechSynthesisUtterance): void => {
  utterance.lang = 'pt-BR';
  utterance.rate = 0.85; // Slower for more natural pacing
  utterance.pitch = 1.05; // Slightly higher for children's content
  utterance.volume = 1.0;
  
  // Try to select a more natural female voice if available
  const voices = speechSynthesis.getVoices();
  
  // First try to find a Brazilian Portuguese female voice
  let selectedVoice = voices.find(voice => 
    voice.lang.includes('pt-BR') && 
    (voice.name.toLowerCase().includes('female') || 
     voice.name.toLowerCase().includes('mulher') ||
     voice.name.toLowerCase().includes('feminin'))
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
  }
};

// Speaks text with a natural, expressive voice
export const speakNaturally = (text: string, priority: boolean = false): void => {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech if priority message
  if (priority && speechSynthesis.speaking) {
    speechSynthesis.cancel();
  }
  
  // Don't interrupt if already speaking and not priority
  if (!priority && speechSynthesis.speaking) return;
  
  // Split long text into smaller chunks for more natural delivery
  const MAX_CHUNK_LENGTH = 100;
  const processedText = processTextForSpeech(text);
  
  // Split by sentence markers but keep the markers
  const sentences = processedText.match(/[^.!?]+[.!?]+/g) || [processedText];
  
  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    configureNaturalVoice(utterance);
    
    // Add a slight delay between sentences for more natural pacing
    setTimeout(() => {
      speechSynthesis.speak(utterance);
    }, index * 200);
  });
};
