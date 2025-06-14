
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, Download } from "lucide-react";

interface Model {
  id: string;
  name: string;
  installed: boolean;
  size: string;
  language: string;
}

interface Props {
  models: Model[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  downloadingModelId: string | null;
  isProcessing: boolean;
  hasChanges: boolean;
  handleDownloadModel: (modelId: string) => void;
  t: (key: string, values?: Record<string, any>, defaultValue?: string) => string;
}

const LanguageSelectorLanguageList = ({
  models,
  selectedModelId,
  onSelect,
  downloadingModelId,
  isProcessing,
  hasChanges,
  handleDownloadModel,
  t,
}: Props) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{t('languageSelector.selectedLanguageLabel')}</label>
    <Select 
      value={selectedModelId} 
      onValueChange={onSelect}
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
);

export default LanguageSelectorLanguageList;
