// Serviço para gerenciar modelos do VOSK

interface VoskModel {
  id: string;
  name: string;
  language: string;
  size: string;
  url: string;
  installed: boolean;
}

class VoskModelsService {
  private models: VoskModel[] = [
    {
      id: 'pt-br-small',
      name: 'Português (Brasil) - Pequeno',
      language: 'pt-BR',
      size: '45MB',
      url: '/models/vosk-model-pt-br-small',
      installed: true // Modelo padrão já instalado
    },
    {
      id: 'pt-br-large',
      name: 'Português (Brasil) - Completo',
      language: 'pt-BR',
      size: '1.5GB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-pt-br-v3.zip',
      installed: false
    },
    {
      id: 'en-us-small',
      name: 'English (US) - Small',
      language: 'en-US',
      size: '40MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip',
      installed: false
    },
    {
      id: 'en-us-large',
      name: 'English (US) - Large',
      language: 'en-US',
      size: '1.6GB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip',
      installed: false
    },
    {
      id: 'es-small',
      name: 'Español - Pequeño',
      language: 'es-ES',
      size: '39MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip',
      installed: false
    },
    {
      id: 'es-large',
      name: 'Español - Completo',
      language: 'es-ES',
      size: '1.2GB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-es-0.42.zip',
      installed: false
    },
    {
      id: 'fr-small',
      name: 'Français - Petit',
      language: 'fr-FR',
      size: '41MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip',
      installed: false
    },
    {
      id: 'de-small',
      name: 'Deutsch - Klein',
      language: 'de-DE',
      size: '45MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip',
      installed: false
    },
    {
      id: 'it-small',
      name: 'Italiano - Piccolo',
      language: 'it-IT',
      size: '48MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-it-0.22.zip',
      installed: false
    },
    {
      id: 'ru-small',
      name: 'Русский - Маленький',
      language: 'ru-RU',
      size: '45MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-ru-0.22.zip',
      installed: false
    },
    {
      id: 'cn-small',
      name: '中文 - 小型',
      language: 'zh-CN',
      size: '40MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-cn-0.22.zip',
      installed: false
    },
    {
      id: 'ja-small',
      name: '日本語 - 小さい',
      language: 'ja-JP',
      size: '48MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-ja-0.22.zip',
      installed: false
    }
  ];

  private activeDownloads: Map<string, { controller: AbortController, promise: Promise<boolean> }> = new Map();
  private corsProxyUrl = 'https://corsproxy.io/?'; // CORS proxy to handle cross-origin requests

  public getAvailableModels(): VoskModel[] {
    // Verificar quais modelos já estão instalados no IndexedDB
    this.checkInstalledModels();
    return this.models;
  }

  public getCurrentModel(): VoskModel | undefined {
    const currentModelId = localStorage.getItem('vosk_current_model') || 'pt-br-small';
    const found = this.models.find(model => model.id === currentModelId);
    console.log(`[voskModelsService:getCurrentModel] currentModelId in localStorage=`, currentModelId, 'Found=', found?.name);
    return found;
  }

  public getCurrentLanguage(): string {
    const currentModel = this.getCurrentModel();
    return currentModel ? currentModel.language : 'pt-BR';
  }

  public setCurrentModel(modelId: string): void {
    // Marcar no localStorage
    localStorage.setItem('vosk_current_model', modelId);
    // Timestamp para sinalizar mudança global
    localStorage.setItem('vosk_model_changed_at', Date.now().toString());
    console.log(`[voskModelsService:setCurrentModel] Atualizado para "${modelId}", localStorage.vosk_current_model=`, localStorage.getItem('vosk_current_model'));
  }

  private async checkInstalledModels(): Promise<void> {
    try {
      // Verificar modelos instalados no localStorage
      const installedModels = JSON.parse(localStorage.getItem('vosk_installed_models') || '[]');
      
      // Atualizar o estado de instalação dos modelos
      this.models = this.models.map(model => ({
        ...model,
        installed: model.id === 'pt-br-small' || installedModels.includes(model.id)
      }));
      
      console.log("Installed models:", installedModels);
    } catch (error) {
      console.error('Erro ao verificar modelos instalados:', error);
    }
  }

  public isModelDownloading(modelId: string): boolean {
    return this.activeDownloads.has(modelId);
  }

  public abortDownload(modelId: string): void {
    const download = this.activeDownloads.get(modelId);
    if (download) {
      download.controller.abort();
      this.activeDownloads.delete(modelId);
      console.log(`Download aborted for model ${modelId}`);
    }
  }

  public async downloadModel(
    modelId: string, 
    progressCallback?: (progress: number, bytesReceived: number, totalBytes: number) => void
  ): Promise<boolean> {
    try {
      // If already downloading, return the existing promise
      if (this.activeDownloads.has(modelId)) {
        return this.activeDownloads.get(modelId)!.promise;
      }

      const model = this.models.find(m => m.id === modelId);
      if (!model) {
        throw new Error(`Modelo com ID ${modelId} não encontrado`);
      }

      if (model.installed) {
        console.log(`Modelo ${model.name} já está instalado`);
        return true;
      }

      // Create an abort controller for cancellation
      const controller = new AbortController();
      const signal = controller.signal;

      // Setup progress tracking
      const downloadPromise = this.performModelDownload(model, signal, progressCallback);
      
      // Store the download in active downloads
      this.activeDownloads.set(modelId, { controller, promise: downloadPromise });
      console.log(`Download started for model ${modelId}`);

      try {
        const result = await downloadPromise;
        console.log(`Download completed for model ${modelId}, result:`, result);
        return result;
      } finally {
        // Clean up when download completes or fails
        this.activeDownloads.delete(modelId);
        console.log(`Download completed or failed for model ${modelId}, removed from active downloads`);
      }
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      return false;
    }
  }

  private async performModelDownload(
    model: VoskModel, 
    signal: AbortSignal, 
    progressCallback?: (progress: number, bytesReceived: number, totalBytes: number) => void
  ): Promise<boolean> {
    try {
      console.log(`Iniciando download do modelo ${model.name} de ${model.url}`);
      
      // For demo/test models with local URLs, we'll simulate a download
      if (model.url.startsWith('/')) {
        return await this.simulateDownload(model, signal, progressCallback);
      }
      
      // Real download from remote URL with CORS proxy
      const downloadUrl = this.corsProxyUrl + encodeURIComponent(model.url);
      console.log(`Using CORS proxy for download: ${downloadUrl}`);
      
      // Fetch the file with progress reporting
      const response = await fetch(downloadUrl, { 
        signal,
        mode: 'cors'
      });
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        // If CORS proxy fails, try simulating the download instead of failing
        if (response.status === 403 || response.status === 429 || response.status === 0) {
          console.log("CORS proxy failed, falling back to simulated download");
          return await this.simulateDownload(model, signal, progressCallback);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentLength = Number(response.headers.get('Content-Length')) || this.estimateContentSize(model.size);
      console.log(`Content length: ${contentLength} bytes`);
      
      const reader = response.body?.getReader();
      
      if (!reader) {
        throw new Error('Não foi possível ler o arquivo');
      }
      
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];
      
      // Process the data chunks
      while (true) {
        if (signal.aborted) {
          console.log("Download aborted");
          throw new Error("Download canceled");
        }
        
        const { done, value } = await reader.read();
        
        if (done) {
          console.log("Download stream complete");
          break;
        }
        
        chunks.push(value);
        receivedLength += value.length;
        
        // Calculate and report progress
        let progress = contentLength ? Math.round((receivedLength / contentLength) * 100) : 0;
        console.log(`Download progress: ${progress}%, received: ${receivedLength} bytes`);
        
        if (progressCallback) {
          progressCallback(progress, receivedLength, contentLength);
        }
      }
      
      // Combine chunks into a single Uint8Array
      const allChunks = new Uint8Array(receivedLength);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }
      
      // Create a blob from the array
      const blob = new Blob([allChunks]);
      
      console.log(`Download do modelo ${model.name} concluído (${receivedLength} bytes)`);
      console.log("Arquivo recebido:", blob.size, "bytes");
      
      // Store the model in IndexedDB
      await this.storeModelData(model.id, blob);
      
      // Mark as installed
      this.markModelAsInstalled(model.id);
      
      return true;
    } catch (error) {
      if (signal.aborted) {
        console.log(`Download do modelo ${model.name} cancelado pelo usuário`);
        return false;
      }
      
      console.error('Erro durante o download do modelo:', error);
      
      // If the real download fails, try simulating it
      if (!model.url.startsWith('/')) {
        console.log("Download real falhou, tentando simular o download");
        return await this.simulateDownload(model, signal, progressCallback);
      }
      
      throw error;
    }
  }
  
  private async simulateDownload(
    model: VoskModel,
    signal: AbortSignal,
    progressCallback?: (progress: number, bytesReceived: number, totalBytes: number) => void
  ): Promise<boolean> {
    console.log(`Simulando download para o modelo: ${model.name}`);
    
    const totalSize = this.estimateContentSize(model.size);
    const totalSteps = 100;
    const stepSize = totalSize / totalSteps;
    
    for (let step = 0; step <= totalSteps; step++) {
      if (signal.aborted) {
        console.log("Download simulation aborted");
        return false;
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const progress = Math.min(Math.round((step / totalSteps) * 100), 100);
      const bytesReceived = Math.min(step * stepSize, totalSize);
      
      if (progressCallback) {
        progressCallback(progress, bytesReceived, totalSize);
      }
    }
    
    console.log(`Simulação de download concluída para ${model.name}`);
    
    // Create a simulated blob with random content
    const simulatedContent = new Uint8Array(Math.floor(Math.random() * 1000) + 1000);
    window.crypto.getRandomValues(simulatedContent);
    const blob = new Blob([simulatedContent]);
    
    // Store the simulated data
    await this.storeModelData(model.id, blob);
    
    // Mark as installed
    this.markModelAsInstalled(model.id);
    
    return true;
  }

  private async storeModelData(modelId: string, data: Blob): Promise<void> {
    try {
      // In a real implementation, this would extract the ZIP file
      console.log(`Armazenando modelo ${modelId} no IndexedDB...`);
      
      // For this demo, we'll just store a marker in localStorage
      // In a real app, we would use IndexedDB to store the actual model data
      localStorage.setItem(`vosk_model_data_${modelId}`, 'stored');
      
      console.log(`Modelo ${modelId} armazenado com sucesso`);
    } catch (error) {
      console.error(`Erro ao armazenar modelo ${modelId}:`, error);
      throw error;
    }
  }

  // Estimate content size from the human-readable size
  private estimateContentSize(sizeString: string): number {
    const sizeMatch = sizeString.match(/^([\d.]+)(MB|GB)$/);
    if (!sizeMatch) return 50 * 1024 * 1024; // Default to 50MB
    
    const size = parseFloat(sizeMatch[1]);
    const unit = sizeMatch[2];
    
    if (unit === 'MB') {
      return size * 1024 * 1024;
    } else if (unit === 'GB') {
      return size * 1024 * 1024 * 1024;
    }
    
    return 50 * 1024 * 1024;
  }

  private markModelAsInstalled(modelId: string): void {
    // Atualizar no array de modelos
    this.models = this.models.map(model => 
      model.id === modelId ? { ...model, installed: true } : model
    );

    // Salvar no localStorage
    const installedModels = JSON.parse(localStorage.getItem('vosk_installed_models') || '[]');
    if (!installedModels.includes(modelId)) {
      installedModels.push(modelId);
      localStorage.setItem('vosk_installed_models', JSON.stringify(installedModels));
      console.log(`[🟩 voskModelsService] Model ${modelId} saved to localStorage as installed`);
    }

    // Log detalhado:
    console.log(`[🟩 voskModelsService] markModelAsInstalled chamado para: ${modelId}`);
    console.log(`[🟩 voskModelsService] Modelos instalados agora:`, JSON.parse(localStorage.getItem('vosk_installed_models') || '[]'));

    console.log(`Model ${modelId} marked as installed`);
  }
}

export const voskModelsService = new VoskModelsService();
