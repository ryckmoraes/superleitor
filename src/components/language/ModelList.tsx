
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup } from "@/components/ui/radio-group";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Flag } from "lucide-react";
import { ModelItem } from "./ModelItem";

interface Model {
  id: string;
  name: string;
  description?: string;
  size: number;
  language: string;
  url: string;
}

interface ModelListProps {
  models: Model[];
  selectedModelId: string;
  downloadingModelId: string | null;
  onModelChange: (value: string) => void;
  onDownloadModel: (modelId: string) => void;
  isModelDownloaded: (modelId: string) => boolean;
}

export const ModelList = ({
  models,
  selectedModelId,
  downloadingModelId,
  onModelChange,
  onDownloadModel,
  isModelDownloaded,
}: ModelListProps) => {
  return (
    <div className="mb-4">
      <Alert className="mb-4">
        <Flag className="h-4 w-4" />
        <AlertTitle>Reconhecimento offline</AlertTitle>
        <AlertDescription>
          Os pacotes de idioma possibilitam o reconhecimento de fala mesmo sem internet.
          Alguns idiomas podem exigir download adicional.
        </AlertDescription>
      </Alert>

      <h3 className="text-sm font-medium mb-2">Idioma selecionado:</h3>
      <ScrollArea className="h-[300px] rounded-md border p-4">
        <RadioGroup
          value={selectedModelId}
          onValueChange={onModelChange}
          className="gap-4"
        >
          {models.map((model) => (
            <ModelItem
              key={model.id}
              model={model}
              isSelected={selectedModelId === model.id}
              isDownloaded={isModelDownloaded(model.id)}
              isDownloading={downloadingModelId === model.id}
              onDownload={onDownloadModel}
            />
          ))}
        </RadioGroup>
      </ScrollArea>
    </div>
  );
};
