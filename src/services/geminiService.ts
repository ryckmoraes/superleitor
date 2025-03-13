import { getApiKey } from "@/utils/apiKeys";

type GeminiMessage = {
  role: "user" | "model";
  parts: Array<{
    text?: string;
    audio_data?: {
      mime_type: string;
      data: string;
    }
  }>;
};

export class GeminiService {
  private apiKey: string;
  private apiUrl = "https://generativelanguage.googleapis.com/v1beta/models";
  private model = "gemini-2.0-pro-exp-02-05"; // Updated to Gemini 2.0

  constructor() {
    this.apiKey = getApiKey("gemini");
  }

  /**
   * Process the audio data with Google Gemini model
   * @param audioBlob Audio data to be processed
   * @returns Promise with the response text
   */
  async processAudio(audioBlob: Blob): Promise<string> {
    try {
      if (!audioBlob || audioBlob.size === 0) {
        console.error("Empty audio blob received");
        return "Não foi possível processar o áudio: gravação vazia.";
      }
      
      // Validate audio blob size - reject if too small
      if (audioBlob.size < 1000) {
        console.error("Audio blob too small:", audioBlob.size, "bytes");
        return "Parece que a gravação foi muito curta. Tente falar por mais tempo.";
      }
      
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine MIME type (adjust as needed based on your recording format)
      const mimeType = audioBlob.type || "audio/webm";
      
      console.log(`Processing audio: ${audioBlob.size} bytes, type: ${mimeType}, using model: ${this.model}`);
      
      const messages: GeminiMessage[] = [
        {
          role: "user",
          parts: [
            {
              text: `
              Transcreva e responda a este áudio usando uma linguagem extremamente natural, conversacional e com uma abordagem calorosa.
              
              Instruções importantes:
              - Identifique o principal conteúdo da história
              - Responda como se fosse um amigo próximo ou familiar falando com uma criança
              - Use linguagem muito simples e acessível
              - Evite TOTALMENTE formalidades, termos técnicos ou tom robótico
              - Faça uma pergunta curiosa e engajadora relacionada ao tema da história
              - Mantenha a resposta relativamente curta (2-3 frases) e muito calorosa
              - Use expressões coloquiais naturais do português brasileiro
              - Inclua pausas naturais como "hmm", "ah", "nossa", quando apropriado
              
              IMPORTANTE: 
              - Responda APENAS em português brasileiro conversacional
              - Fale como se estivesse conversando pessoalmente, de forma totalmente natural
              - Não use linguagem explicativa ou instrucional em momento algum
              - Não mencione que você é uma IA, apenas responda diretamente à história
              `
            },
            {
              audio_data: {
                mime_type: mimeType,
                data: base64Audio
              }
            }
          ]
        }
      ];

      // Set longer timeout for fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Extended timeout to 45s

      const response = await fetch(
        `${this.apiUrl}/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: messages,
            generation_config: {
              temperature: 1.0, // Increased for more conversational, varied responses
              max_output_tokens: 300, // Shorter responses to be more concise
              top_k: 40,
              top_p: 0.95,
            },
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        
        // Check for specific error types
        if (response.status === 400) {
          return "Desculpe, não consegui entender bem o áudio. Pode tentar falar mais claramente?";
        } else if (response.status === 429) {
          return "Nossa, estamos com muitas solicitações agora! Pode tentar de novo daqui a pouquinho?";
        } else if (response.status >= 500) {
          return "Hmm, parece que estamos com um probleminha técnico. Vamos tentar de novo?";
        }
        
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        console.error("Invalid response format from Gemini API:", data);
        
        // Check if there are any blocks or safety issues
        if (data.promptFeedback?.blockReason) {
          console.warn("Content was blocked:", data.promptFeedback);
          return "Hmm, parece que não consegui processar esse conteúdo. Que tal contar outra história?";
        }
        
        throw new Error("Resposta inválida da API Gemini");
      }
      
      const responseText = data.candidates[0].content.parts[0].text || "";
      
      // If response is empty or too short, provide a friendly fallback
      if (!responseText || responseText.length < 10) {
        console.error("Empty or short response from Gemini:", responseText);
        return "Que história legal! Me conta mais detalhes?";
      }
      
      return responseText;
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
      
      // Check if it's a timeout error
      if (error.name === "AbortError") {
        return "Opa, parece que demorou um pouquinho. Vamos tentar de novo? Me conta sua história novamente!";
      }
      
      return "Puxa, não consegui entender direito. Vamos tentar mais uma vez?";
    }
  }

  /**
   * Helper method to convert Blob to base64
   */
  private blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
          const base64String = reader.result.toString();
          const base64Data = base64String.substring(base64String.indexOf(',') + 1);
          resolve(base64Data);
        } else {
          reject(new Error("FileReader did not produce a result"));
        }
      };
      reader.onerror = (error) => {
        console.error("Error reading audio blob:", error);
        reject(error);
      };
      reader.readAsDataURL(blob);
    });
  }
}

export const geminiService = new GeminiService();
