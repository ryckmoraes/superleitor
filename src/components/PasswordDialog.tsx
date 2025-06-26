
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";
import { useTranslations } from "@/hooks/useTranslations";
import { securityUtils } from "@/utils/securityUtils";
import { secureStorage } from "@/utils/secureStorage";
import { logger } from "@/utils/logger";

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "verify" | "create" | "change";
  title?: string;
}

const PasswordDialog = ({ isOpen, onClose, onSuccess, mode, title }: PasswordDialogProps) => {
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "verify") {
        const storedHash = await secureStorage.getSecureItem("password_hash");
        const storedSalt = await secureStorage.getSecureItem("password_salt");
        
        if (!storedHash || !storedSalt) {
          // No password set, allow access
          onSuccess();
          setPassword("");
          return;
        }

        const isValid = await securityUtils.verifyPassword(password, storedHash, storedSalt);
        if (isValid) {
          onSuccess();
          setPassword("");
        } else {
          setError(t('passwordDialog.incorrectPassword'));
          toast({
            variant: "destructive",
            title: t('passwordDialog.incorrectPassword'),
            description: t('passwordDialog.incorrectPassword')
          });
        }
      } else if (mode === "create") {
        // Validate password strength
        const validation = securityUtils.validatePasswordStrength(newPassword);
        if (!validation.isValid) {
          setError(validation.errors[0]);
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setError(t('passwordDialog.passwordsDoNotMatch'));
          return;
        }

        // Hash and store password
        const { hash, salt } = await securityUtils.hashPassword(newPassword);
        await secureStorage.setSecureItem("password_hash", hash);
        await secureStorage.setSecureItem("password_salt", salt);
        
        // Remove old insecure password if it exists
        localStorage.removeItem("app_password");
        
        toast({
          title: t('hamburguerMenu.createPassword'),
          description: "Sua senha foi criada com sucesso."
        });
        onSuccess();
        resetFields();
      } else if (mode === "change") {
        const storedHash = await secureStorage.getSecureItem("password_hash");
        const storedSalt = await secureStorage.getSecureItem("password_salt");
        
        if (storedHash && storedSalt) {
          const isCurrentValid = await securityUtils.verifyPassword(password, storedHash, storedSalt);
          if (!isCurrentValid) {
            setError(t('passwordDialog.incorrectPassword'));
            return;
          }
        }

        // Validate new password strength
        const validation = securityUtils.validatePasswordStrength(newPassword);
        if (!validation.isValid) {
          setError(validation.errors[0]);
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setError(t('passwordDialog.passwordsDoNotMatch'));
          return;
        }

        // Hash and store new password
        const { hash, salt } = await securityUtils.hashPassword(newPassword);
        await secureStorage.setSecureItem("password_hash", hash);
        await secureStorage.setSecureItem("password_salt", salt);
        
        toast({
          title: t('hamburguerMenu.changePassword'),
          description: "Sua senha foi alterada com sucesso."
        });
        onSuccess();
        resetFields();
      }
    } catch (error) {
      logger.error('Password dialog error', error);
      setError('Erro interno. Tente novamente.');
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro interno. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  const resetFields = () => {
    setPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const getTitle = () => {
    if (title) return title;
    
    switch (mode) {
      case "verify": return t('passwordDialog.verifyPassword');
      case "create": return t('passwordDialog.createPassword');
      case "change": return t('passwordDialog.changePassword');
      default: return t('hamburguerMenu.password');
    }
  };

  const getDescription = () => {
    switch (mode) {
      case "verify": return t('passwordDialog.enterPassword');
      case "create": return t('passwordDialog.createPasswordDescription');
      case "change": return t('passwordDialog.changePasswordDescription');
      default: return "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> {getTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "verify" || mode === "change") && (
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                {mode === "verify" ? t('hamburguerMenu.password') : t('passwordDialog.currentPassword')}
              </label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(securityUtils.sanitizeInput(e.target.value))}
                placeholder={t('passwordDialog.enterYourPassword')}
                required
                disabled={loading}
              />
            </div>
          )}
          
          {(mode === "create" || mode === "change") && (
            <>
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  {t('passwordDialog.newPassword')}
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(securityUtils.sanitizeInput(e.target.value))}
                  placeholder={t('passwordDialog.enterNewPassword')}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo 8 caracteres, com maiúscula, minúscula e número
                </p>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  {t('passwordDialog.confirmPassword')}
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(securityUtils.sanitizeInput(e.target.value))}
                  placeholder={t('passwordDialog.confirmNewPassword')}
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              {t('passwordDialog.cancel')}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processando..." : t('passwordDialog.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
