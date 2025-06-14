
// Serviço VOSK para reconhecimento de fala offline
import { voskModelsService } from './voskModelsService';
import { VoskResult } from './vosk/voskResult';
import { getCurrentModelAndPath, logModelInitialization } from './vosk/voskModelLoader';

class VoskService {
  private isInitialized: boolean = false;
  private model: any = null;
  private recognizer: any = null;
  private lastModelChangeTimestamp: string | null = null;
  private currentModelId: string | null = null;
  
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
      const currentModel = voskModelsService.getCurrentModel();
      const newModelId = currentModel?.id;
      
      // Force reinitialize if model ID changed or timestamp changed
      const needsReinit = (
        !this.isInitialized || 
        modelChangedAt !== this.lastModelChangeTimestamp ||
        newModelId !== this.currentModelId
      );
      
      if (!needsReinit) {
        console.log("[voskService] Já inicializado com modelo atual:", currentModel?.name);
        return true;
      }
      
      console.log("[voskService] Reinicializando VOSK devido a mudança de modelo:", {
        previousModel: this.currentModelId,
        newModel: newModelId,
        previousTimestamp: this.lastModelChangeTimestamp,
        newTimestamp: modelChangedAt
      });
      
      // Clean up previous resources if we're reinitializing
      if (this.isInitialized) {
        this.cleanup();
      }
      
      // Store current timestamp and model ID to track changes
      this.lastModelChangeTimestamp = modelChangedAt;
      this.currentModelId = newModelId;

      // Pega modelo e caminho utilizando o helper
      const { currentModel: model, modelPath } = getCurrentModelAndPath();
      logModelInitialization(model, modelPath);

      // Importação dinâmica do VOSK
      console.log("Importando módulo VOSK...");
      const voskModule = await import('vosk-browser');
      console.log("Versão VOSK carregada:", voskModule.default?.toString());
      console.log("Propriedades em voskModule:", Object.keys(voskModule));
      const vosk = voskModule.default || voskModule;
      console.log("Métodos disponíveis em vosk:", Object.keys(vosk));
      console.log(`Carregando modelo VOSK: ${modelPath}`);
      console.log(`Idioma selecionado: ${model?.language || 'pt-BR'}`);
      
      try {
        if (typeof vosk.createModel !== 'function') {
          console.error("Erro: vosk.createModel não é uma função");
          console.log("API disponível:", Object.keys(vosk).join(", "));
          throw new Error("API VOSK incompatível: createModel não encontrado");
        }
        
        // Usar a API documentada para criar o modelo
        this.model = await vosk.createModel(modelPath);
        console.log("Modelo VOSK carregado com sucesso");
        
        if (this.model) {
          console.log("Métodos disponíveis no modelo:", Object.keys(this.model));
          if (typeof this.model.acceptWaveform === 'function') {
            console.log("Usando modelo diretamente como reconhecedor");
            this.recognizer = this.model;
          } 
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
          console.log("[voskService] Inicialização completa para modelo:", model?.name);
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
      let processableData = audioData;
      if (audioData instanceof Float32Array) {
        const int16Data = new Int16Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, audioData[i] * 32768));
        }
        processableData = new Uint8Array(int16Data.buffer);
      }
      if (typeof this.recognizer.acceptWaveform !== 'function') {
        console.error("Método acceptWaveform não disponível no reconhecedor");
        return { text: "" };
      }
      const isFinished = this.recognizer.acceptWaveform(processableData);
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
  
  public getFinalResult(): VoskResult {
    if (!this.isInitialized || !this.recognizer) {
      return { text: "" };
    }
    return this.recognizer.finalResult();
  }
  
  public reset(): void {
    if (this.isInitialized && this.recognizer) {
      this.recognizer.reset();
    }
  }
  
  public cleanup(): void {
    console.log("[voskService] Limpando recursos VOSK...");
    if (this.recognizer) {
      this.recognizer.free();
      this.recognizer = null;
    }
    if (this.model) {
      this.model.free();
      this.model = null;
    }
    this.isInitialized = false;
    this.currentModelId = null;
    console.log("[voskService] Recursos VOSK limpos");
  }
  
  public isVoskWorking(): boolean {
    return this.isInitialized && this.recognizer !== null;
  }
  
  public getCurrentLanguage(): string {
    const currentModel = voskModelsService.getCurrentModel();
    return currentModel ? currentModel.language : 'pt-BR';
  }
  
  public getCurrentModelId(): string | null {
    return this.currentModelId;
  }
  
  // Force reinitialize method for external calls
  public async forceReinitialize(): Promise<boolean> {
    console.log("[voskService] Forçando reinicialização...");
    this.isInitialized = false;
    this.currentModelId = null;
    this.lastModelChangeTimestamp = null;
    return this.initialize();
  }
}

// Singleton instance
export const voskService = new VoskService();
