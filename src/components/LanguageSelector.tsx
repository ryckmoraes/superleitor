
import { useState, useEffect } from "react";
import { Globe, Download, Check, X, Save } from "lucide-react";
import { voskModelsService } from "@/services/voskModelsService";
import { toast } from "@/components/ui/use-toast";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { useNavigate } from "react-router-dom";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [changesSaved, setChangesSaved] = useState(true);
  const navigate = useNavigate();

  // Refresh models when drawer opens
  useEffect(() => {
    if (isOpen) {
      setModels(voskModelsService.getAvailableModels());
      setCurrentModelId(voskModelsService.getCurrentModel()?.id || "pt-br-small");
      setChangesSaved(true);
    }
  }, [isOpen]);

  const handleLanguageChange = async (modelId: string) => {
    if (isProcessing) return;
    
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    setIsProcessing(true);
    
    try {
      if (model.installed) {
        // Se o modelo já está instalado, apenas ative-o temporariamente
        setCurrentModelId(modelId);
        setChangesSaved(false);
        
        toast({
          title: "Idioma selecionado",
          description: `${model.name} foi selecionado. Clique em Salvar para confirmar.`,
        });
      } else {
        // Se não está instalado, inicie o download
        handleDownloadModel(modelId);
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
        setChangesSaved(false);
        
        toast({
          title: "Download concluído",
          description: `O modelo para ${model.name} foi instalado com sucesso! Clique em Salvar para confirmar.`,
        });
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

  const handleSaveChanges = async () => {
    if (isProcessing || downloadingModelId) {
      toast({
        title: "Operação em andamento",
        description: "Por favor, aguarde a conclusão da operação atual.",
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Definir o modelo atual no serviço
      voskModelsService.setCurrentModel(currentModelId);
      
      const model = models.find(m => m.id === currentModelId);
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Configuração salva",
        description: `Idioma definido: ${model?.name || "Padrão"}`,
      });
      
      // Falar a confirmação no idioma instalado
      const message = model?.language.startsWith('pt') 
        ? "Idioma alterado com sucesso!" 
        : model?.language.startsWith('en')
          ? "Language successfully changed!"
          : model?.language.startsWith('es')
            ? "¡Idioma cambiado con éxito!"
            : model?.language.startsWith('fr')
              ? "Langue changée avec succès!"
              : model?.language.startsWith('de')
                ? "Sprache erfolgreich geändert!"
                : model?.language.startsWith('it')
                  ? "Lingua cambiata con successo!"
                  : model?.language.startsWith('ru')
                    ? "Язык успешно изменен!"
                    : model?.language.startsWith('zh')
                      ? "语言更改成功!"
                      : model?.language.startsWith('ja')
                        ? "言語が正常に変更されました!"
                        : "Language changed successfully!";
      
      speakNaturally(message, true);
      
      // Marcar alterações como salvas
      setChangesSaved(true);
      
      // Reiniciar o serviço VOSK com o novo modelo
      await voskService.cleanup();
      await voskService.initialize().catch(console.error);
      
      // Fechar a janela e navegar para a página inicial
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a configuração de idioma.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle close with pending operations
  const handleClose = () => {
    if (isProcessing || downloadingModelId) {
      toast({
        title: "Operação em andamento",
        description: "Por favor, aguarde a conclusão da operação atual.",
      });
      return;
    }
    
    if (!changesSaved) {
      toast({
        title: "Alterações não salvas",
        description: "Clique em Salvar para confirmar as alterações de idioma.",
      });
      return;
    }
    
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
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
          </div>

          {downloadingModelId && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Baixando modelo...</span>
                <span className="text-sm">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-3" />
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
                    <div className="flex flex-col items-end space-y-2">
                      <Button variant="outline" size="sm" disabled>
                        <Download className="h-4 w-4 mr-2 animate-pulse" />
                        Baixando...
                      </Button>
                      <div className="w-full max-w-[120px]">
                        <Progress value={downloadProgress} className="h-2" />
                      </div>
                    </div>
                  ) : model.installed ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleLanguageChange(model.id)}
                      disabled={currentModelId === model.id || isProcessing}
                    >
                      {currentModelId === model.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2 text-green-500" />
                          Selecionado
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
        
        <DrawerFooter className="flex flex-row gap-2 justify-between">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          
          <Button 
            onClick={handleSaveChanges}
            disabled={isProcessing || !!downloadingModelId || changesSaved}
          >
            <Save className="h-4 w-4 mr-2" />
            Salvar e Aplicar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
