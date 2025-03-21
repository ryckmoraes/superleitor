
import React from "react";
import { Button } from "@/components/ui/button";
import { RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Check, Download } from "lucide-react";
import { formatFileSize } from "@/utils/formatUtils";

interface ModelItemProps {
  model: {
    id: string;
    name: string;
    description?: string;
    size: number;
  };
  isSelected: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  onDownload: (modelId: string) => void;
}

export const ModelItem = ({
  model,
  isSelected,
  isDownloaded,
  isDownloading,
  onDownload,
}: ModelItemProps) => {
  return (
    <div className="pb-4 last:pb-0">
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
      
      {!isDownloaded && isSelected && !isDownloading && (
        <div className="mt-2 pl-6">
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onDownload(model.id)}
          >
            <Download className="h-3 w-3 mr-1" />
            Baixar Pacote ({formatFileSize(model.size)})
          </Button>
        </div>
      )}
      
      <Separator className="mt-4" />
    </div>
  );
};
