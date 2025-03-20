
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
      language: 'pt-BR', // Ensure correct language code
      size: '45MB',
      url: '/models/vosk-model-pt-br-small',
      installed: true // Modelo padrão já instalado
    },
    {
      id: 'pt-br-large',
      name: 'Português (Brasil) - Completo',
      language: 'pt-BR', // Ensure correct language code
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
      id: 'es-small',
      name: 'Español - Pequeño',
      language: 'es-ES',
      size: '39MB',
      url: 'https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip',
      installed: false
    }
  ];

  public getAvailableModels(): VoskModel[] {
    // Verificar quais modelos já estão instalados no IndexedDB
    this.checkInstalledModels();
    return this.models;
  }

  public getCurrentModel(): VoskModel | undefined {
    const currentModelId = localStorage.getItem('vosk_current_model') || 'pt-br-small';
    return this.models.find(model => model.id === currentModelId);
  }

  public setCurrentModel(modelId: string): void {
    // Store the selected model ID
    localStorage.setItem('vosk_current_model', modelId);
    
    // Add a timestamp to force reinitialization
    localStorage.setItem('vosk_model_changed_at', Date.now().toString());
  }

  private async checkInstalledModels(): Promise<void> {
    try {
      // Verificar modelos instalados no IndexedDB
      const installedModels = JSON.parse(localStorage.getItem('vosk_installed_models') || '[]');
      
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

      // Simulação de download (em uma implementação real, seria feito o download do arquivo ZIP)
      console.log(`Iniciando download do modelo ${model.name} de ${model.url}`);
      
      // Simulação do progresso do download
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        if (progressCallback) progressCallback(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Marcar como instalado
          this.markModelAsInstalled(modelId);
          
          console.log(`Download do modelo ${model.name} concluído`);
        }
      }, 500);

      return true;
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
    }
    
    // Se este for o primeiro modelo do idioma a ser instalado, defini-lo como atual
    const model = this.models.find(m => m.id === modelId);
    if (model) {
      const currentModel = this.getCurrentModel();
      if (!currentModel || currentModel.language !== model.language) {
        this.setCurrentModel(modelId);
      }
    }
  }
}

export const voskModelsService = new VoskModelsService();
