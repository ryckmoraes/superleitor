
// ElevenLabs response generation service
import { AGENT_ID } from './config';

/**
 * Enhanced service for generating intelligent responses based on transcription
 */
export const responseGenerationService = {
  // Generate a response based on the transcription using content analysis
  async generateResponse(transcription: string): Promise<string> {
    // If transcription is empty or too short, return a generic response
    if (!transcription || transcription.length < 3) {
      return "Não consegui entender bem. Pode repetir de forma mais clara?";
    }
    
    try {
      console.log(`Analyzing story content for detailed response`);
      
      // Enhanced content analysis - checking for different story elements
      const contentAnalysis = analyzeStoryContent(transcription);
      
      // Generate response based on content analysis
      return generateDetailedResponse(contentAnalysis, transcription);
    } catch (error) {
      console.error("Error generating response from content analysis:", error);
      return "Sua história é fascinante! Conte-me mais sobre isso.";
    }
  }
};

/**
 * Analyzes story content for key elements and themes
 */
const analyzeStoryContent = (text: string) => {
  const lowerText = text.toLowerCase();
  
  // Story element detection
  const hasCharacters = detectCharacters(lowerText);
  const hasSetting = detectSetting(lowerText);
  const hasPlot = detectPlot(lowerText);
  const hasConflict = detectConflict(lowerText);
  const hasEmotions = detectEmotions(lowerText);
  const hasDialogue = lowerText.includes('"') || lowerText.includes('—') || 
                      lowerText.includes('disse') || lowerText.includes('falou');
  
  // Theme detection
  const themes = detectThemes(lowerText);
  
  // Complexity assessment
  const complexity = assessComplexity(text);
  
  // Creativity assessment
  const creativity = assessCreativity(lowerText);
  
  return {
    hasCharacters,
    hasSetting,
    hasPlot,
    hasConflict,
    hasEmotions,
    hasDialogue,
    themes,
    complexity,
    creativity,
    wordCount: text.split(/\s+/).length
  };
};

/**
 * Detects character mentions in the story
 */
const detectCharacters = (text: string) => {
  // Common character indicators
  const characterIndicators = [
    'menino', 'menina', 'homem', 'mulher', 'garoto', 'garota',
    'príncipe', 'princesa', 'rei', 'rainha', 'bruxa', 'fada',
    'amigo', 'amiga', 'professor', 'professora', 'pai', 'mãe',
    'cachorro', 'gato', 'animal', 'monstro', 'dragão', 'gigante'
  ];
  
  return characterIndicators.some(char => text.includes(char));
};

/**
 * Detects setting mentions in the story
 */
const detectSetting = (text: string) => {
  // Common setting indicators
  const settingIndicators = [
    'castelo', 'floresta', 'casa', 'escola', 'cidade', 'vila',
    'montanha', 'mar', 'oceano', 'rio', 'lago', 'céu',
    'espaço', 'planeta', 'reino', 'terra', 'mundo', 'país',
    'jardim', 'parque', 'praia', 'campo', 'fazenda'
  ];
  
  return settingIndicators.some(setting => text.includes(setting));
};

/**
 * Detects plot elements in the story
 */
const detectPlot = (text: string) => {
  // Common plot indicators
  const plotIndicators = [
    'então', 'depois', 'quando', 'antes', 'finalmente', 'por fim',
    'começou', 'terminou', 'aconteceu', 'decidiu', 'descobriu',
    'viajou', 'encontrou', 'lutou', 'venceu', 'perdeu', 'resolveu'
  ];
  
  return plotIndicators.some(plot => text.includes(plot));
};

/**
 * Detects conflict elements in the story
 */
const detectConflict = (text: string) => {
  // Common conflict indicators
  const conflictIndicators = [
    'problema', 'dificuldade', 'luta', 'batalha', 'guerra',
    'medo', 'perigo', 'mal', 'vilão', 'inimigo', 'monstro',
    'desafio', 'obstáculo', 'impossível', 'difícil', 'assustador'
  ];
  
  return conflictIndicators.some(conflict => text.includes(conflict));
};

/**
 * Detects emotional elements in the story
 */
const detectEmotions = (text: string) => {
  // Common emotion indicators
  const emotionIndicators = [
    'feliz', 'triste', 'assustado', 'com medo', 'alegre', 'animado',
    'bravo', 'furioso', 'calmo', 'ansioso', 'nervoso', 'preocupado',
    'aliviado', 'surpreso', 'chocado', 'maravilhado', 'encantado'
  ];
  
  return emotionIndicators.some(emotion => text.includes(emotion));
};

/**
 * Detects themes in the story
 */
const detectThemes = (text: string) => {
  const themeMap: {[key: string]: string[]} = {
    'amizade': ['amigo', 'amiga', 'amizade', 'juntos', 'ajudar'],
    'família': ['família', 'pai', 'mãe', 'irmão', 'irmã', 'avó', 'avô'],
    'aventura': ['aventura', 'explorar', 'descobrir', 'viagem', 'missão'],
    'coragem': ['coragem', 'valente', 'enfrentar', 'medo', 'corajoso'],
    'magia': ['magia', 'mágico', 'feitiço', 'encantado', 'poderes'],
    'natureza': ['natureza', 'animal', 'planta', 'floresta', 'mar'],
    'superação': ['superar', 'vencer', 'conseguir', 'difícil', 'desafio']
  };
  
  return Object.entries(themeMap)
    .filter(([_, keywords]) => keywords.some(word => text.includes(word)))
    .map(([theme]) => theme);
};

/**
 * Assesses the complexity of the story
 */
const assessComplexity = (text: string) => {
  const words = text.split(/\s+/);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (words.length < 20) return 'simples';
  if (words.length > 50) return 'elaborada';
  
  // Calculate average words per sentence
  const avgWordsPerSentence = sentences.length > 0 ? 
    words.length / sentences.length : 0;
  
  if (avgWordsPerSentence > 12) return 'elaborada';
  return 'média';
};

/**
 * Assesses the creativity of the story
 */
const assessCreativity = (text: string) => {
  // Common fantasy elements that indicate creativity
  const fantasyElements = [
    'mágico', 'mágica', 'magia', 'fada', 'bruxa', 'dragão', 'feitiço',
    'príncipe', 'princesa', 'reino', 'castelo', 'poderes', 'super',
    'voar', 'invisível', 'transformar', 'gigante', 'anão', 'elfo',
    'dinossauro', 'robô', 'nave', 'espaço', 'alienígena', 'viagem no tempo'
  ];
  
  const creativityScore = fantasyElements.filter(elem => text.includes(elem)).length;
  
  if (creativityScore > 3) return 'muito criativa';
  if (creativityScore > 1) return 'criativa';
  return 'realista';
};

/**
 * Generates detailed response based on content analysis
 */
const generateDetailedResponse = (analysis: any, originalText: string) => {
  // Praise specific story elements
  const praises = [];
  
  if (analysis.hasCharacters) {
    praises.push("Adorei os personagens da sua história!");
  }
  
  if (analysis.hasSetting) {
    praises.push("Você criou um cenário muito interessante!");
  }
  
  if (analysis.hasPlot) {
    praises.push("Sua história tem um enredo muito bem desenvolvido!");
  }
  
  if (analysis.hasConflict) {
    praises.push("Os desafios na sua história deixam tudo mais emocionante!");
  }
  
  if (analysis.hasEmotions) {
    praises.push("Gostei muito de como você expressou as emoções!");
  }
  
  if (analysis.hasDialogue) {
    praises.push("Os diálogos ficaram muito naturais!");
  }
  
  // Comment on themes
  let themeComment = "";
  if (analysis.themes.length > 0) {
    themeComment = `Percebi que você falou sobre ${analysis.themes.join(" e ")}, temas muito importantes!`;
  }
  
  // Comment on complexity and creativity
  let styleComment = "";
  if (analysis.complexity !== 'simples' || analysis.creativity !== 'realista') {
    styleComment = `Sua história é ${analysis.complexity} e ${analysis.creativity}!`;
  }
  
  // Generate follow-up question based on missing elements
  let followUpQuestion = "O que acontece depois?";
  
  if (!analysis.hasCharacters) {
    followUpQuestion = "Quem são os personagens principais da sua história?";
  } else if (!analysis.hasSetting) {
    followUpQuestion = "Onde essa história acontece?";
  } else if (!analysis.hasConflict) {
    followUpQuestion = "Qual é o maior desafio que os personagens enfrentam?";
  } else if (analysis.themes.includes('aventura')) {
    followUpQuestion = "Que outras aventuras esses personagens podem viver?";
  }
  
  // Build the complete response
  let response = "";
  
  if (praises.length > 0) {
    // Select 1-2 praises randomly to avoid overwhelming responses
    const selectedPraises = praises.length > 2 ? 
      praises.sort(() => 0.5 - Math.random()).slice(0, 2) : 
      praises;
    
    response += selectedPraises.join(" ") + " ";
  }
  
  if (themeComment) {
    response += themeComment + " ";
  }
  
  if (styleComment) {
    response += styleComment + " ";
  }
  
  // Add follow-up question
  response += followUpQuestion;
  
  return response.trim();
};
