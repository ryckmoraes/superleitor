
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface LanguageSelectorDownloadDialogProps {
  open: boolean;
  downloadProgress: number;
  downloadStatus: string;
  downloadedSize: string;
  totalSize: string;
  downloadSpeed: string;
  estimatedTime: string;
  onCancel: () => void;
  t: (key: string, values?: Record<string, any>, defaultValue?: string) => string;
}

const LanguageSelectorDownloadDialog = ({
  open,
  downloadProgress,
  downloadStatus,
  downloadedSize,
  totalSize,
  downloadSpeed,
  estimatedTime,
  onCancel,
  t,
}: LanguageSelectorDownloadDialogProps) => {
  if (!open) return null;

  return (
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
          <div>
            <span className="font-medium">{t('languageSelector.speed')}:</span> {downloadSpeed}
          </div>
          <div>
            <span className="font-medium">{t('languageSelector.estimatedTime')}:</span> {estimatedTime}
          </div>
        </div>
        <div className="text-xs mt-3 text-center text-muted-foreground">{t('languageSelector.downloadSource')}</div>
        <div className="flex justify-center mt-3">
          <Button variant="destructive" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            {t('languageSelector.cancelDownload')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorDownloadDialog;
