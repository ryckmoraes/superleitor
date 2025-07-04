import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { Key, LockKeyhole, Sun, Moon, Settings as SettingsIcon } from "lucide-react";
import PasswordDialog from "./PasswordDialog";
import { useTranslations } from "@/hooks/useTranslations";
import { secureStorage } from "@/utils/secureStorage";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const Settings = ({ isOpen, onClose, toggleTheme, isDarkMode }: SettingsProps) => {
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordMode, setPasswordMode] = useState<"create" | "change" | "verify">("create");
  const [hasPassword, setHasPassword] = useState(false);
  const { t } = useTranslations();

  useEffect(() => {
    const checkPassword = async () => {
      try {
        const storedHash = await secureStorage.getSecureItem("password_hash");
        const legacyPassword = localStorage.getItem("app_password");
        
        setHasPassword(!!storedHash || !!legacyPassword);
        
        // Migrate legacy password if exists
        if (legacyPassword && !storedHash) {
          console.warn("Legacy password detected. Please update to secure storage.");
        }
      } catch (error) {
        console.error("Error checking password:", error);
      }
    };
    
    if (isOpen) {
      checkPassword();
    }
  }, [passwordDialogOpen, isOpen]);

  const handleCreatePassword = () => {
    setPasswordMode("create");
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = () => {
    setPasswordMode("change");
    setPasswordDialogOpen(true);
  };

  const handlePasswordSuccess = () => {
    setPasswordDialogOpen(false);
    toast({
      title: passwordMode === "create" ? "Senha criada" : "Senha alterada",
      description: passwordMode === "create" 
        ? "Senha criada com sucesso." 
        : "Senha alterada com sucesso.",
    });
  };

  const getTitle = () => {
    return t("settings.title");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" /> {getTitle()}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("settings.appearance")}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <Label htmlFor="theme-mode">{t("settings.themeModeLabel", { mode: isDarkMode ? t("settings.night") : t("settings.day") })}</Label>
                </div>
                <Switch
                  id="theme-mode"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <h3 className="text-sm font-medium">{t("settings.security")}</h3>
              <div className="space-y-4">
                {!hasPassword ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleCreatePassword}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    {t("settings.createPassword")}
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleChangePassword}
                  >
                    <LockKeyhole className="mr-2 h-4 w-4" />
                    {t("settings.changePassword")}
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {t("settings.passwordInfo")} Senhas agora são criptografadas com segurança.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <PasswordDialog
        isOpen={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordSuccess}
        mode={passwordMode}
      />
    </>
  );
};

export default Settings;
