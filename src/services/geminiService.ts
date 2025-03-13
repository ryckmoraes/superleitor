
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
  private model = "gemini-1.5-pro";

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
      
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine MIME type (adjust as needed based on your recording format)
      const mimeType = audioBlob.type || "audio/webm";
      
      console.log(`Processing audio: ${audioBlob.size} bytes, type: ${mimeType}`);
      
      const messages: GeminiMessage[] = [
        {
          role: "user",
          parts: [
            {
              text: `
              Transcreva e responda a este áudio com uma voz natural e conversacional.
              
              Considere os seguintes aspectos:
              - Identifique o principal conteúdo da história
              - Responda como se estivesse tendo uma conversa informal
              - Use linguagem simples e acessível para crianças
              - Evite formalidades ou tom robótico
              - Faça perguntas curiosas relacionadas ao tema da história
              - Mantenha a resposta curta e envolvente
              - Use uma linguagem expressiva e calorosa
              
              Responda em português brasileiro coloquial, como uma conversa entre amigos.
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
              temperature: 0.8, // Increased for more creativity and natural responses
              max_output_tokens: 400, // Shorter responses to be more concise
              top_k: 40,
              top_p: 0.95,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        throw new Error(`Erro na API Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        console.error("Invalid response format from Gemini API:", data);
        throw new Error("Resposta inválida da API Gemini");
      }
      
      return data.candidates[0].content.parts[0].text || "Não foi possível processar o áudio.";
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
      return "Desculpe, tive um problema ao analisar sua história. Vamos tentar novamente?";
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
