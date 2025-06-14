
import { DrawerClose, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FooterProps {
  forceClose: () => void;
  onClose: () => void;
  t: (key: string, values?: Record<string, any>, defaultValue?: string) => string;
}

const LanguageSelectorFooter = ({ forceClose, onClose, t }: FooterProps) => (
  <DrawerFooter className="flex flex-col gap-2">
    <Button 
      variant="default"
      onClick={forceClose}
      className="w-full"
    >
      <X className="h-4 w-4 mr-2" />
      {t('languageSelector.backToApp')}
    </Button>
    <DrawerClose asChild>
      <Button 
        variant="outline" 
        onClick={onClose}
        className="w-full"
      >
        <X className="h-4 w-4 mr-2" />
        {t('languageSelector.close')}
      </Button>
    </DrawerClose>
  </DrawerFooter>
);

export default LanguageSelectorFooter;
