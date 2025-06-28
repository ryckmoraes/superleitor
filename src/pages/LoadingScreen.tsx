
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2 } from "lucide-react";
import { logger } from "@/utils/logger";

const LoadingScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Iniciando sistema...");
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    if (hasNavigated) return;
    
    const runInitialization = async () => {
      try {
        logger.info("Iniciando aplicativo");
        
        // Simulação de inicialização mais rápida
        setStatus("Carregando recursos...");
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus("Configurando sistema...");
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setStatus("Finalizando...");
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setProgress(100);
        setStatus("Pronto!");
        await new Promise(resolve => setTimeout(resolve, 300));
        
        if (!hasNavigated) {
          setHasNavigated(true);
          logger.info("Navegando para tela de boas-vindas");
          navigate("/welcome", { replace: true });
        }
      } catch (error) {
        logger.error("Erro na inicialização", error);
        if (!hasNavigated) {
          setHasNavigated(true);
          navigate("/welcome", { replace: true });
        }
      }
    };

    const timer = setTimeout(runInitialization, 100);
    return () => clearTimeout(timer);
  }, [navigate, hasNavigated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-6">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Superleitor
          </h1>
          <p className="text-muted-foreground">
            {status}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Carregando</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          <div className="flex items-center justify-center space-x-3 p-4 rounded-lg border bg-muted/50">
            <div className="flex-shrink-0">
              {progress === 100 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
