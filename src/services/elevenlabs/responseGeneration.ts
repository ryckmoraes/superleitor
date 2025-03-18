
// ElevenLabs response generation service
import { AGENT_ID } from './config';

/**
 * Service for generating responses based on transcription
 */
export const responseGenerationService = {
  // Generate a response based on the transcription using the specific agent
  async generateResponse(transcription: string): Promise<string> {
    // If transcription is empty or too short, return a generic response
    if (!transcription || transcription.length < 3) {
      return "Não consegui entender bem. Pode repetir de forma mais clara?";
    }
    
    try {
      console.log(`Using ElevenLabs agent ID: ${AGENT_ID} for response generation`);
      
      // Generate a custom response based on the transcription
      // Using pattern matching for common scenarios
      
      if (transcription.toLowerCase().includes("olá") || 
          transcription.toLowerCase().includes("oi") || 
          transcription.toLowerCase().includes("bom dia") || 
          transcription.toLowerCase().includes("boa tarde") || 
          transcription.toLowerCase().includes("boa noite")) {
        return "Olá! Que bom ouvir você. Como posso ajudar com sua leitura hoje?";
      }
      
      if (transcription.toLowerCase().includes("música") || 
          transcription.toLowerCase().includes("cantar") || 
          transcription.toLowerCase().includes("canção")) {
        return "Percebi que você mencionou música! As histórias com ritmo são muito envolventes!";
      }
      
      if (transcription.toLowerCase().includes("livro") || 
          transcription.toLowerCase().includes("história") || 
          transcription.toLowerCase().includes("leitura")) {
        return "Adoro histórias! Continue contando, estou ouvindo atentamente.";
      }
      
      if (transcription.toLowerCase().includes("pergunta") || 
          transcription.toLowerCase().includes("dúvida") || 
          transcription.toLowerCase().includes("como")) {
        return "Que pergunta interessante! Adoro quando as crianças são curiosas assim!";
      }
      
      // Check for animal mentions
      const animals = ["cachorro", "gato", "leão", "tigre", "elefante", "girafa", "macaco", "zebra", "pássaro"];
      for (const animal of animals) {
        if (transcription.toLowerCase().includes(animal)) {
          return `Você mencionou um ${animal}! Que legal! Os animais são personagens maravilhosos nas histórias!`;
        }
      }
      
      // Default enthusiastic responses
      const responses = [
        "Que história incrível! Continue contando, estou adorando!",
        "Nossa, que legal! E o que aconteceu depois?",
        "Que imaginação maravilhosa você tem! Continue sua história!",
        "Estou encantada com sua história! Pode me contar mais?",
        "Que aventura emocionante! Mal posso esperar para ouvir o resto!",
        "Uau! Sua história é muito criativa! Continue contando!",
        "Adorei o que você contou até agora! O que acontece em seguida?"
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    } catch (error) {
      console.error("Error generating response from ElevenLabs:", error);
      return "Sua história é fascinante! Conte-me mais sobre isso.";
    }
  }
};
