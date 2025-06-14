
import { Globe, Save } from "lucide-react";
import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface LanguageSelectorHeaderProps {
  onSave: () => void;
  disabled: boolean;
  isProcessing: boolean;
  downloadingModelId: string | null;
  hasChanges: boolean;
  t: (key: string, values?: Record<string, any>, defaultValue?: string) => string;
}

const LanguageSelectorHeader = ({
  onSave,
  disabled,
  isProcessing,
  downloadingModelId,
  hasChanges,
  t,
}: LanguageSelectorHeaderProps) => (
  <DrawerHeader className="flex justify-between items-center">
    <DrawerTitle className="flex items-center gap-2">
      <Globe className="h-5 w-5" /> {t('languageSelector.title')}
    </DrawerTitle>
    <Button
      size="sm"
      onClick={onSave}
      disabled={disabled || isProcessing || !!downloadingModelId}
      className="mr-2"
    >
      <Save className="h-4 w-4 mr-2" />
      {t('languageSelector.save')}
    </Button>
  </DrawerHeader>
);

export default LanguageSelectorHeader;
