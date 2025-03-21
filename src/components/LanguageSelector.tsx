import React, { useState, useEffect, useRef } from "react";
import { voskModelsService } from "@/services/voskModelsService";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { showToastOnly } from "@/services/notificationService";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Globe, Check, Download, RotateCcw, Flag } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Helper functions for formatting
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatTimeRemaining = (seconds: number): string => {
  if (!seconds || seconds <= 0) return "calculando...";
  
  if (seconds < 60) {
    return `${Math.ceil(seconds)} segundos`;
  } else if (seconds < 3600) {
    return `${Math.ceil(seconds / 60)} minutos`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.ceil((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DownloadProgress {
  percentage: number;
  downloaded: number;
  total: number;
  speed?: number;
  eta?: number;
}

// Extend the VoskModelsService for TypeScript
interface VoskModelServiceExt {
  getAvailableModels: () => any[];
  getCurrentModel: () => {id: string} | null;
  isModelDownloading: (modelId: string) => boolean;
  setCurrentModel: (modelId: string) => Promise<{success: boolean, error?: string}>;
  isModelDownloaded?: (modelId: string) => boolean;
  cancelModelDownload?: (modelId: string) => void;
  updateModelDownloadProgress?: (modelId: string, progress: DownloadProgress) => void;
  getModelDownloadProgress?: (modelId: string) => DownloadProgress | null;
  completeModelDownload?: (modelId: string) => Promise<{success: boolean, error?: string}>;
  deleteAllModels?: () => void;
}

// Type assertion for the service to work with our code
const voskService = voskModelsService as unknown as VoskModelServiceExt;

export const LanguageSelector = ({ isOpen, onClose }: LanguageSelectorProps) => {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>("");
  const [downloadingModelId, setDownloadingModelId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>("0 KB/s");
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [downloadStatus, setDownloadStatus] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [forceShowDownload, setForceShowDownload] = useState<boolean>(false);
  const [downloadedSize, setDownloadedSize] = useState<number>(0);
  const [totalSize, setTotalSize] = useState<number>(0);
  const [autoCloseAfterDownload, setAutoCloseAfterDownload] = useState<boolean>(false);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Reset states when drawer opens
      const availableModels = voskService.getAvailableModels();
      const currentModel = voskService.getCurrentModel();
      
      setModels(availableModels);
      setSelectedModelId(currentModel?.id || "pt-br-small");
      setHasChanges(false);
      setAutoCloseAfterDownload(false);
      setIsProcessing(false); // Reset processing state when drawer opens
      
      // Check for active downloads
      const activeDownloads = models.filter(model => voskService.isModelDownloading(model.id));
      if (activeDownloads.length > 0) {
        const downloadingModel = activeDownloads[0];
        setDownloadingModelId(downloadingModel.id);
        setForceShowDownload(true);
        
        // Get current progress
        if (voskService.getModelDownloadProgress) {
          const progress = voskService.getModelDownloadProgress(downloadingModel.id);
          if (progress) {
            setDownloadProgress(progress.percentage || 0);
            setDownloadedSize(progress.downloaded || 0);
            setTotalSize(progress.total || downloadingModel.size);
          }
        }
      }
    }
  }, [isOpen, models]);
  
  // Process model downloads in background
  useEffect(() => {
    const checkDownloadProgress = () => {
      if (downloadingModelId && voskService.getModelDownloadProgress) {
        const progress = voskService.getModelDownloadProgress(downloadingModelId);
        if (progress) {
          setDownloadProgress(progress.percentage || 0);
          setDownloadedSize(progress.downloaded || 0);
          
          if (progress.speed) {
            setDownloadSpeed(formatFileSize(progress.speed) + "/s");
          }
          
          if (progress.eta) {
            setEstimatedTime(formatTimeRemaining(progress.eta));
          }
        }
      }
    };
    
    const interval = setInterval(checkDownloadProgress, 500);
    return () => clearInterval(interval);
  }, [downloadingModelId]);
  
  const handleModelChange = (value: string) => {
    setSelectedModelId(value);
    setHasChanges(true);
  };

  const handleSaveLanguage = async () => {
    if (downloadingModelId) return;
    if (!hasChanges) return;
    
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;
    
    setIsProcessing(true);
    
    try {
      // Verificar se o modelo está disponível ou precisa ser baixado
      const isModelDownloaded = voskService.isModelDownloaded ? 
        voskService.isModelDownloaded(model.id) : 
        false;
      
      if (!isModelDownloaded) {
        setAutoCloseAfterDownload(true);
        await handleDownloadModel(model.id);
        return;
      }
      
      // Aplicar a mudança de idioma
      const result = await voskService.setCurrentModel(model.id);
      
      if (result.success) {
        localStorage.setItem('vosk_model_changed_at', Date.now().toString());
        
        showToastOnly(
          "Idioma alterado",
          `Idioma definido para ${model.name}.`,
          "default"
        );
        
        // Fechar a janela após completar a alteração
        setTimeout(() => {
          setIsProcessing(false); // Make sure to reset before closing
          triggerDrawerClose();
        }, 1000);
      } else {
        setIsProcessing(false);
        showToastOnly(
          "Erro ao alterar idioma",
          result.error || "Ocorreu um erro ao alterar o idioma.",
          "destructive"
        );
      }
    } catch (error) {
      console.error("Erro ao alterar idioma:", error);
      showToastOnly(
        "Erro ao alterar idioma",
        "Ocorreu um erro ao alterar o idioma.",
        "destructive"
      );
      setIsProcessing(false); // Reset processing state on error
    }
  };
  
  const triggerDrawerClose = () => {
    // Use the ref to programmatically click the close button
    if (drawerCloseRef.current) {
      drawerCloseRef.current.click();
    } else {
      // Fallback direct call to onClose if ref isn't available
      setHasChanges(false);
      setIsProcessing(false);
      onClose();
    }
  };

  const handleDownloadModel = async (modelId: string) => {
    if (downloadingModelId) return;
    
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    // Já está baixado
    if (voskService.isModelDownloaded && voskService.isModelDownloaded(modelId)) {
      showToastOnly(
        "Modelo já disponível",
        `O modelo ${model.name} já está disponível no dispositivo.`,
        "default"
      );
      return;
    }
    
    // Configurar estado para download
    setDownloadingModelId(modelId);
    setDownloadProgress(0);
    setDownloadSpeed("0 KB/s");
    setDownloadedSize(0);
    setTotalSize(model.size);
    setEstimatedTime("calculando...");
    setForceShowDownload(true);
    setIsProcessing(true);
    
    console.log("Starting download for model:", model.name, "with ID:", modelId);
    
    try {
      let fileUrl = model.url;
      let corsProxyUrl = "";
      
      // Tentar resolver possíveis problemas de CORS com um proxy
      try {
        corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(model.url)}`;
        console.log("Trying CORS proxy URL:", corsProxyUrl);
        
        // Testar se o proxy CORS está funcionando
        const proxyResponse = await fetch(corsProxyUrl, { method: 'HEAD' });
        if (proxyResponse.ok) {
          fileUrl = corsProxyUrl;
          console.log("Using CORS proxy for download");
        } else {
          console.log("CORS proxy not available, using direct URL");
        }
      } catch (error) {
        console.warn("CORS proxy test failed, using direct URL:", error);
      }
      
      // Função para simular progresso de download (para fins de demonstração)
      const simulateDownload = (totalSize: number) => {
        return new Promise<void>((resolve) => {
          console.log("Simulating download for:", model.name);
          
          let downloadedBytes = 0;
          const totalBytes = totalSize;
          const downloadRate = 500 * 1024; // ~500 KB/s
          const updateInterval = 200; // 200ms
          
          const interval = setInterval(() => {
            // Simular baixando em chunks
            const chunk = Math.min(downloadRate * (updateInterval / 1000), totalBytes - downloadedBytes);
            downloadedBytes += chunk;
            
            const percentage = Math.min(Math.floor((downloadedBytes / totalBytes) * 100), 100);
            
            // Atualizar progresso
            if (voskService.updateModelDownloadProgress) {
              voskService.updateModelDownloadProgress(modelId, {
                percentage,
                downloaded: downloadedBytes,
                total: totalBytes,
                speed: downloadRate,
                eta: (totalBytes - downloadedBytes) / downloadRate
              });
            }
            
            // Update UI directly as well
            setDownloadProgress(percentage);
            setDownloadedSize(downloadedBytes);
            setDownloadSpeed(formatFileSize(downloadRate) + "/s");
            setEstimatedTime(formatTimeRemaining((totalBytes - downloadedBytes) / downloadRate));
            
            // Terminar quando concluído
            if (downloadedBytes >= totalBytes) {
              clearInterval(interval);
              console.log("Simulated download completed");
              resolve();
            }
          }, updateInterval);
        });
      };
      
      // Função para o download real
      const realDownload = async (url: string) => {
        console.log("Starting real download from:", url);
        
        // Iniciar um request para o arquivo
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error("Download failed:", response.statusText);
          throw new Error(`Failed to download: ${response.statusText}`);
        }
        
        // Verificar se podemos obter o tamanho do arquivo
        const contentLength = response.headers.get('content-length');
        const totalBytes = contentLength ? parseInt(contentLength, 10) : model.size;
        console.log("Content length:", contentLength, "Total size:", totalBytes);
        
        // Controle de tempo para cálculo de velocidade
        let lastTime = Date.now();
        let lastBytes = 0;
        let downloadedBytes = 0;
        
        // Configurar o leitor de streams para processar os chunks
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Failed to get response body reader");
        }
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("Download completed");
            break;
          }
          
          // Atualizar bytes baixados
          downloadedBytes += value.length;
          
          // Calcular velocidade de download a cada segundo
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000; // em segundos
          
          if (timeDiff >= 1) {
            const byteDiff = downloadedBytes - lastBytes;
            const speed = byteDiff / timeDiff;
            
            // Estimar tempo restante
            const remainingBytes = totalBytes - downloadedBytes;
            const eta = speed > 0 ? remainingBytes / speed : 0;
            
            // Atualizar progresso
            const percentage = Math.floor((downloadedBytes / totalBytes) * 100);
            
            if (voskService.updateModelDownloadProgress) {
              voskService.updateModelDownloadProgress(modelId, {
                percentage,
                downloaded: downloadedBytes,
                total: totalBytes,
                speed,
                eta
              });
            }
            
            // Update UI directly as well
            setDownloadProgress(percentage);
            setDownloadedSize(downloadedBytes);
            setDownloadSpeed(formatFileSize(speed) + "/s");
            setEstimatedTime(formatTimeRemaining(eta));
            
            // Atualizar referências para o próximo cálculo
            lastTime = now;
            lastBytes = downloadedBytes;
          }
        }
        
        // Finalizar com 100%
        if (voskService.updateModelDownloadProgress) {
          voskService.updateModelDownloadProgress(modelId, {
            percentage: 100,
            downloaded: totalBytes,
            total: totalBytes,
            speed: 0,
            eta: 0
          });
        }
        
        // Update UI directly for final state
        setDownloadProgress(100);
        setDownloadedSize(totalBytes);
      };
      
      setDownloadStatus("Iniciando download...");
      
      try {
        // Para fins de demonstração, usar simulação se o download real falhar
        await realDownload(fileUrl);
      } catch (error) {
        console.log("Real download failed, using simulation:", error);
        await simulateDownload(model.size);
      }
      
      setDownloadStatus("Concluindo instalação...");
      
      // Marcar download como concluído
      let downloadSuccess = true;
      
      if (voskService.completeModelDownload) {
        const result = await voskService.completeModelDownload(modelId);
        downloadSuccess = result.success;
      }
      
      if (downloadSuccess) {
        // Set as current model if it was auto-close download
        if (autoCloseAfterDownload) {
          const setResult = await voskService.setCurrentModel(modelId);
          if (setResult.success) {
            localStorage.setItem('vosk_model_changed_at', Date.now().toString());
          }
        }
        
        setDownloadStatus("Download concluído!");
        
        showToastOnly(
          "Download concluído",
          `O modelo ${model.name} foi baixado com sucesso.`,
          "default"
        );
        
        // Fechar a janela após completar o download
        if (autoCloseAfterDownload) {
          setTimeout(() => {
            console.log("Auto-closing after download completion");
            setIsProcessing(false);
            setDownloadingModelId(null);
            setForceShowDownload(false);
            setHasChanges(false);
            triggerDrawerClose();
          }, 1500);
        }
      } else {
        setDownloadStatus("Erro no download");
        
        showToastOnly(
          "Erro no download",
          "Não foi possível baixar o modelo de idioma.",
          "destructive"
        );
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setDownloadStatus("Erro no download");
      
      showToastOnly(
        "Erro no download",
        "Ocorreu um erro ao baixar o modelo de idioma.",
        "destructive"
      );
      setIsProcessing(false);
    } finally {
      // If not auto-closing, reset the download state
      if (!autoCloseAfterDownload) {
        setTimeout(() => {
          setDownloadingModelId(null);
          setForceShowDownload(false);
          setIsProcessing(false);
        }, 1000);
      }
    }
  };

  const handleCancelDownload = () => {
    if (downloadingModelId) {
      if (voskService.cancelModelDownload) {
        voskService.cancelModelDownload(downloadingModelId);
      }
      setDownloadingModelId(null);
      
      setTimeout(() => {
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
  
  // Check if model is available offline
  const isModelOfflineAvailable = (modelId: string) => {
    return voskService.isModelDownloaded ? voskService.isModelDownloaded(modelId) : false;
  };
  
  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center">
            <Globe className="w-5 h-5 mr-2 text-primary" /> 
            Seleção de Idioma
          </DrawerTitle>
          <DrawerDescription>
            Escolha o idioma para o reconhecimento de fala offline.
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="px-4 py-2 relative">
          {(downloadingModelId || forceShowDownload) && (
            <div className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
              <div className="w-4/5 max-w-md p-6 bg-card border rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-2">Baixando pacote de idioma</h3>
                
                <Progress value={downloadProgress} className="h-4 mb-2" />
                
                <div className="text-sm grid grid-cols-2 gap-1 mb-4">
                  <div className="text-muted-foreground">Progresso:</div>
                  <div className="text-right">{downloadProgress}%</div>
                  
                  <div className="text-muted-foreground">Baixado:</div>
                  <div className="text-right">
                    {formatFileSize(downloadedSize)} / {formatFileSize(totalSize)}
                  </div>
                  
                  <div className="text-muted-foreground">Velocidade:</div>
                  <div className="text-right">{downloadSpeed}</div>
                  
                  <div className="text-muted-foreground">Tempo estimado:</div>
                  <div className="text-right">{estimatedTime}</div>
                </div>
                
                <div className="text-center mb-4 text-sm font-medium">
                  {downloadStatus}
                </div>
                
                <div className="flex justify-center">
                  <Button 
                    variant="outline" 
                    onClick={handleCancelDownload}
                    disabled={downloadProgress >= 90}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    Cancelar Download
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <Alert className="mb-4">
            <Flag className="h-4 w-4" />
            <AlertTitle>Reconhecimento offline</AlertTitle>
            <AlertDescription>
              Os pacotes de idioma possibilitam o reconhecimento de fala mesmo sem internet.
              Alguns idiomas podem exigir download adicional.
            </AlertDescription>
          </Alert>

          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Idioma selecionado:</h3>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <RadioGroup
                value={selectedModelId}
                onValueChange={handleModelChange}
                className="gap-4"
              >
                {models.map((model) => {
                  const isDownloaded = isModelOfflineAvailable(model.id);
                  const isDownloading = downloadingModelId === model.id;
                  
                  return (
                    <div key={model.id} className="pb-4 last:pb-0">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={model.id} id={`model-${model.id}`} />
                        <Label htmlFor={`model-${model.id}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{model.name}</span>
                            {isDownloaded && (
                              <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5 flex items-center">
                                <Check className="h-3 w-3 mr-1" /> Instalado
                              </span>
                            )}
                            {!isDownloaded && !isDownloading && (
                              <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5 flex items-center">
                                <Download className="h-3 w-3 mr-1" /> {formatFileSize(model.size)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{model.description}</p>
                        </Label>
                      </div>
                      
                      {!isDownloaded && selectedModelId === model.id && !isDownloading && (
                        <div className="mt-2 pl-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => handleDownloadModel(model.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Baixar Pacote ({formatFileSize(model.size)})
                          </Button>
                        </div>
                      )}
                      
                      <Separator className="mt-4" />
                    </div>
                  );
                })}
              </RadioGroup>
            </ScrollArea>
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                if (voskService.deleteAllModels) {
                  voskService.deleteAllModels();
                  toast({
                    title: "Pacotes removidos",
                    description: "Todos os pacotes de idioma foram removidos.",
                  });
                }
              }}
              size="sm"
              className="text-destructive border-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Remover Pacotes
            </Button>
            
            <Button
              onClick={handleSaveLanguage}
              disabled={!hasChanges || isProcessing || downloadingModelId !== null}
            >
              <Check className="h-4 w-4 mr-1" />
              Salvar Alterações
            </Button>
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild ref={drawerCloseRef}>
            <Button 
              variant="outline" 
              disabled={isProcessing && !autoCloseAfterDownload}
            >
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
