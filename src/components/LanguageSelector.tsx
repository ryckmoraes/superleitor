
import React, { useState, useEffect } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Globe, Download, Check, AlertCircle } from "lucide-react";
import { voskModelsService } from "@/services/voskModelsService";
import { Progress } from "@/components/ui/progress";

const LanguageSelector = () => {
  const [models, setModels] = useState<any[]>([]);
  const [currentModelId, setCurrentModelId] = useState<string>("");
  const [changesSaved, setChangesSaved] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadModelId, setDownloadModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Carregar modelos disponíveis
  useEffect(() => {
    try {
      const availableModels = voskModelsService.getAvailableModels();
      console.log("Available models:", availableModels);
      setModels(availableModels);
      
      // Get current model ID
      const currentModel = voskModelsService.getCurrentModel();
      if (currentModel) {
        setCurrentModelId(currentModel.id);
      }
    } catch (error) {
      console.error("Error loading models:", error);
      toast({
        title: "Erro ao carregar modelos",
        description: "Não foi possível carregar a lista de modelos disponíveis.",
        variant: "destructive"
      });
    }
  }, []);

  // Selecionar modelo
  const handleModelSelect = (modelId: string) => {
    if (modelId !== currentModelId) {
      setCurrentModelId(modelId);
      setChangesSaved(false);
    }
  };

  // Salvar alterações
  const handleSaveChanges = () => {
    try {
      voskModelsService.setCurrentModel(currentModelId);
      setChangesSaved(true);
      
      // Show success toast
      toast({
        title: "Alterações salvas",
        description: "O idioma selecionado será usado no próximo uso.",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Erro ao salvar alterações",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  };

  // Baixar modelo
  const handleDownloadModel = async (modelId: string) => {
    try {
      const model = models.find(m => m.id === modelId);
      
      if (model) {
        // Verificar se o modelo já está instalado
        if (model.installed) {
          toast({
            title: "Modelo já instalado",
            description: `O modelo ${model.name} já está instalado.`,
          });
          return;
        }
        
        // Iniciar download
        setIsDownloading(true);
        setDownloadModelId(modelId);
        setDownloadProgress(0);
        
        // Show toast for download start
        toast({
          title: "Download iniciado",
          description: `Baixando ${model.name}. Por favor, aguarde.`,
        });
        
        // Execute download
        const success = await voskModelsService.downloadModel(modelId, (progress) => {
          setDownloadProgress(progress);
        });
        
        // Update UI based on result
        if (success) {
          // Update models list to reflect installation
          const updatedModels = voskModelsService.getAvailableModels();
          setModels(updatedModels);
          
          // Auto-select the downloaded model
          setCurrentModelId(modelId);
          setChangesSaved(false);
          
          // Show success toast
          toast({
            title: "Download concluído",
            description: `${model.name} foi instalado com sucesso. Clique em Salvar para ativar.`,
          });
        } else {
          // Show error toast
          toast({
            title: "Erro no download",
            description: `Não foi possível baixar ${model.name}. Tente novamente.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error downloading model:", error);
      toast({
        title: "Erro ao baixar modelo",
        description: "Ocorreu um erro ao baixar o modelo. Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadModelId(null);
      setDownloadProgress(0);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Selecionar Idioma
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col gap-4 py-4">
        <p className="text-sm text-muted-foreground">
          Selecione o idioma para reconhecimento de fala. Modelos maiores oferecem melhor precisão, mas ocupam mais espaço.
        </p>
        
        {/* Download Progress */}
        {isDownloading && (
          <div className="rounded-md border p-3 shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">
                Baixando modelo...
              </span>
              <span className="text-sm font-medium">
                {downloadProgress}%
              </span>
            </div>
            <Progress value={downloadProgress} className="h-3" />
          </div>
        )}
        
        {/* Models List */}
        <div className="space-y-4 max-h-60 overflow-auto pr-1">
          {models.map((model) => (
            <div
              key={model.id}
              className={`flex items-center gap-3 rounded-md border p-3 cursor-pointer transition-colors ${
                currentModelId === model.id ? "border-primary bg-primary/5" : ""
              }`}
              onClick={() => handleModelSelect(model.id)}
            >
              <div className="flex-1">
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-muted-foreground">{model.size}</div>
              </div>
              
              {model.installed ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadModel(model.id);
                  }}
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Baixar
                </Button>
              )}
            </div>
          ))}
          
          {models.length === 0 && (
            <div className="flex items-center justify-center py-4">
              <AlertCircle className="h-5 w-5 text-muted-foreground mr-2" />
              <span className="text-sm text-muted-foreground">Nenhum modelo disponível</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button
          variant="default"
          onClick={handleSaveChanges}
          disabled={changesSaved || isDownloading}
        >
          Salvar
        </Button>
      </div>
    </DialogContent>
  );
};

export default LanguageSelector;
