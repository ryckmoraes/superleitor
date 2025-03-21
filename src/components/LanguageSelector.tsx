
import React from "react";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Globe } from "lucide-react";
import { DownloadProgressIndicator } from "./language/DownloadProgressIndicator";
import { ModelList } from "./language/ModelList";
import { LanguageSelectorControls } from "./language/LanguageSelectorControls";
import { useLanguageSelector } from "@/hooks/useLanguageSelector";

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelector = ({ isOpen, onClose }: LanguageSelectorProps) => {
  const {
    models,
    selectedModelId,
    downloadingModelId,
    downloadProgress,
    downloadSpeed,
    estimatedTime,
    downloadStatus,
    isProcessing,
    hasChanges,
    forceShowDownload,
    downloadedSize,
    totalSize,
    drawerCloseRef,
    handleModelChange,
    handleSaveLanguage,
    handleDownloadModel,
    handleCancelDownload,
    handleClose,
    handleDeleteAllModels,
    isModelOfflineAvailable,
  } = useLanguageSelector(isOpen, onClose);

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
            <DownloadProgressIndicator 
              downloadProgress={downloadProgress}
              downloadedSize={downloadedSize}
              totalSize={totalSize}
              downloadSpeed={downloadSpeed}
              estimatedTime={estimatedTime}
              downloadStatus={downloadStatus}
              onCancel={handleCancelDownload}
            />
          )}
          
          <ModelList 
            models={models}
            selectedModelId={selectedModelId}
            downloadingModelId={downloadingModelId}
            onModelChange={handleModelChange}
            onDownloadModel={handleDownloadModel}
            isModelDownloaded={isModelOfflineAvailable}
          />
          
          <LanguageSelectorControls 
            hasChanges={hasChanges}
            isProcessing={isProcessing}
            downloadingModelId={downloadingModelId}
            onSave={handleSaveLanguage}
            onDeleteAllModels={handleDeleteAllModels}
          />
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild ref={drawerCloseRef}>
            <Button 
              variant="outline" 
              disabled={isProcessing && !downloadingModelId}
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
