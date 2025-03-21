
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface LanguageSelectorControlsProps {
  hasChanges: boolean;
  isProcessing: boolean;
  downloadingModelId: string | null;
  onSave: () => void;
  onDeleteAllModels: () => void;
}

export const LanguageSelectorControls = ({
  hasChanges,
  isProcessing,
  downloadingModelId,
  onSave,
  onDeleteAllModels,
}: LanguageSelectorControlsProps) => {
  return (
    <div className="flex justify-between">
      <Button
        variant="outline"
        onClick={onDeleteAllModels}
        size="sm"
        className="text-destructive border-destructive hover:bg-destructive/10"
      >
        <RotateCcw className="h-4 w-4 mr-1" />
        Remover Pacotes
      </Button>
      
      <Button
        onClick={onSave}
        disabled={!hasChanges || isProcessing || downloadingModelId !== null}
      >
        <Check className="h-4 w-4 mr-1" />
        Salvar Alterações
      </Button>
    </div>
  );
};
