
import { useState, useEffect } from "react";
import { Globe, Download, Check, X, Save, RotateCw, ExternalLink } from "lucide-react";
import { voskModelsService } from "@/services/voskModelsService";
import { toast } from "@/components/ui/use-toast";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { Progress } from "@/components/ui/progress";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
  const [downloadSpeed, setDownloadSpeed] = useState<string>("0 KB/s");
  const [downloadedSize, setDownloadedSize] = useState<string>("0 KB");
  const [totalSize, setTotalSize] = useState<string>("0 MB");
  const [estimatedTime, setEstimatedTime] = useState<string>("calculando...");
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [forceShowDownload, setForceShowDownload] = useState(false);
  const [autoCloseAfterDownload, setAutoCloseAfterDownload] = useState(false);
  const [closeAttempted, setCloseAttempted] = useState(false);

  // Make sure the download section is visible if a model is being downloaded
  useEffect(() => {
    if (downloadingModelId) {
      setForceShowDownload(true);
    }
  }, [downloadingModelId]);

  // Force close check - ensures we return to main screen
  useEffect(() => {
    if (closeAttempted && !isProcessing && !downloadingModelId) {
      console.log("Force closing language selector");
      setTimeout(() => {
        onClose();
        setCloseAttempted(false);
      }, 500);
    }
  }, [closeAttempted, isProcessing, downloadingModelId, onClose]);

  // Refresh models when drawer opens
  useEffect(() => {
    if (isOpen) {
      console.log("Language selector opened, refreshing models");
      setModels(voskModelsService.getAvailableModels());
      const currentModel = voskModelsService.getCurrentModel();
      setCurrentModelId(currentModel?.id || "pt-br-small");
      setSelectedModelId(currentModel?.id || "pt-br-small");
      setHasChanges(false);
      setAutoCloseAfterDownload(false);
      setCloseAttempted(false);
      
      // Check for active downloads
      const activeDownloads = models.filter(model => voskModelsService.isModelDownloading(model.id));
      if (activeDownloads.length > 0) {
        console.log("Active download detected for model:", activeDownloads[0].id);
        setDownloadingModelId(activeDownloads[0].id);
        setForceShowDownload(true);
      }
    }
  }, [isOpen, models]);

  // Check for active downloads
  useEffect(() => {
    const checkDownloads = () => {
      models.forEach(model => {
        if (voskModelsService.isModelDownloading(model.id) && downloadingModelId !== model.id) {
          setDownloadingModelId(model.id);
          setForceShowDownload(true);
          console.log("Active download detected for model:", model.id);
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
        
        // Flag for closing the drawer
        setCloseAttempted(true);
        setTimeout(() => {
          setIsProcessing(false);
        }, 500);
      } else {
        // Se não está instalado, inicie o download
        setAutoCloseAfterDownload(true); // Set to auto-close after download is complete
        handleDownloadModel(selectedModelId);
      }
    } catch (error) {
      console.error("Erro ao mudar idioma:", error);
      toast({
        title: "Erro ao mudar idioma",
        description: "Ocorreu um erro ao alterar o idioma.",
        variant: "destructive",
      });
      setIsProcessing(false);
    } finally {
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

  const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${Math.ceil(seconds)} segundos`;
    } else if (seconds < 3600) {
      return `${Math.ceil(seconds / 60)} minutos`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.ceil((seconds % 3600) / 60);
      return `${hours} horas e ${minutes} minutos`;
    }
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
    setDownloadStatus("Iniciando download...");
    setDownloadSpeed("0 KB/s");
    setDownloadedSize("0 KB");
    setTotalSize(model.size);
    setEstimatedTime("calculando...");
    setForceShowDownload(true);
    
    console.log("Starting download for model:", model.name, "with ID:", modelId);
    
    showToastOnly(
      "Download iniciado",
      `Baixando modelo para ${model.name}. Tamanho: ${model.size}`,
      "default"
    );
    
    let lastProgress = 0;
    let lastTime = Date.now();
    let lastBytes = 0;
    
    try {
      console.log("Starting download for model:", modelId);
      const success = await voskModelsService.downloadModel(
        modelId,
        (progress, bytesReceived, totalBytes) => {
          console.log(`Download progress: ${progress}% (${bytesReceived}/${totalBytes} bytes)`);
          setDownloadProgress(progress);
          
          // Update download status
          if (progress < 5) {
            setDownloadStatus("Iniciando download...");
          } else if (progress < 95) {
            setDownloadStatus("Baixando arquivos do modelo...");
          } else {
            setDownloadStatus("Finalizando download...");
          }
          
          // Calculate download speed
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000; // in seconds
          
          if (timeDiff > 0.5) { // Update every half second
            const bytesDiff = bytesReceived - lastBytes;
            const speed = bytesDiff / timeDiff; // bytes per second
            
            setDownloadSpeed(formatBytes(speed) + '/s');
            setDownloadedSize(formatBytes(bytesReceived));
            
            // Estimate remaining time
            if (progress > 0 && progress > lastProgress) {
              const remainingBytes = totalBytes - bytesReceived;
              const remainingTime = remainingBytes / speed;
              setEstimatedTime(formatTime(remainingTime));
            }
            
            lastTime = now;
            lastBytes = bytesReceived;
            lastProgress = progress;
          }
        }
      );
      
      if (success) {
        // Change download status
        setDownloadStatus("Instalando modelo...");
        
        // Wait a moment to show "Installing" status
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Refresh models list
        setModels(voskModelsService.getAvailableModels());
        
        // Apply the language if it was selected
        if (selectedModelId === modelId) {
          voskModelsService.setCurrentModel(modelId);
          setCurrentModelId(modelId);
          setHasChanges(false);
          
          // Cleanup first
          await voskService.cleanup();
          
          // Update status
          setDownloadStatus("Inicializando modelo...");
          
          // Initialize with new model
          const initialized = await voskService.initialize().catch(console.error);
          console.log("VOSK reinitialized with new model:", initialized);
          
          // Update UI language
          const updatedModel = models.find(m => m.id === modelId);
          if (updatedModel) {
            updateUILanguage(updatedModel.language);
          }
        }
        
        setDownloadStatus("Download concluído!");
        
        toast({
          title: "Download concluído",
          description: `O modelo para ${model.name} foi instalado com sucesso!`,
        });
        
        // Fechar a janela após completar o download
        if (autoCloseAfterDownload) {
          setCloseAttempted(true);
          setTimeout(() => {
            setDownloadingModelId(null);
            setIsProcessing(false);
          }, 1000);
        } else {
          setTimeout(() => {
            setDownloadingModelId(null);
            setIsProcessing(false);
          }, 1000);
        }
      } else {
        setDownloadStatus("Erro no download");
        toast({
          title: "Erro no download",
          description: "Não foi possível baixar o modelo de idioma.",
          variant: "destructive",
        });
        setDownloadingModelId(null);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setDownloadStatus("Erro no download");
      toast({
        title: "Erro no download",
        description: "Ocorreu um erro ao baixar o modelo de idioma.",
        variant: "destructive",
      });
      setDownloadingModelId(null);
      setIsProcessing(false);
    }
  };

  const cancelDownload = () => {
    if (downloadingModelId) {
      setDownloadStatus("Cancelando download...");
      voskModelsService.abortDownload(downloadingModelId);
      
      setTimeout(() => {
        setDownloadingModelId(null);
        setDownloadProgress(0);
        setDownloadStatus("");
        setForceShowDownload(false);
        setIsProcessing(false);
      }, 500);
      
      showToastOnly(
        "Download cancelado",
        "O download do modelo de idioma foi cancelado.",
        "default"
      );
    }
  };

  // Handle close with pending operations
  const handleClose = () => {
    if (isProcessing && !autoCloseAfterDownload) {
      toast({
        title: "Operação em andamento",
        description: "Por favor, aguarde a conclusão da operação atual.",
      });
      return;
    }
    
    if (downloadingModelId && !autoCloseAfterDownload) {
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
          {/* Model selection section */}
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
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => handleDownloadModel(selectedModelId)}
                >
                  Baixar agora
                </Button>
              </p>
            )}
          </div>

          {/* Floating download progress section */}
          {(downloadingModelId || forceShowDownload) && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
              <div className="bg-card border rounded-lg p-4 w-[90%] max-w-md shadow-lg">
                <h3 className="font-semibold mb-2 text-center">
                  {downloadStatus || "Baixando modelo de idioma..."}
                </h3>
                
                <Progress value={downloadProgress} className="h-3 mb-2" />
                
                <div className="flex justify-between text-sm mb-4">
                  <span>{downloadProgress}%</span>
                  <span>{downloadedSize} / {totalSize}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <div><span className="font-medium">Velocidade:</span> {downloadSpeed}</div>
                  <div><span className="font-medium">Tempo estimado:</span> {estimatedTime}</div>
                </div>
                
                <Alert variant="default" className="mt-4 py-2">
                  <AlertTitle className="text-sm">Download em andamento</AlertTitle>
                  <AlertDescription className="text-xs flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1 inline-block" />
                    Baixando de alphacephei.com (servidor oficial VOSK)
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelDownload} 
                    disabled={downloadProgress >= 95}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar Download
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Models list section */}
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
                    <Button variant="outline" size="sm">
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
            onClick={() => {
              if (!isProcessing && !downloadingModelId) {
                onClose();
              } else {
                setCloseAttempted(true);
              }
            }}
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
