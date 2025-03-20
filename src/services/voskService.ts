
// Serviço VOSK para reconhecimento de fala offline
import { voskModelsService } from './voskModelsService';

interface VoskResult {
  text: string;
  result?: { conf: number; end: number; start: number; word: string }[];
  partial?: string;
}

class VoskService {
  private isInitialized: boolean = false;
  private model: any = null;
  private recognizer: any = null;
  private lastModelChangeTimestamp: string | null = null;
  
  constructor() {
    this.initialize = this.initialize.bind(this);
    this.processAudioData = this.processAudioData.bind(this);
  }
  
  /**
   * Inicializa o serviço VOSK
   */
  public async initialize(): Promise<boolean> {
    try {
      // Check if we need to reinitialize due to language change
      const modelChangedAt = localStorage.getItem('vosk_model_changed_at');
      if (this.isInitialized && modelChangedAt === this.lastModelChangeTimestamp) {
        return true;
      }
      
      // Clean up previous resources if we're reinitializing
      if (this.isInitialized) {
        this.cleanup();
      }
      
      // Store current timestamp to track model changes
      this.lastModelChangeTimestamp = modelChangedAt;
      
      // Importação dinâmica do VOSK
      console.log("Importando módulo VOSK...");
      const voskModule = await import('vosk-browser');
      
      // Log da versão e estrutura do VOSK
      console.log("Versão VOSK carregada:", voskModule.default?.toString());
      console.log("Propriedades em voskModule:", Object.keys(voskModule));
      
      const vosk = voskModule.default || voskModule;
      console.log("Métodos disponíveis em vosk:", Object.keys(vosk));
      
      // Obter o modelo atual selecionado pelo usuário
      const currentModel = voskModelsService.getCurrentModel();
      const modelPath = currentModel ? currentModel.url : '/models/vosk-model-pt-br-small';
      
      console.log(`Carregando modelo VOSK: ${modelPath}`);
      console.log(`Idioma selecionado: ${currentModel?.language || 'pt-BR'}`);
      
      try {
        // Verificar se a API do createModel existe
        if (typeof vosk.createModel !== 'function') {
          console.error("Erro: vosk.createModel não é uma função");
          console.log("API disponível:", Object.keys(vosk).join(", "));
          throw new Error("API VOSK incompatível: createModel não encontrado");
        }
        
        // Usar a API documentada para criar o modelo
        this.model = await vosk.createModel(modelPath);
        console.log("Modelo VOSK carregado com sucesso");
        
        // Verificar métodos disponíveis no modelo
        if (this.model) {
          console.log("Métodos disponíveis no modelo:", Object.keys(this.model));
          
          // Na API mais recente, o modelo já serve como reconhecedor
          if (typeof this.model.acceptWaveform === 'function') {
            console.log("Usando modelo diretamente como reconhecedor");
            this.recognizer = this.model;
          } 
          // Verificar se há métodos para criar um reconhecedor separado
          else if (this.model.createRecognizer) {
            console.log("Criando reconhecedor usando model.createRecognizer");
            this.recognizer = await this.model.createRecognizer(16000);
          }
          else {
            console.log("Nenhum método padrão encontrado para criar reconhecedor");
            throw new Error("Não foi possível criar um reconhecedor VOSK");
          }
          
          console.log("Reconhecedor criado com sucesso");
          console.log("Métodos no reconhecedor:", this.recognizer ? Object.keys(this.recognizer) : "Nenhum");
          
          this.isInitialized = true;
          return true;
        } else {
          throw new Error("Falha ao carregar modelo VOSK");
        }
      } catch (error) {
        console.error("Erro ao configurar VOSK:", error);
        throw new Error(`Falha ao configurar VOSK: ${error}`);
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
      if (typeof this.recognizer.acceptWaveform !== 'function') {
        console.error("Método acceptWaveform não disponível no reconhecedor");
        return { text: "" };
      }
      
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
  
  /**
   * Verifica se o VOSK está carregado e funcionando
   */
  public isVoskWorking(): boolean {
    return this.isInitialized && this.recognizer !== null;
  }
  
  /**
   * Obtém o idioma do modelo atual
   */
  public getCurrentLanguage(): string {
    const currentModel = voskModelsService.getCurrentModel();
    return currentModel ? currentModel.language : 'pt-BR';
  }
}

// Singleton instance
export const voskService = new VoskService();
