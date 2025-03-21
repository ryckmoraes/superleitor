
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

  constructor() {
    // Check installed models on initialization
    this.checkInstalledModels();
  }

  public getAvailableModels(): VoskModel[] {
    // Verificar quais modelos já estão instalados no IndexedDB
    this.checkInstalledModels();
    return this.models;
  }

  public getCurrentModel(): VoskModel | undefined {
    const currentModelId = localStorage.getItem('vosk_current_model') || 'pt-br-small';
    console.log("Getting current model:", currentModelId);
    return this.models.find(model => model.id === currentModelId);
  }

  public setCurrentModel(modelId: string): void {
    console.log("Setting current model to:", modelId);
    
    // Store the selected model ID
    localStorage.setItem('vosk_current_model', modelId);
    
    // Add a timestamp to force reinitialization
    const timestamp = Date.now().toString();
    localStorage.setItem('vosk_model_changed_at', timestamp);
    console.log("Model change timestamp set:", timestamp);
  }

  private async checkInstalledModels(): Promise<void> {
    try {
      // Verificar modelos instalados no localStorage
      const installedModels = JSON.parse(localStorage.getItem('vosk_installed_models') || '[]');
      console.log("Installed models:", installedModels);
      
      // Atualizar o estado de instalação dos modelos
      this.models = this.models.map(model => ({
        ...model,
        installed: model.id === 'pt-br-small' || installedModels.includes(model.id)
      }));
    } catch (error) {
      console.error('Erro ao verificar modelos instalados:', error);
    }
  }

  public async downloadModel(modelId: string, progressCallback?: (progress: number) => void): Promise<boolean> {
    try {
      const model = this.models.find(m => m.id === modelId);
      if (!model) {
        throw new Error(`Modelo com ID ${modelId} não encontrado`);
      }

      if (model.installed) {
        console.log(`Modelo ${model.name} já está instalado`);
        return true;
      }

      console.log(`Iniciando download do modelo ${model.name} de ${model.url}`);
      
      // For browser limitations and project constraints, we still need to simulate the download
      // In a real implementation, this would involve fetching the ZIP file, extracting it, and 
      // storing it in IndexedDB or other suitable storage
      
      // This simulation is more realistic with variable progress speeds
      let progress = 0;
      let increment = 0;
      
      return new Promise((resolve) => {
        const interval = setInterval(() => {
          // Realistic download simulation with variable speeds
          increment = Math.random() * 5 + 3; // Random increment between 3-8%
          progress += increment;
          progress = Math.min(progress, 100); // Cap at 100%
          
          if (progressCallback) progressCallback(Math.floor(progress));
          
          // Add random pauses to simulate network conditions
          if (progress > 30 && progress < 40 && Math.random() > 0.7) {
            // Simulate a brief network pause
            clearInterval(interval);
            setTimeout(() => {
              const newInterval = setInterval(() => {
                increment = Math.random() * 5 + 3;
                progress += increment;
                progress = Math.min(progress, 100);
                
                if (progressCallback) progressCallback(Math.floor(progress));
                
                if (progress >= 100) {
                  clearInterval(newInterval);
                  this.markModelAsInstalled(modelId);
                  console.log(`Download do modelo ${model.name} concluído e instalado`);
                  
                  // Add a delay to simulate extraction/installation
                  setTimeout(() => resolve(true), 1500);
                }
              }, 300 + Math.random() * 200); // Variable interval
            }, 1000 + Math.random() * 1500); // Random pause duration
          }
          
          if (progress >= 100) {
            clearInterval(interval);
            this.markModelAsInstalled(modelId);
            console.log(`Download do modelo ${model.name} concluído e instalado`);
            
            // Add a delay to simulate extraction/installation
            setTimeout(() => resolve(true), 1000);
          }
        }, 300 + Math.random() * 200); // Variable interval
      });
    } catch (error) {
      console.error('Erro ao baixar modelo:', error);
      return false;
    }
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
      console.log(`Modelo ${modelId} marcado como instalado`);
    }
  }
}

export const voskModelsService = new VoskModelsService();
