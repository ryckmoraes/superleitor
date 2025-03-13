
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
      // Convert blob to base64
      const base64Audio = await this.blobToBase64(audioBlob);
      
      // Determine MIME type (adjust as needed based on your recording format)
      const mimeType = audioBlob.type || "audio/webm";
      
      const messages: GeminiMessage[] = [
        {
          role: "user",
          parts: [
            {
              text: "Por favor, transcreva e analise esse áudio. Identifique padrões na fala, tom emocional e conteúdo principal. Responda em português."
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
              temperature: 0.2,
              max_output_tokens: 800,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível processar o áudio.";
    } catch (error) {
      console.error("Error processing audio with Gemini:", error);
      return "Erro ao processar o áudio com o Gemini.";
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
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const geminiService = new GeminiService();
