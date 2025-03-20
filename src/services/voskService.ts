
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
      const vosk = await import('vosk-browser');
      
      // Carrega o modelo de idioma português
      console.log("Carregando modelo VOSK em português...");
      
      // Caminho para o modelo - ajuste conforme a estrutura do projeto
      const modelPath = '/models/vosk-model-pt-br-small';
      
      try {
        this.model = await vosk.createModel(modelPath);
        console.log("Modelo VOSK carregado com sucesso");
        
        // Cria o reconhecedor com configuração para português brasileiro
        // Para acessar o Recognizer, precisamos verificar a estrutura da biblioteca
        
        // Em algumas versões do vosk-browser, o Recognizer está disponível diretamente
        if (typeof vosk.Recognizer === 'function') {
          console.log("Usando vosk.Recognizer");
          this.recognizer = new vosk.Recognizer({
            model: this.model,
            sampleRate: 16000
          });
        } 
        // Em outras, pode estar dentro do objeto default
        else if (vosk.default && typeof vosk.default.Recognizer === 'function') {
          console.log("Usando vosk.default.Recognizer");
          this.recognizer = new vosk.default.Recognizer({
            model: this.model,
            sampleRate: 16000
          });
        }
        // Verificar se existe KaldiRecognizer (nome alternativo em algumas versões)
        else if (vosk.KaldiRecognizer) {
          console.log("Usando vosk.KaldiRecognizer");
          this.recognizer = new vosk.KaldiRecognizer({
            model: this.model,
            sampleRate: 16000
          });
        }
        else if (vosk.default && vosk.default.KaldiRecognizer) {
          console.log("Usando vosk.default.KaldiRecognizer");
          this.recognizer = new vosk.default.KaldiRecognizer({
            model: this.model,
            sampleRate: 16000
          });
        }
        else {
          console.error("Não foi possível encontrar a classe Recognizer na API do VOSK");
          console.log("Estrutura do objeto vosk:", Object.keys(vosk));
          if (vosk.default) {
            console.log("Estrutura do objeto vosk.default:", Object.keys(vosk.default));
          }
          throw new Error("API do VOSK incompatível");
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
