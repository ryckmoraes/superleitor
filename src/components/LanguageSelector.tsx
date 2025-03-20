
import { useState } from "react";
import { Globe, Download, Check, X } from "lucide-react";
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
  const [currentModelId, setCurrentModelId] = useState(voskModelsService.getCurrentModel()?.id || "pt-br-small");
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleLanguageChange = (modelId: string) => {
    const model = models.find(m => m.id === modelId);
    
    if (!model) return;
    
    if (model.installed) {
      // Se o modelo já está instalado, apenas ative-o
      voskModelsService.setCurrentModel(modelId);
      setCurrentModelId(modelId);
      
      toast({
        title: "Idioma alterado",
        description: `O idioma foi alterado para ${model.name}`,
      });
      
      // Reiniciar o serviço VOSK com o novo modelo
      voskService.cleanup();
      voskService.initialize().catch(console.error);
    } else {
      // Se não está instalado, inicie o download
      handleDownloadModel(modelId);
    }
  };

  const handleDownloadModel = async (modelId: string) => {
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
        // Atualizar a lista de modelos
        setModels(voskModelsService.getAvailableModels());
        setCurrentModelId(modelId);
        
        toast({
          title: "Download concluído",
          description: `O modelo para ${model.name} foi instalado com sucesso!`,
        });
        
        // Falar a confirmação no idioma instalado
        const message = model.language.startsWith('pt') 
          ? "Modelo de idioma instalado com sucesso!" 
          : model.language.startsWith('en')
            ? "Language model successfully installed!"
            : "¡Modelo de idioma instalado correctamente!";
        
        speakNaturally(message, true);
        
        // Reiniciar o serviço VOSK com o novo modelo
        voskService.cleanup();
        voskService.initialize().catch(console.error);
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Selecionar Idioma
          </DrawerTitle>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Idioma Atual</label>
            <Select 
              value={currentModelId} 
              onValueChange={handleLanguageChange}
              disabled={!!downloadingModelId}
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
          </div>

          {downloadingModelId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Baixando modelo...</span>
                <span className="text-sm">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} />
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Modelos Disponíveis</h3>
            <div className="space-y-4 mt-2">
              {models.map(model => (
                <div 
                  key={model.id} 
                  className="flex items-center justify-between border rounded-md p-3"
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">Tamanho: {model.size}</p>
                  </div>
                  
                  {downloadingModelId === model.id ? (
                    <Button variant="outline" size="sm" disabled>
                      <Download className="h-4 w-4 mr-2 animate-pulse" />
                      Baixando...
                    </Button>
                  ) : model.installed ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleLanguageChange(model.id)}
                      disabled={currentModelId === model.id}
                    >
                      {currentModelId === model.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Ativo
                        </>
                      ) : (
                        "Ativar"
                      )}
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDownloadModel(model.id)}
                      disabled={!!downloadingModelId}
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
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Fechar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
