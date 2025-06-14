import { useState, useEffect, useRef } from "react";
import { Globe, Download, Check, X, Save, RotateCw, ExternalLink } from "lucide-react";
import { voskModelsService } from "@/services/voskModelsService";
import { toast } from "@/components/ui/use-toast";
import { showToastOnly } from "@/services/notificationService";
import { speakNaturally } from "@/services/audioProcessor";
import { voskService } from "@/services/voskService";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslations } from "@/hooks/useTranslations";

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
import { formatFileSize, formatTimeRemaining } from "@/utils/formatUtils";

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

const LanguageSelector = ({ isOpen, onClose }: LanguageSelectorProps) => {
  const { modelId, setLanguageModel, language, refreshFromStorage } = useLanguage();
  const { t } = useTranslations();
  const [models, setModels] = useState(voskModelsService.getAvailableModels());
  const [selectedModelId, setSelectedModelId] = useState<string>(modelId);
  const [currentModelId, setCurrentModelId] = useState<string>(modelId);
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
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

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
        
        // Force hard reload the app to apply language changes
        console.log("Forcing full page reload to apply language changes");
        window.location.reload();
      }, 500);
    }
  }, [closeAttempted, isProcessing, downloadingModelId, onClose]);

  // Adicionar log ao abrir o seletor
  useEffect(() => {
    if (isOpen) {
      console.log("[🟦 LanguageSelector] Drawer OPEN");
      setModels(voskModelsService.getAvailableModels());
      const currentModel = voskModelsService.getCurrentModel();
      setCurrentModelId(modelId);
      setSelectedModelId(modelId);
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
  }, [isOpen, models, modelId]);

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
    console.log("Language selected:", modelId, "Current:", currentModelId, "Has changes:", modelId !== currentModelId);
  };

  const handleSaveLanguage = async () => {
    if (isProcessing || downloadingModelId) return;
    if (!hasChanges) return;
    
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;
    
    setIsProcessing(true);
    console.log("Saving language change to:", model.name);
    
    try {
      if (model.installed) {
        setLanguageModel(selectedModelId);
        setCurrentModelId(selectedModelId);
        
        toast({
          title: t('languageSelector.languageSaved'),
          description: t('languageSelector.languageChanged', { name: model.name }),
        });
        
        await voskService.cleanup();
        await voskService.initialize().catch(console.error);
        
        updateUILanguage(model.language);
        
        console.log("Setting close attempted to true to trigger full app reload");
        setTimeout(() => {
          setCloseAttempted(true);
        }, 500);
      } else {
        console.log("Model not installed, starting download");
        setAutoCloseAfterDownload(true);
        await handleDownloadModel(selectedModelId);
      }
    } catch (error) {
      console.error("Erro ao mudar idioma:", error);
      toast({
        title: t('languageSelector.languageChangeError'),
        description: t('languageSelector.languageChangeErrorDescription', {}, "Ocorreu um erro ao alterar o idioma."),
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        if (!downloadingModelId) {
          setCloseAttempted(true);
        }
      }, 1000);
      setHasChanges(false);
    }
  };

  const updateUILanguage = (language: string) => {
    const confirmationMessage = t('languageSelector.languageChanged', { name: models.find(m => m.id === selectedModelId)?.name || '' });
    speakNaturally(confirmationMessage, language, true);
  };

  const handleDownloadModel = async (modelId: string) => {
    if (downloadingModelId) {
      showToastOnly(
        t('languageSelector.downloadInProgress'),
        t('languageSelector.downloadInProgressDescriptionToast', {}, "Aguarde o download atual terminar antes de iniciar outro."),
        "default"
      );
      return;
    }
    const model = models.find(m => m.id === modelId);
    if (!model) return;

    setDownloadingModelId(modelId);
    setDownloadProgress(0);
    setDownloadStatus(t('languageSelector.startingDownload', {}, 'Iniciando download...'));
    setDownloadSpeed("0 KB/s");
    setDownloadedSize("0 KB");
    setTotalSize(model.size);
    setEstimatedTime(t('languageSelector.calculating', {}, 'calculando...'));
    setForceShowDownload(true);
    setIsProcessing(true);

    console.log(`[🟦 LanguageSelector] Iniciando download: ${model.name}, ID: ${modelId}`);

    showToastOnly(
      t('languageSelector.downloadInProgress'),
      t('languageSelector.downloadingModelToastDescription', { name: model.name, size: model.size }, `Baixando modelo para ${model.name}. Tamanho: ${model.size}`),
      "default"
    );

    let lastProgress = 0;
    let lastTime = Date.now();
    let lastBytes = 0;

    try {
      const success = await voskModelsService.downloadModel(
        modelId,
        (progress, bytesReceived, totalBytes) => {
          console.log(`Download progress: ${progress}% (${bytesReceived}/${totalBytes} bytes)`);
          setDownloadProgress(progress);
          
          if (progress < 5) {
            setDownloadStatus(t('languageSelector.startingDownload', {}, 'Iniciando download...'));
          } else if (progress < 95) {
            setDownloadStatus(t('languageSelector.downloadingModel', {}, 'Baixando arquivos...'));
          } else {
            setDownloadStatus(t('languageSelector.finishingDownload', {}, 'Finalizando...'));
          }
          
          // Calculate download speed
          const now = Date.now();
          const timeDiff = (now - lastTime) / 1000; // in seconds
          
          if (timeDiff > 0.5) { // Update every half second
            const bytesDiff = bytesReceived - lastBytes;
            const speed = bytesDiff / timeDiff; // bytes per second
            
            setDownloadSpeed(formatFileSize(speed) + '/s');
            setDownloadedSize(formatFileSize(bytesReceived));
            
            // Estimate remaining time
            if (progress > 0 && progress > lastProgress) {
              const remainingBytes = totalBytes - bytesReceived;
              const remainingTime = remainingBytes / speed;
              setEstimatedTime(formatTimeRemaining(remainingTime));
            }
            
            lastTime = now;
            lastBytes = bytesReceived;
            lastProgress = progress;
          }
        }
      );

      if (success) {
        setDownloadStatus(t('languageSelector.installing', {}, 'Instalando modelo...'));
        await new Promise(resolve => setTimeout(resolve, 1500));

        setModels(voskModelsService.getAvailableModels());

        // (LOG) Mostrando antes de aplicar mudanças
        console.log("[Idioma] Antes da troca: localStorage.vosk_current_model =", localStorage.getItem('vosk_current_model'));
        console.log("[Idioma] currentModelId/selectedModelId", currentModelId, selectedModelId);

        // Salvar modelo como selecionado ANTES do reload
        setLanguageModel(modelId);
        setCurrentModelId(modelId);

        // (LOG) Após troca, antes do reload
        console.log("[Idioma] Depois da troca: localStorage.vosk_current_model =", localStorage.getItem('vosk_current_model'));

        // Mensagem clara de sucesso para usuário
        toast({
          title: t('languageSelector.languageSaved'),
          description: t('languageSelector.languageChanged', { name: model.name }),
        });

        setHasChanges(false);

        // Reload logo após garantir que tudo foi salvo
        setTimeout(() => {
          console.log("[🟩 LanguageSelector] Reloading page após download e troca de idioma.");
          window.location.reload();
        }, 1200);

      } else {
        setDownloadStatus(t('languageSelector.errorDownloading'));
        toast({
          title: t('languageSelector.errorDownloading'),
          description: t('languageSelector.errorDownloadingDescription'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setDownloadStatus(t('languageSelector.errorDownloading'));
      toast({
        title: t('languageSelector.errorDownloading'),
        description: t('languageSelector.errorDownloadingDescription'),
        variant: "destructive",
      });
    } finally {
      setTimeout(() => {
        setDownloadingModelId(null);
        setIsProcessing(false);
        if (autoCloseAfterDownload) {
          setCloseAttempted(true);
        }
      }, 1500);
    }
  };

  const cancelDownload = () => {
    if (downloadingModelId) {
      setDownloadStatus(t('languageSelector.canceling', {}, 'Cancelando...'));
      voskModelsService.abortDownload(downloadingModelId);
      
      setTimeout(() => {
        setDownloadingModelId(null);
        setDownloadProgress(0);
        setDownloadStatus("");
        setForceShowDownload(false);
        setIsProcessing(false);
      }, 500);
      
      showToastOnly(
        t('languageSelector.downloadCanceled'),
        t('languageSelector.downloadCanceledDescription', {}, "O download do modelo de idioma foi cancelado."),
        "default"
      );
    }
  };

  // Handle close with pending operations
  const handleClose = () => {
    if (isProcessing && !autoCloseAfterDownload) {
      toast({
        title: t('languageSelector.operationInProgressTitle', {}, "Operação em andamento"),
        description: t('languageSelector.operationInProgressDescription', {}, "Por favor, aguarde a conclusão da operação atual."),
      });
      return;
    }
    
    if (downloadingModelId && !autoCloseAfterDownload) {
      toast({
        title: t('languageSelector.downloadInProgress'),
        description: t('languageSelector.downloadInProgressDescription', {}, "Deseja cancelar o download antes de sair?"),
      });
      return;
    }
    
    // Ensure hasChanges is reset
    setHasChanges(false);
    onClose();
    
    // Force reload the app if language was changed
    if (currentModelId !== selectedModelId) {
      console.log("Language changed, reloading app");
      window.location.reload();
    }
  };

  // Manual close function that bypasses checks
  const forceClose = () => {
    console.log("Force closing drawer");
    setHasChanges(false);
    setIsProcessing(false);
    setDownloadingModelId(null);
    setForceShowDownload(false);
    onClose();
    
    // Force reload the app if needed
    if (currentModelId !== voskModelsService.getCurrentModel()?.id) {
      console.log("Language model changed, forcing reload");
      window.location.reload();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {t('languageSelector.title')}
          </DrawerTitle>
          <Button 
            size="sm" 
            onClick={handleSaveLanguage}
            disabled={!hasChanges || isProcessing || !!downloadingModelId || !models.find(m => m.id === selectedModelId)?.installed}
            className="mr-2"
          >
            <Save className="h-4 w-4 mr-2" />
            {t('languageSelector.save')}
          </Button>
        </DrawerHeader>
        
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('languageSelector.selectedLanguageLabel')}</label>
            <Select 
              value={selectedModelId} 
              onValueChange={handleLanguageSelection}
              disabled={!!downloadingModelId || isProcessing}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('languageSelector.selectPlaceholder')} />
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
                {t('languageSelector.downloadRequired')}
                <Button 
                  variant="link" 
                  className="text-xs p-0 h-auto" 
                  onClick={() => handleDownloadModel(selectedModelId)}
                >
                  {t('languageSelector.downloadNow')}
                </Button>
              </p>
            )}
          </div>

          {(downloadingModelId || forceShowDownload) && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60">
              <div className="bg-card border rounded-lg p-4 w-[90%] max-w-md shadow-lg">
                <h3 className="font-semibold mb-2 text-center">
                  {downloadStatus || t('languageSelector.downloadingModel')}
                </h3>
                
                <Progress value={downloadProgress} className="h-3 mb-2" />
                
                <div className="flex justify-between text-sm mb-4">
                  <span>{downloadProgress}%</span>
                  <span>{downloadedSize} / {totalSize}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                  <div><span className="font-medium">{t('languageSelector.speed')}:</span> {downloadSpeed}</div>
                  <div><span className="font-medium">{t('languageSelector.estimatedTime')}:</span> {estimatedTime}</div>
                </div>
                
                <Alert variant="default" className="mt-4 py-2">
                  <AlertTitle className="text-sm">{t('languageSelector.downloadInProgress')}</AlertTitle>
                  <AlertDescription className="text-xs flex items-center">
                    <ExternalLink className="h-3 w-3 mr-1 inline-block" />
                    {t('languageSelector.downloadSource')}
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
                    {t('languageSelector.cancelDownload')}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h3 className="text-sm font-medium">{t('languageSelector.availableModels')}</h3>
            <div className="space-y-4 mt-2 max-h-[50vh] overflow-y-auto pr-1">
              {models.map(model => (
                <div 
                  key={model.id} 
                  className={`flex items-center justify-between border rounded-md p-3 ${selectedModelId === model.id ? 'border-primary' : ''}`}
                >
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-xs text-muted-foreground">{t('languageSelector.size')}: {model.size}</p>
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
                          {t('languageSelector.active')}
                        </>
                      ) : (
                        t('languageSelector.select')
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
                      {t('languageSelector.download')}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DrawerFooter className="flex flex-col gap-2">
          <Button 
            variant="default"
            onClick={forceClose}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            {t('languageSelector.backToApp')}
          </Button>
          
          <DrawerClose asChild ref={drawerCloseRef}>
            <Button 
              variant="outline" 
              onClick={() => {
                setHasChanges(false);
                setIsProcessing(false);
              }}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              {t('languageSelector.close')}
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default LanguageSelector;
