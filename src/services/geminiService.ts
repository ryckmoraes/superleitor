
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
  private fallbackModel = "gemini-1.5-pro-001"; // Fallback model if primary fails

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
              Transcreva este áudio e responda usando uma linguagem EXTREMAMENTE natural, 
              conversacional e com uma abordagem calorosa como se fosse um adulto falando com uma criança.
              
              Instruções importantes:
              - Identifique o principal conteúdo da história
              - Responda sempre como se fosse um amigo muito próximo ou familiar falando com uma criança
              - Use linguagem MUITO SIMPLES que uma criança entenderia facilmente
              - Evite TOTALMENTE formalidades, termos técnicos ou tom robótico
              - Faça comentários divertidos e engajadores relacionados à história
              - Mantenha a resposta entre 2-3 frases curtas e muito calorosas
              - Use expressões coloquiais naturais do português brasileiro como "nossa", "que legal", etc.
              - Inclua pausas naturais como "hmm", "ah", "poxa", quando apropriado
              
              IMPORTANTE: 
              - Responda APENAS em português brasileiro conversacional
              - Nunca mencione que você é AI, apenas responda à história
              - Seja extremamente entusiasmado, como um adulto conversando com uma criança
              - Dê a impressão de que realmente está ouvindo a história e se importa com ela
              - Em caso de falha ao processar, responda com uma mensagem genérica e entusiasmada
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

      try {
        // Set longer timeout for fetch
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000); // 12-second timeout
  
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
                temperature: 1.0, // High value for more conversational responses
                max_output_tokens: 200, // Short responses
                top_k: 40,
                top_p: 0.95,
              },
            }),
            signal: controller.signal
          }
        );
  
        clearTimeout(timeoutId);
  
        if (!response.ok) {
          console.log("Primary model failed, trying fallback model");
          throw new Error(`Erro na API Gemini: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
          console.error("Invalid response format from Gemini API:", data);
          throw new Error("Resposta inválida da API Gemini");
        }
        
        const responseText = data.candidates[0].content.parts[0].text || "";
        return responseText || "Nossa, que história legal! Me conta mais!";
        
      } catch (primaryError) {
        console.log("Trying fallback model after primary model error:", primaryError);
        
        // Try fallback model if primary fails
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 12000);
          
          const fallbackResponse = await fetch(
            `${this.apiUrl}/${this.fallbackModel}:generateContent?key=${this.apiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: messages,
                generation_config: {
                  temperature: 1.0,
                  max_output_tokens: 200,
                  top_k: 40,
                  top_p: 0.95,
                },
              }),
              signal: controller.signal
            }
          );
          
          clearTimeout(timeoutId);
          
          if (!fallbackResponse.ok) {
            throw new Error(`Erro no modelo fallback: ${fallbackResponse.status}`);
          }
          
          const fallbackData = await fallbackResponse.json();
          
          if (!fallbackData.candidates || fallbackData.candidates.length === 0) {
            throw new Error("Resposta inválida do modelo fallback");
          }
          
          const fallbackText = fallbackData.candidates[0].content.parts[0].text || "";
          return fallbackText || "Uau! Que história incrível! Conte-me mais!";
          
        } catch (fallbackError) {
          console.error("Both models failed:", fallbackError);
          return "Nossa, adorei sua história! Muito legal! Pode me contar mais?";
        }
      }
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
      
      // Check if it's a timeout error
      if (error.name === "AbortError") {
        return "Opa, parece que demorou um pouquinho. Sua história é muito legal! Me conta mais!";
      }
      
      return "Puxa, que história incrível! Me conta mais detalhes?";
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
