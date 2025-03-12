
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Lock } from "lucide-react";

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

  const storedPassword = localStorage.getItem("app_password");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "verify") {
      if (!storedPassword || password === storedPassword) {
        onSuccess();
        setPassword("");
      } else {
        setError("Senha incorreta");
        toast({
          variant: "destructive",
          title: "Senha incorreta",
          description: "A senha inserida não está correta."
        });
      }
    } else if (mode === "create") {
      if (newPassword.length < 4) {
        setError("A senha deve ter pelo menos 4 caracteres");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError("As senhas não coincidem");
        return;
      }

      localStorage.setItem("app_password", newPassword);
      toast({
        title: "Senha criada",
        description: "Sua senha foi criada com sucesso."
      });
      onSuccess();
      resetFields();
    } else if (mode === "change") {
      if (!storedPassword || password === storedPassword) {
        if (newPassword.length < 4) {
          setError("A nova senha deve ter pelo menos 4 caracteres");
          return;
        }
        
        if (newPassword !== confirmPassword) {
          setError("As novas senhas não coincidem");
          return;
        }

        localStorage.setItem("app_password", newPassword);
        toast({
          title: "Senha alterada",
          description: "Sua senha foi alterada com sucesso."
        });
        onSuccess();
        resetFields();
      } else {
        setError("Senha atual incorreta");
        toast({
          variant: "destructive",
          title: "Senha incorreta",
          description: "A senha atual inserida não está correta."
        });
      }
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
      case "verify": return "Verificar Senha";
      case "create": return "Criar Senha";
      case "change": return "Alterar Senha";
      default: return "Senha";
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
            {mode === "verify" && "Digite sua senha para continuar."}
            {mode === "create" && "Crie uma senha para proteger o acesso às configurações."}
            {mode === "change" && "Altere sua senha atual."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === "verify" || mode === "change") && (
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                {mode === "verify" ? "Senha" : "Senha Atual"}
              </label>
              <Input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
          )}
          
          {(mode === "create" || mode === "change") && (
            <>
              <div className="space-y-2">
                <label htmlFor="new-password" className="text-sm font-medium">
                  Nova Senha
                </label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirmar Senha
                </label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme a nova senha"
                  required
                />
              </div>
            </>
          )}
          
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          
          <DialogFooter className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Confirmar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordDialog;
