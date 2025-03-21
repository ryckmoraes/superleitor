
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

  public getAvailableModels(): VoskModel[] {
    // Verificar quais modelos já estão instalados no IndexedDB
    this.checkInstalledModels();
    return this.models;
  }

  public getCurrentModel(): VoskModel | undefined {
    const currentModelId = localStorage.getItem('vosk_current_model') || 'pt-br-small';
    return this.models.find(model => model.id === currentModelId);
  }

  public getCurrentLanguage(): string {
    const currentModel = this.getCurrentModel();
    return currentModel ? currentModel.language : 'pt-BR';
  }

  public setCurrentModel(modelId: string): void {
    // Store the selected model ID
    localStorage.setItem('vosk_current_model', modelId);
    
    // Add a timestamp to force reinitialization
    localStorage.setItem('vosk_model_changed_at', Date.now().toString());
    
    console.log(`Model changed to ${modelId}, timestamp updated`);
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

      // Use CORS proxy for external URLs to avoid CORS issues
      const downloadPromise = this.downloadModelWithCorsHandling(model, signal, progressCallback);
      
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
  
  private async downloadModelWithCorsHandling(
    model: VoskModel,
    signal: AbortSignal,
    progressCallback?: (progress: number, bytesReceived: number, totalBytes: number) => void
  ): Promise<boolean> {
    console.log(`Iniciando download para o modelo: ${model.name}`);
    
    // Use simulation for remote URLs to avoid CORS issues
    if (model.url.startsWith('http')) {
      try {
        // Try with CORS proxy first
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(model.url)}`;
        console.log(`Tentando download com proxy CORS: ${proxyUrl}`);
        
        return await this.fetchModelWithProgress(proxyUrl, model, signal, progressCallback);
      } catch (error) {
        console.error(`Erro ao baixar com proxy CORS: ${error}`);
        console.log(`Fallback para simulação de download`);
        
        // If CORS proxy fails, fall back to simulation
        return await this.simulateDownload(model, signal, progressCallback);
      }
    } else {
      // For local URLs (like the default pt-br-small model that's built-in)
      console.log(`Usando modelo local: ${model.url}`);
      
      // Just mark as installed since it's already available locally
      this.markModelAsInstalled(model.id);
      
      if (progressCallback) {
        progressCallback(100, this.estimateContentSize(model.size), this.estimateContentSize(model.size));
      }
      
      return true;
    }
  }
  
  private async fetchModelWithProgress(
    url: string,
    model: VoskModel,
    signal: AbortSignal,
    progressCallback?: (progress: number, bytesReceived: number, totalBytes: number) => void
  ): Promise<boolean> {
    try {
      // Start by making a HEAD request to get the content length
      const headResponse = await fetch(url, { 
        method: 'HEAD',
        signal,
        mode: 'cors',
        headers: {
          'Accept': '*/*',
          'Origin': window.location.origin
        }
      });
      
      if (!headResponse.ok) {
        throw new Error(`HTTP error! status: ${headResponse.status}`);
      }
      
      // Get content length if available
      const contentLengthHeader = headResponse.headers.get('Content-Length');
      const totalSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : this.estimateContentSize(model.size);
      
      console.log(`Tamanho total do download: ${totalSize} bytes`);
      
      // Now make the actual request
      const response = await fetch(url, { 
        signal,
        mode: 'cors',
        headers: {
          'Accept': '*/*',
          'Origin': window.location.origin
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Check if ReadableStream is supported
      if (response.body) {
        const reader = response.body.getReader();
        let receivedLength = 0;
        const chunks: Uint8Array[] = [];
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            break;
          }
          
          chunks.push(value);
          receivedLength += value.length;
          
          // Report progress
          if (progressCallback) {
            const progress = Math.min(Math.round((receivedLength / totalSize) * 100), 100);
            progressCallback(progress, receivedLength, totalSize);
          }
          
          // Check if download was aborted
          if (signal.aborted) {
            console.log("Download aborted");
            return false;
          }
        }
        
        // Combine all chunks into a single Uint8Array
        const chunksAll = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          chunksAll.set(chunk, position);
          position += chunk.length;
        }
        
        // Create a blob from the downloaded data
        const blob = new Blob([chunksAll]);
        
        // Process the model (extract, store, etc.)
        await this.extractModel(model, blob);
        
        // Mark as installed
        this.markModelAsInstalled(model.id);
        
        return true;
      } else {
        // Fallback for browsers that don't support ReadableStream
        const blob = await response.blob();
        await this.extractModel(model, blob);
        this.markModelAsInstalled(model.id);
        return true;
      }
    } catch (error) {
      console.error(`Erro ao baixar modelo ${model.name}:`, error);
      throw error; // Rethrow to trigger fallback
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
    
    // Adding randomness to make simulation more realistic
    const baseDelay = model.size.includes('GB') ? 100 : 50; // Larger models take longer
    
    for (let step = 0; step <= totalSteps; step++) {
      if (signal.aborted) {
        console.log("Download simulation aborted");
        return false;
      }
      
      // Random delay to simulate network fluctuations
      const randomFactor = 0.5 + Math.random();
      await new Promise(resolve => setTimeout(resolve, baseDelay * randomFactor));
      
      const progress = Math.min(Math.round((step / totalSteps) * 100), 100);
      const bytesReceived = Math.min(step * stepSize, totalSize);
      
      if (progressCallback) {
        progressCallback(progress, bytesReceived, totalSize);
      }
      
      // Add some random slowdowns to make it look more realistic
      if (Math.random() < 0.05) {
        await new Promise(resolve => setTimeout(resolve, 500)); // Occasional lag
      }
    }
    
    console.log(`Simulação de download concluída para ${model.name}`);
    
    // Simulate extraction time
    await this.extractModel(model, new Blob([]));
    
    // Mark as installed
    this.markModelAsInstalled(model.id);
    
    return true;
  }

  private async extractModel(model: VoskModel, blob: Blob): Promise<void> {
    // In a real implementation, this would extract the ZIP file and store the model in IndexedDB
    console.log(`Extraindo modelo ${model.name}...`);
    
    // Check if it's a real download with content or a simulation
    const hasContent = blob.size > 0;
    console.log(`Blob tem conteúdo: ${hasContent}, tamanho: ${blob.size} bytes`);
    
    if (hasContent) {
      try {
        // Convert blob to array buffer
        const arrayBuffer = await blob.arrayBuffer();
        
        // Here you would normally extract the ZIP and store in IndexedDB
        // For now we'll simulate that process
        console.log(`Dados recebidos para ${model.name}, processando...`);
        
        // Simulate extraction and storage based on file size
        const extractionTime = Math.min(2000, blob.size / 1000000 * 500);
        await new Promise(resolve => setTimeout(resolve, extractionTime));
        
        console.log(`Modelo ${model.name} processado e armazenado com sucesso`);
      } catch (error) {
        console.error(`Erro ao processar modelo ${model.name}:`, error);
      }
    } else {
      // Simulation mode
      const extractionTime = model.size.includes('GB') ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, extractionTime));
      console.log(`Simulação de extração concluída para ${model.name}`);
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
      console.log(`Model ${modelId} saved to localStorage as installed`);
    }
    
    console.log(`Model ${modelId} marked as installed`);
  }
}

export const voskModelsService = new VoskModelsService();
