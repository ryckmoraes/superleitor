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
  const { modelId, setLanguageModel } = useLanguage();
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
  const drawerCloseRef = useRef<HTMLButtonElement>(null);

  // Make sure the download section is visible if a model is being downloaded
  useEffect(() => {
    if (downloadingModelId) {
      setForceShowDownload(true);
    }
  }, [downloadingModelId]);

  // Adicionar log ao abrir o seletor
  useEffect(() => {
    if (isOpen) {
      console.log("[🟦 LanguageSelector] Drawer OPEN");
      setModels(voskModelsService.getAvailableModels());
      setCurrentModelId(modelId);
      setSelectedModelId(modelId);
      setHasChanges(false);
      
      // Check for active downloads
      const activeDownloads = models.filter(model => voskModelsService.isModelDownloading(model.id));
      if (activeDownloads.length > 0) {
        console.log("Active download detected for model:", activeDownloads[0].id);
        setDownloadingModelId(activeDownloads[0].id);
        setForceShowDownload(true);
      }
    }
  }, [isOpen, modelId]);

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
    if (isProcessing || downloadingModelId || !hasChanges) return;
    
    const model = models.find(m => m.id === selectedModelId);
    if (!model) return;
    
    setIsProcessing(true);
    console.log("Saving language change to:", model.name);
    
    try {
      if (model.installed) {
        setLanguageModel(selectedModelId);
        
        toast({
          title: t('languageSelector.languageSaved'),
          description: t('languageSelector.languageChanged', { name: model.name }),
        });
        
        await voskService.cleanup();
        await voskService.forceReinitialize();
        
        updateUILanguage(model.language);
        
        console.log("Reloading page to apply language changes.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        console.log("Model not installed, starting download");
        await handleDownloadModel(selectedModelId);
      }
    } catch (error) {
      console.error("Erro ao mudar idioma:", error);
      toast({
        title: t('languageSelector.languageChangeError'),
        description: t('languageSelector.languageChangeErrorDescription'),
        variant: "destructive",
      });
      setIsProcessing(false);
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
        t('languageSelector.downloadInProgressDescriptionToast'),
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
        // setLanguageModel(modelId);
        // setCurrentModelId(modelId);

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
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Erro no download:", error);
      setDownloadStatus(t('languageSelector.errorDownloading'));
      toast({
        title: t('languageSelector.errorDownloading'),
        description: t('languageSelector.errorDownloadingDescription'),
        variant: "destructive",
      });
      setIsProcessing(false);
    } finally {
      setTimeout(() => {
        setDownloadingModelId(null);
        if (!voskModelsService.isModelDownloading(modelId)) {
            setIsProcessing(false);
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
        t('languageSelector.downloadCanceledDescription'),
        "default"
      );
    }
  };

  // Handle close with pending operations
  const handleClose = () => {
    if (isProcessing) {
      toast({
        title: t('languageSelector.operationInProgressTitle'),
        description: t('languageSelector.operationInProgressDescription'),
      });
      return;
    }
    
    if (downloadingModelId) {
      toast({
        title: t('languageSelector.downloadInProgress'),
        description: t('languageSelector.cancelDownloadPrompt'),
      });
      return;
    }
    
    // Ensure hasChanges is reset
    setHasChanges(false);
    onClose();
  };

  // Manual close function that bypasses checks
  const forceClose = () => {
    console.log("Force closing drawer");
    setHasChanges(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> {t('languageSelector.title')}
          </DrawerTitle>
        </DrawerHeader>
        
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
                onClose();
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
