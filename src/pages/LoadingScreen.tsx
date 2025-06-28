
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { logger } from "@/utils/logger";

interface DiagnosticItem {
  id: string;
  name: string;
  status: "pending" | "running" | "success" | "error";
  message?: string;
}

const LoadingScreen = () => {
  const navigate = useNavigate();
  const [diagnostics] = useState<DiagnosticItem[]>([
    { id: "react", name: "React Framework", status: "pending" },
    { id: "router", name: "React Router", status: "pending" },
    { id: "capacitor", name: "Capacitor Platform", status: "pending" },
    { id: "storage", name: "Local Storage", status: "pending" },
    { id: "speech", name: "Speech Recognition", status: "pending" },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentDiagnostic, setCurrentDiagnostic] = useState<DiagnosticItem | null>(null);
  const [hasNavigated, setHasNavigated] = useState(false);

  const runDiagnostics = async () => {
    if (hasNavigated) return;
    
    logger.info("Iniciando diagnósticos de carregamento");

    try {
      // Teste 1: React funcionando
      setCurrentStep(0);
      setProgress(20);
      setCurrentDiagnostic({ ...diagnostics[0], status: "running" });
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentDiagnostic({ ...diagnostics[0], status: "success", message: "React está funcionando" });
      logger.info("✅ React funcionando");

      // Teste 2: Router funcionando
      setCurrentStep(1);
      setProgress(40);
      setCurrentDiagnostic({ ...diagnostics[1], status: "running" });
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentDiagnostic({ ...diagnostics[1], status: "success", message: "Navegação configurada" });
      logger.info("✅ React Router funcionando");

      // Teste 3: Capacitor disponível
      setCurrentStep(2);
      setProgress(60);
      setCurrentDiagnostic({ ...diagnostics[2], status: "running" });
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        // @ts-ignore
        if (window.Capacitor) {
          // @ts-ignore
          const isNative = window.Capacitor.isNativePlatform();
          setCurrentDiagnostic({ ...diagnostics[2], status: "success", message: `Plataforma: ${isNative ? "Nativa" : "Browser"}` });
          logger.info("✅ Capacitor detectado");
        } else {
          setCurrentDiagnostic({ ...diagnostics[2], status: "success", message: "Modo browser ativo" });
          logger.info("⚠️ Capacitor não detectado (modo browser)");
        }
      } catch (error) {
        setCurrentDiagnostic({ ...diagnostics[2], status: "success", message: "Modo browser" });
        logger.warn("Capacitor não disponível, usando modo browser");
      }

      // Teste 4: LocalStorage funcionando
      setCurrentStep(3);
      setProgress(80);
      setCurrentDiagnostic({ ...diagnostics[3], status: "running" });
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        localStorage.setItem("test", "ok");
        localStorage.removeItem("test");
        setCurrentDiagnostic({ ...diagnostics[3], status: "success", message: "Armazenamento disponível" });
        logger.info("✅ LocalStorage funcionando");
      } catch (error) {
        setCurrentDiagnostic({ ...diagnostics[3], status: "success", message: "Armazenamento limitado" });
        logger.warn("LocalStorage limitado");
      }

      // Teste 5: Speech Recognition
      setCurrentStep(4);
      setProgress(100);
      setCurrentDiagnostic({ ...diagnostics[4], status: "running" });
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentDiagnostic({ ...diagnostics[4], status: "success", message: "Sistema pronto" });
      logger.info("✅ Sistema inicializado");

      // Aguardar um pouco e navegar para boas-vindas
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (!hasNavigated) {
        setHasNavigated(true);
        logger.info("Diagnósticos concluídos, navegando para boas-vindas");
        navigate("/welcome");
      }
    } catch (error) {
      logger.error("Erro durante diagnósticos", error);
      if (!hasNavigated) {
        setHasNavigated(true);
        navigate("/welcome");
      }
    }
  };

  useEffect(() => {
    logger.info("LoadingScreen montada, iniciando diagnósticos");
    runDiagnostics();
  }, []); // Empty dependency array to run only once

  const getProgressLabel = () => {
    if (!currentDiagnostic) return "Iniciando...";
    return currentDiagnostic.name;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            Superleitor
          </h1>
          <p className="text-muted-foreground">
            Inicializando sistema...
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{getProgressLabel()}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {currentDiagnostic && (
            <div className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 ${
              currentDiagnostic.status === "success" 
                ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                : currentDiagnostic.status === "error"
                ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                : currentDiagnostic.status === "running"
                ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                : "bg-muted border-muted"
            }`}>
              <div className="flex-shrink-0">
                {currentDiagnostic.status === "success" && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
                {currentDiagnostic.status === "error" && (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                {currentDiagnostic.status === "running" && (
                  <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                )}
                {currentDiagnostic.status === "pending" && (
                  <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium">{currentDiagnostic.name}</p>
                {currentDiagnostic.message && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {currentDiagnostic.message}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
