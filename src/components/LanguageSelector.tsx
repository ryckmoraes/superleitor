
import { useState, useEffect } from "react";
import { Globe, Download, Check, X, Save, RotateCw } from "lucide-react";
import { voskModelsService } from "@/services/voskModelsService";
import { toast } from "@/components/ui/use-toast";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelector = ({ isOpen, onClose }: LanguageSelectorProps) => {
  const [models, setModels] = useState(voskModelsService.getAvailableModels());
  const [selectedModelId, setSelectedModelId] = useState<string>(voskModelsService.getCurrentModel()?.id || "pt-br-small");
  const [currentModelId, setCurrentModelId] = useState<string>(voskModelsService.getCurrentModel()?.id || "pt-br-small");
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Refresh models when drawer opens
  useEffect(() => {
    if (isOpen) {
      setModels(voskModelsService.getAvailableModels());
      const currentModel = voskModelsService.getCurrentModel();
      setCurrentModelId(currentModel?.id || "pt-br-small");
      setSelectedModelId(currentModel?.id || "pt-br-small");
      setHasChanges(false);
    }
  }, [isOpen]);

  // Check for active downloads
  useEffect(() => {
    const checkDownloads = () => {
      models.forEach(model => {
        if (voskModelsService.isModelDownloading(model.id) && downloadingModelId !== model.id) {
          setDownloadingModelId(model.id);
        }
      });
    };
    
    if (isOpen) {
      checkDownloads();
      const interval = setInterval(checkDownloads, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, models, downloadingModelId]);

  const handleLanguageSelection = (modelId: string) => {
    if (isProcessing || downloadingModelId) return;
    
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    setSelectedModelId(modelId);
    setHasChanges(modelId !== currentModelId);
  };

  const handleSaveLanguage = async () => {
    if (isProcessing || downloadingModelId) return;
    if (!hasChanges) return;
    
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;
    
    setIsProcessing(true);
    
    try {
      if (model.installed) {
        // Apply the selected language
        voskModelsService.setCurrentModel(selectedModelId);
        setCurrentModelId(selectedModelId);
        
        toast({
          title: "Idioma salvo",
          description: `O idioma foi alterado para ${model.name}`,
        });
        
        // Reiniciar o serviço VOSK com o novo modelo
        await voskService.cleanup();
        await voskService.initialize().catch(console.error);
        
        // Update UI language based on selection
        updateUILanguage(model.language);
        
        // Fechar a janela após completar a alteração
        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        // Se não está instalado, inicie o download
        handleDownloadModel(selectedModelId);
      }
    } catch (error) {
      console.error("Erro ao mudar idioma:", error);
      toast({
        title: "Erro ao mudar idioma",
        description: "Ocorreu um erro ao alterar o idioma.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setHasChanges(false);
    }
  };

  const updateUILanguage = (language: string) => {
    // Determine text based on language
    const welcomeMessage = language.startsWith('pt') 
      ? "Idioma alterado para Português!"
      : language.startsWith('en')
        ? "Language changed to English!"
        : language.startsWith('es')
          ? "¡Idioma cambiado a Español!"
          : language.startsWith('fr')
            ? "Langue changée en Français!"
            : language.startsWith('de')
              ? "Sprache auf Deutsch geändert!"
              : "Language changed!";
    
    // Speak the confirmation in the selected language
    speakNaturally(welcomeMessage, true);
  };

  const handleDownloadModel = async (modelId: string) => {
    if (downloadingModelId) {
      // Only allow one download at a time
      showToastOnly(
        "Download em andamento",
        "Aguarde o download atual terminar antes de iniciar outro.",
        "default"
      );
      return;
    }
    
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    setDownloadingModelId(modelId);
    setDownloadProgress(0);
    
    showToastOnly(
      "Download iniciado",
      `Baixando modelo para ${model.name}. Tamanho: ${model.size}`,
      "default"
    );
    
    try {
      const success = await voskModelsService.downloadModel(
        modelId,
        (progress) => setDownloadProgress(progress)
      );
      
      if (success) {
        // Refresh models list
        setModels(voskModelsService.getAvailableModels());
        
        // Apply the language if it was selected
        if (selectedModelId === modelId) {
          voskModelsService.setCurrentModel(modelId);
          setCurrentModelId(modelId);
          setHasChanges(false);
          
          // Update UI language
          const updatedModel = models.find(m => m.id === modelId);
          if (updatedModel) {
            updateUILanguage(updatedModel.language);
          }
          
          // Reiniciar o serviço VOSK com o novo modelo
          await voskService.cleanup();
          await voskService.initialize().catch(console.error);
        }
        
        toast({
          title: "Download concluído",
          description: `O modelo para ${model.name} foi instalado com sucesso!`,
        });
        
        // Fechar a janela após completar o download
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o modelo de idioma.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar o modelo de idioma.",
        variant: "destructive",
      });
      console.error("Erro no download:", error);
    } finally {
      setDownloadingModelId(null);
    }
  };

  const cancelDownload = () => {
    if (downloadingModelId) {
      voskModelsService.abortDownload(downloadingModelId);
      setDownloadingModelId(null);
      setDownloadProgress(0);
      showToastOnly(
        "Download cancelado",
        "O download do modelo de idioma foi cancelado.",
        "default"
      );
    }
  };

  // Handle close with pending operations
  const handleClose = () => {
    if (isProcessing) {
      toast({
        title: "Operação em andamento",
        description: "Por favor, aguarde a conclusão da operação atual.",
      });
      return;
    }
    
    if (downloadingModelId) {
      toast({
        title: "Download em andamento",
        description: "Deseja cancelar o download antes de sair?",
      });
      return;
    }
    
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Selecionar Idioma
          </DrawerTitle>
          <Button 
            size="sm" 
            onClick={handleSaveLanguage}
            disabled={!hasChanges || isProcessing || !!downloadingModelId || !models.find(m => m.id === selectedModelId)?.installed}
            className="mr-2"
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma Selecionado</label>
            <Select 
              value={selectedModelId} 
              onValueChange={handleLanguageSelection}
              disabled={!!downloadingModelId || isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um idioma" />
              </SelectTrigger>
              <SelectContent>
                {models.map(model => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      {model.installed ? (
                        <Check className="h-4 w-4 ml-2 text-green-500" />
                      ) : (
                        <Download className="h-4 w-4 ml-2 text-blue-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasChanges && !models.find(m => m.id === selectedModelId)?.installed && (
              <p className="text-xs text-amber-500 mt-1">
                Este modelo precisa ser baixado antes de ser usado.
              </p>
            )}
          </div>

          {downloadingModelId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Baixando {models.find(m => m.id === downloadingModelId)?.name}...
                </span>
                <span className="text-sm">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-2" />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelDownload} 
                className="mt-2 w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Download
              </Button>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Modelos Disponíveis</h3>
            <div className="space-y-4 mt-2 max-h-[50vh] overflow-y-auto pr-1">
              {models.map(model => (
                <div 
                  key={model.id} 
                  className={`flex items-center justify-between border rounded-md p-3 ${selectedModelId === model.id ? 'border-primary' : ''}`}
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">Tamanho: {model.size}</p>
                  </div>
                  
                  {downloadingModelId === model.id ? (
                    <Button variant="outline" size="sm" disabled>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      {downloadProgress}%
                    </Button>
                  ) : model.installed ? (
                    <Button 
                      variant={currentModelId === model.id ? "default" : "outline"}
                      size="sm" 
                      onClick={() => handleLanguageSelection(model.id)}
                      disabled={isProcessing}
                    >
                      {currentModelId === model.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Ativo
                        </>
                      ) : (
                        "Selecionar"
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadModel(model.id)}
                      disabled={!!downloadingModelId || isProcessing}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DrawerFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
