
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatFileSize, formatTimeRemaining } from "@/utils/formatUtils";

interface DownloadProgressIndicatorProps {
  downloadProgress: number;
  downloadedSize: number;
  totalSize: number;
  downloadSpeed: string;
  estimatedTime: string;
  downloadStatus: string;
  onCancel: () => void;
}

export const DownloadProgressIndicator = ({
  downloadProgress,
  downloadedSize,
  totalSize,
  downloadSpeed,
  estimatedTime,
  downloadStatus,
  onCancel,
}: DownloadProgressIndicatorProps) => {
  return (
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
            onClick={onCancel}
            disabled={downloadProgress >= 90}
            className="text-destructive border-destructive hover:bg-destructive/10"
          >
            Cancelar Download
          </Button>
        </div>
      </div>
    </div>
  );
};
