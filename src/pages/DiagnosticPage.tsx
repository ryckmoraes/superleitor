
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const DiagnosticPage = () => {
  const [diagnostics, setDiagnostics] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    logger.info("DiagnosticPage montada");
    
    const runDiagnostics = async () => {
      const results: string[] = [];
      
      // Teste 1: React funcionando
      results.push("✅ React está funcionando");
      
      // Teste 2: Router funcionando
      results.push("✅ React Router está funcionando");
      
      // Teste 3: Capacitor disponível
      try {
        // @ts-ignore
        if (window.Capacitor) {
          results.push("✅ Capacitor detectado");
          // @ts-ignore
          const isNative = window.Capacitor.isNativePlatform();
          results.push(`✅ Plataforma nativa: ${isNative}`);
        } else {
          results.push("⚠️ Capacitor não detectado (modo browser)");
        }
      } catch (error) {
        results.push(`❌ Erro ao verificar Capacitor: ${error}`);
      }
      
      // Teste 4: LocalStorage funcionando
      try {
        localStorage.setItem("test", "ok");
        localStorage.removeItem("test");
        results.push("✅ LocalStorage funcionando");
      } catch (error) {
        results.push(`❌ LocalStorage com erro: ${error}`);
      }
      
      // Teste 5: User Agent
      results.push(`📱 User Agent: ${navigator.userAgent.substring(0, 50)}...`);
      
      // Teste 6: URL atual
      results.push(`🌐 URL: ${window.location.href}`);
      
      setDiagnostics(results);
      logger.info("Diagnósticos concluídos", results);
    };
    
    runDiagnostics();
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">
          🔧 Diagnóstico do Sistema
        </h1>
        
        <div className="space-y-2 mb-6">
          {diagnostics.length === 0 ? (
            <p className="text-center text-muted-foreground">
              Executando diagnósticos...
            </p>
          ) : (
            diagnostics.map((result, index) => (
              <div 
                key={index}
                className="p-2 bg-card rounded border text-sm font-mono"
              >
                {result}
              </div>
            ))
          )}
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => navigate("/welcome")}
            className="w-full"
          >
            Ir para Tela de Boas-vindas
          </Button>
          
          <Button 
            onClick={() => navigate("/setup")}
            variant="outline"
            className="w-full"
          >
            Ir para Configuração
          </Button>
          
          <Button 
            onClick={() => navigate("/record")}
            variant="outline"
            className="w-full"
          >
            Ir para Gravação
          </Button>
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded text-xs text-muted-foreground">
          <p className="font-semibold mb-2">Logs do Sistema:</p>
          <div className="max-h-32 overflow-y-auto">
            {logger.getAllLogs().slice(-10).map((log, index) => (
              <div key={index} className="mb-1">
                <span className="text-primary">[{log.level}]</span> {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
