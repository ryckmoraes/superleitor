// Serviço VOSK para reconhecimento de fala offline

interface VoskResult {
  text: string;
  result?: { conf: number; end: number; start: number; word: string }[];
  partial?: string;
}

class VoskService {
  private isInitialized: boolean = false;
  private model: any = null;
  private recognizer: any = null;
  
  constructor() {
    this.initialize = this.initialize.bind(this);
    this.processAudioData = this.processAudioData.bind(this);
  }
  
  /**
   * Inicializa o serviço VOSK
   */
  public async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }
      
      // Importação dinâmica do VOSK
      const voskModule = await import('vosk-browser');
      
      // Carrega o modelo de idioma português
      console.log("Carregando modelo VOSK em português...");
      
      // Caminho para o modelo - ajuste conforme a estrutura do projeto
      const modelPath = '/models/vosk-model-pt-br-small';
      
      try {
        // Extract the vosk object from the module
        const vosk = voskModule.default || voskModule;
        
        // Log the available properties for debugging
        console.log("Propriedades disponíveis em vosk:", Object.keys(vosk));
        
        // Create the model using the documented createModel API method
        this.model = await vosk.createModel(modelPath);
        console.log("Modelo VOSK carregado com sucesso");
        console.log("Métodos disponíveis no modelo:", Object.keys(this.model));
        
        // Try to create a recognizer using the model's method if it exists
        if (typeof this.model.createRecognizer === 'function') {
          this.recognizer = await this.model.createRecognizer(16000);
          console.log("Recognizer created with model.createRecognizer");
        } 
        // Try using a hypothetical createRecognizer function from the model class directly
        else if (typeof this.model.constructor?.createRecognizer === 'function') {
          this.recognizer = await this.model.constructor.createRecognizer(this.model, 16000);
          console.log("Recognizer created with model.constructor.createRecognizer");
        } 
        // If the model has direct methods for recognition, use the model as the recognizer
        else if (
          typeof this.model.acceptWaveform === 'function' && 
          typeof this.model.result === 'function'
        ) {
          console.log("Using model directly as recognizer (has required methods)");
          this.recognizer = this.model;
        }
        // Last attempt - try to construct a recognizer by inspecting the vosk object
        else {
          console.log("Attempting to construct a recognizer by inspecting vosk structure");
          
          // Dump all available properties and methods of vosk and this.model for debugging
          for (const key in vosk) {
            console.log(`vosk.${key} type:`, typeof vosk[key]);
            if (typeof vosk[key] === 'function' && key.toLowerCase().includes('recognizer')) {
              console.log(`Found potential recognizer constructor: ${key}`);
            }
          }
          
          // Look for any method that contains "recognizer" in its name
          const recognizerMethod = Object.keys(vosk).find(
            key => typeof vosk[key] === 'function' && key.toLowerCase().includes('recognizer')
          );
          
          if (recognizerMethod) {
            try {
              console.log(`Trying to use ${recognizerMethod}`);
              this.recognizer = await vosk[recognizerMethod](this.model, 16000);
            } catch (e) {
              console.error(`Error using ${recognizerMethod}:`, e);
            }
          }
          
          // If still no recognizer, use model directly as a last resort
          if (!this.recognizer) {
            console.log("FALLBACK: Using model directly as recognizer");
            this.recognizer = this.model;
          }
        }
        
        // Log the recognizer's available methods for debugging
        console.log("Métodos disponíveis no reconhecedor:", 
          this.recognizer ? Object.keys(this.recognizer) : "Reconhecedor não criado");
        
        if (!this.recognizer) {
          throw new Error("Não foi possível criar um reconhecedor VOSK");
        }
        
        this.isInitialized = true;
        return true;
        
      } catch (error) {
        console.error("Erro ao carregar modelo VOSK:", error);
        throw new Error(`Falha ao carregar modelo VOSK: ${error}`);
      }
    } catch (error) {
      console.error("Erro ao inicializar VOSK:", error);
      throw new Error(`Falha ao inicializar VOSK: ${error}`);
    }
  }
  
  /**
   * Processa dados de áudio e retorna o resultado do reconhecimento
   */
  public async processAudioData(audioData: Uint8Array | Float32Array): Promise<VoskResult> {
    if (!this.isInitialized || !this.recognizer) {
      throw new Error("VOSK não foi inicializado. Chame initialize() primeiro.");
    }
    
    try {
      // Converte os dados para o formato esperado pelo VOSK, se necessário
      let processableData = audioData;
      
      // Se os dados forem Float32Array, converte para Int16Array (formato que VOSK espera)
      if (audioData instanceof Float32Array) {
        const int16Data = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          // Escala para o intervalo de Int16 (-32768 a 32767)
          int16Data[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
        }
        processableData = new Uint8Array(int16Data.buffer);
      }
      
      // Processa o áudio
      const isFinished = this.recognizer.acceptWaveform(processableData);
      
      // Obtém o resultado final ou parcial
      if (isFinished) {
        return this.recognizer.result();
      } else {
        return this.recognizer.partialResult();
      }
    } catch (error) {
      console.error("Erro ao processar áudio com VOSK:", error);
      return { text: "" };
    }
  }
  
  /**
   * Finaliza o reconhecimento e retorna o texto final
   */
  public getFinalResult(): VoskResult {
    if (!this.isInitialized || !this.recognizer) {
      return { text: "" };
    }
    
    return this.recognizer.finalResult();
  }
  
  /**
   * Reseta o reconhecedor para uma nova fala
   */
  public reset(): void {
    if (this.isInitialized && this.recognizer) {
      this.recognizer.reset();
    }
  }
  
  /**
   * Libera os recursos utilizados pelo VOSK
   */
  public cleanup(): void {
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
    }
    
    if (this.model) {
      this.model.free();
      this.model = null;
    }
    
    this.isInitialized = false;
  }
}

// Singleton instance
export const voskService = new VoskService();
