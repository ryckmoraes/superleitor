
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
      console.log("Language selector opened, refreshing models");
      setModels(voskModelsService.getAvailableModels());
      const current = voskModelsService.getCurrentModel();
      setCurrentModelId(current?.id || "pt-br-small");
      console.log("Current model ID:", current?.id);
      setChangesSaved(true);
    }
  }, [isOpen]);

  const handleLanguageChange = async (modelId: string) => {
    if (isProcessing) return;
    
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    console.log("Language changed to:", model.name);
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
        console.log("Starting download for model:", modelId);
        const success = await handleDownloadModel(modelId);
        if (success) {
          setCurrentModelId(modelId);
          setChangesSaved(false);
        }
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
    if (!model) return false;
    
    console.log("Downloading model:", model.name);
    setDownloadingModelId(modelId);
    setDownloadProgress(0);
    
    try {
      // Iniciar download com callback de progresso
      const success = await voskModelsService.downloadModel(
        modelId,
        (progress) => {
          console.log(`Download progress: ${progress}%`);
          setDownloadProgress(progress);
        }
      );
      
      if (success) {
        // Atualizar a lista de modelos após o download bem-sucedido
        const updatedModels = voskModelsService.getAvailableModels();
        setModels(updatedModels);
        
        toast({
          title: "Download concluído",
          description: `O modelo para ${model.name} foi instalado com sucesso! Clique em Salvar para confirmar.`,
        });
        
        return true;
      } else {
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o modelo de idioma.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar o modelo de idioma.",
        variant: "destructive",
      });
      console.error("Erro no download:", error);
      return false;
    } finally {
      setDownloadingModelId(null);
    }
  };

  const handleSaveChanges = async () => {
    if (isProcessing || downloadingModelId) {
      // Em vez de apenas mostrar um toast, vamos exibir um diálogo de operação em andamento
      showToastOnly(
        "Operação em andamento",
        "Por favor, aguarde a conclusão da operação atual.",
        "default"
      );
      return;
    }
    
    console.log("Saving language changes, selected model:", currentModelId);
    setIsProcessing(true);
    
    // Mostrar diálogo de operação em andamento
    showToastOnly(
      "Salvando configurações",
      "Aplicando novo idioma, por favor aguarde...",
      "default"
    );
    
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
      
      // Fechar a janela e navegar para a página inicial automaticamente
      console.log("Redirecting to home after language change");
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 1000); // Reduzir o tempo de espera para 1 segundo
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
      // Em vez de apenas mostrar um toast, vamos exibir um diálogo mais visível
      showToastOnly(
        "Operação em andamento",
        "Por favor, aguarde a conclusão da operação atual.",
        "default"
      );
      return;
    }
    
    if (!changesSaved) {
      showToastOnly(
        "Alterações não salvas",
        "Clique em Salvar para confirmar as alterações de idioma.",
        "default"
      );
      return;
    }
    
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between pr-4">
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Selecionar Idioma
          </DrawerTitle>
          
          {/* Save button in the top-right corner */}
          <Button 
            onClick={handleSaveChanges}
            disabled={isProcessing || !!downloadingModelId || changesSaved}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Save className="h-4 w-4 mr-1" />
            Salvar
          </Button>
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
              <SelectContent className="bg-background border border-border shadow-lg">
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
            <div className="space-y-2 p-4 bg-background/90 border border-border rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Baixando modelo...</span>
                <span className="text-sm font-bold">{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} className="h-4" />
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
                        <Progress value={downloadProgress} className="h-3" />
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
        
        <DrawerFooter className="flex-row justify-between gap-2 p-4 border-t">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </DrawerFooter>

        {/* Improved Operation in progress dialog with prominent progress bar */}
        {(isProcessing || downloadingModelId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm mx-auto">
              <h3 className="text-xl font-bold mb-2">Operação em andamento</h3>
              <p className="mb-4">Por favor, aguarde a conclusão da operação atual.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Progresso</span>
                  <span className="text-lg font-bold text-primary">{downloadProgress}%</span>
                </div>
                <Progress value={downloadProgress} className="h-6" />
              </div>
            </div>
          </div>
        )}

        {!changesSaved && (
          <div className="fixed inset-x-0 bottom-32 flex justify-center z-50 pointer-events-none">
            <div className="bg-background/95 border border-border p-3 rounded-lg shadow-lg max-w-sm animate-pulse">
              <p className="text-center font-medium">
                Alterações não salvas
              </p>
              <p className="text-center text-sm mt-1">
                Clique em Salvar para confirmar as alterações de idioma.
              </p>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
