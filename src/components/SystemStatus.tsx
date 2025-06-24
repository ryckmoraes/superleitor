
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileDown, Trash2, RefreshCw } from "lucide-react";
import { logger } from "@/utils/logger";
import { toast } from "@/components/ui/use-toast";

interface SystemStatusProps {
  isOpen: boolean;
  onClose: () => void;
}

const SystemStatus = ({ isOpen, onClose }: SystemStatusProps) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleExportLogs = () => {
    try {
      const logs = logger.exportLogs();
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `superleitor-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      toast({
        title: "Logs exportados",
        description: "Arquivo de logs baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao exportar logs:", error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar os logs.",
        variant: "destructive",
      });
    }
  };

  const handleClearLogs = () => {
    logger.clear();
    toast({
      title: "Logs limpos",
      description: "Todos os logs foram removidos.",
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
    toast({
      title: "Status atualizado",
      description: "Informações do sistema atualizadas.",
    });
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case "error": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "warn": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "debug": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR');
  };

  const recentLogs = logger.getRecentLogs(20);
  const criticalErrors = logger.getCriticalErrors();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Status do Sistema
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações gerais */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Informações Gerais</h3>
              <div className="text-xs space-y-1">
                <p><strong>URL:</strong> {window.location.href}</p>
                <p><strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...</p>
                <p><strong>Plataforma:</strong> {navigator.platform}</p>
                <p><strong>Total de Logs:</strong> {logger.logs.length}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Erros Críticos</h3>
              <div className="text-xs">
                {criticalErrors.length === 0 ? (
                  <p className="text-green-600">Nenhum erro crítico encontrado</p>
                ) : (
                  <p className="text-red-600">{criticalErrors.length} erro(s) crítico(s)</p>
                )}
              </div>
            </div>
          </div>

          {/* Logs recentes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Logs Recentes (últimos 20)</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportLogs}
                >
                  <FileDown className="h-4 w-4 mr-1" />
                  Exportar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearLogs}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[300px] w-full border rounded-md p-3">
              <div className="space-y-2">
                {recentLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum log disponível</p>
                ) : (
                  recentLogs.map((log, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs px-1 py-0 ${getLogLevelColor(log.level)}`}
                      >
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground min-w-[60px]">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <div className="flex-1">
                        <p className="font-mono">{log.message}</p>
                        {log.details && (
                          <pre className="text-muted-foreground mt-1 whitespace-pre-wrap">
                            {typeof log.details === 'string' 
                              ? log.details 
                              : JSON.stringify(log.details, null, 2)
                            }
                          </pre>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SystemStatus;
