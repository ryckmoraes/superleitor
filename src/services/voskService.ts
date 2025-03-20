
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
        // Obter o vosk direto do módulo ou do default
        const vosk = voskModule.default || voskModule;
        
        // Criar o modelo
        this.model = await vosk.createModel(modelPath);
        console.log("Modelo VOSK carregado com sucesso");
        
        // Em vez de tentar acessar propriedades específicas, tentamos obter
        // o construtor do reconhecedor de diferentes maneiras
        
        // Verificar se o vosk tem alguma propriedade que pode ser um construtor
        console.log("Propriedades disponíveis em vosk:", Object.keys(vosk));
        
        // Tentar criar o reconhecedor diretamente com vosk como construtor
        try {
          console.log("Tentando criar reconhecedor usando vosk como construtor");
          this.recognizer = new vosk({
            model: this.model,
            sampleRate: 16000
          });
          console.log("Reconhecedor criado com sucesso usando vosk como construtor");
        } catch (error) {
          console.log("Não foi possível usar vosk como construtor:", error);
          
          // Tentar criar com qualquer função construtora disponível no vosk
          const possibleConstructors = ['Recognizer', 'KaldiRecognizer', 'VoskRecognizer'];
          let created = false;
          
          for (const constructorName of possibleConstructors) {
            try {
              if (typeof vosk[constructorName] === 'function') {
                console.log(`Tentando criar com vosk.${constructorName}`);
                this.recognizer = new vosk[constructorName]({
                  model: this.model,
                  sampleRate: 16000
                });
                console.log(`Reconhecedor criado com sucesso usando vosk.${constructorName}`);
                created = true;
                break;
              }
            } catch (e) {
              console.log(`Erro ao usar vosk.${constructorName}:`, e);
            }
          }
          
          // Se ainda não conseguimos criar, vamos tentar usar a função createRecognizer se existir
          if (!created && typeof vosk.createRecognizer === 'function') {
            try {
              console.log("Tentando criar com vosk.createRecognizer");
              this.recognizer = vosk.createRecognizer({
                model: this.model,
                sampleRate: 16000
              });
              console.log("Reconhecedor criado com sucesso usando vosk.createRecognizer");
              created = true;
            } catch (e) {
              console.log("Erro ao usar vosk.createRecognizer:", e);
            }
          }
          
          // Se ainda não conseguimos, mostrar erro detalhado e falhar
          if (!created) {
            console.error("Não foi possível criar o reconhecedor");
            console.log("vosk:", vosk);
            
            // Um último recurso é tentar acessar qualquer método interno
            const keys = Object.keys(vosk);
            for (const key of keys) {
              console.log(`vosk.${key}:`, typeof vosk[key], vosk[key]);
            }
            
            throw new Error("Não foi possível criar um reconhecedor VOSK");
          }
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
