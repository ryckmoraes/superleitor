
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
              - Responda SEMPRE de forma MUITO BREVE (máximo 2 frases curtas)
              - Use linguagem MUITO SIMPLES que uma criança pequena entenderia facilmente
              - Use linguagem MUITO conversacional e calorosa, como se estivesse falando com a criança pessoalmente
              - Inclua expressões coloquiais naturais como "nossa", "que legal", "caramba", "puxa" no início da frase
              - Se for uma história incompleta ou confusa, responda de forma entusiasmada e peça mais detalhes
              
              IMPORTANTE: 
              - Responda APENAS em português brasileiro conversacional
              - Nunca mencione que você é AI, apenas responda à história
              - Seja extremamente entusiasmado, como um adulto conversando com uma criança
              - Mantenha respostas SEMPRE muito curtas e simples
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

      // Implement with shorter timeout and more reliable fallbacks
      return await Promise.race([
        this.callGeminiAPI(messages, this.model),
        // Set timeout that will reject if the API call takes too long
        new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error("API timeout")), 8000)
        ) 
      ])
      .catch(async (error) => {
        console.log(`Primary model error or timeout: ${error}. Trying fallback...`);
        // Try fallback model with shorter timeout
        return await Promise.race([
          this.callGeminiAPI(messages, this.fallbackModel),
          new Promise<string>((_, reject) => 
            setTimeout(() => reject(new Error("Fallback timeout")), 6000)
          )
        ]);
      })
      .catch(error => {
        console.error("All models failed:", error);
        return "Nossa! Que história incrível! Conta mais detalhes pra mim?";
      });
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
      return "Puxa, adorei sua história! Me conta mais?";
    }
  }

  /**
   * Call the Gemini API with the given messages and model
   */
  private async callGeminiAPI(messages: GeminiMessage[], model: string): Promise<string> {
    const response = await fetch(
      `${this.apiUrl}/${model}:generateContent?key=${this.apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: messages,
          generation_config: {
            temperature: 1.0,
            max_output_tokens: 100, // Shorter responses
            top_k: 40,
            top_p: 0.95,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
      throw new Error("Invalid response format");
    }
    
    const responseText = data.candidates[0].content.parts[0].text || "";
    return responseText || "Nossa, que história legal! Me conta mais!";
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
