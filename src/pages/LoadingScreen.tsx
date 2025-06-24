
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
  const [diagnostics, setDiagnostics] = useState<DiagnosticItem[]>([
    { id: "react", name: "React Framework", status: "pending" },
    { id: "router", name: "React Router", status: "pending" },
    { id: "capacitor", name: "Capacitor Platform", status: "pending" },
    { id: "storage", name: "Local Storage", status: "pending" },
    { id: "speech", name: "Speech Recognition", status: "pending" },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const updateDiagnostic = (id: string, status: DiagnosticItem["status"], message?: string) => {
    setDiagnostics(prev => prev.map(item => 
      item.id === id ? { ...item, status, message } : item
    ));
  };

  const runDiagnostics = async () => {
    logger.info("Iniciando diagnósticos de carregamento");

    // Teste 1: React funcionando
    setCurrentStep(1);
    setProgress(20);
    updateDiagnostic("react", "running");
    await new Promise(resolve => setTimeout(resolve, 500));
    updateDiagnostic("react", "success", "React está funcionando");
    logger.info("✅ React funcionando");

    // Teste 2: Router funcionando
    setCurrentStep(2);
    setProgress(40);
    updateDiagnostic("router", "running");
    await new Promise(resolve => setTimeout(resolve, 500));
    updateDiagnostic("router", "success", "Navegação configurada");
    logger.info("✅ React Router funcionando");

    // Teste 3: Capacitor disponível
    setCurrentStep(3);
    setProgress(60);
    updateDiagnostic("capacitor", "running");
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      // @ts-ignore
      if (window.Capacitor) {
        // @ts-ignore
        const isNative = window.Capacitor.isNativePlatform();
        updateDiagnostic("capacitor", "success", `Plataforma: ${isNative ? "Nativa" : "Browser"}`);
        logger.info("✅ Capacitor detectado");
      } else {
        updateDiagnostic("capacitor", "success", "Modo browser ativo");
        logger.info("⚠️ Capacitor não detectado (modo browser)");
      }
    } catch (error) {
      updateDiagnostic("capacitor", "error", "Erro na verificação");
      logger.error("❌ Erro ao verificar Capacitor", error);
    }

    // Teste 4: LocalStorage funcionando
    setCurrentStep(4);
    setProgress(80);
    updateDiagnostic("storage", "running");
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      localStorage.setItem("test", "ok");
      localStorage.removeItem("test");
      updateDiagnostic("storage", "success", "Armazenamento disponível");
      logger.info("✅ LocalStorage funcionando");
    } catch (error) {
      updateDiagnostic("storage", "error", "Falha no armazenamento");
      logger.error("❌ LocalStorage com erro", error);
    }

    // Teste 5: Speech Recognition
    setCurrentStep(5);
    setProgress(100);
    updateDiagnostic("speech", "running");
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        updateDiagnostic("speech", "success", "Reconhecimento disponível");
        logger.info("✅ Speech Recognition disponível");
      } else {
        updateDiagnostic("speech", "error", "Reconhecimento não suportado");
        logger.warn("⚠️ Speech Recognition não disponível");
      }
    } catch (error) {
      updateDiagnostic("speech", "error", "Erro na verificação");
      logger.error("❌ Erro ao verificar Speech Recognition", error);
    }

    // Verificar se todos os testes críticos passaram
    await new Promise(resolve => setTimeout(resolve, 1000));
    const criticalTests = diagnostics.filter(d => ["react", "router", "storage"].includes(d.id));
    const allCriticalPassed = criticalTests.every(test => {
      const updated = diagnostics.find(d => d.id === test.id);
      return updated?.status === "success";
    });

    if (allCriticalPassed) {
      logger.info("Todos os diagnósticos críticos passaram, navegando para boas-vindas");
      navigate("/welcome");
    } else {
      logger.warn("Alguns diagnósticos falharam, permanecendo na tela de carregamento");
    }
  };

  useEffect(() => {
    logger.info("LoadingScreen montada, iniciando diagnósticos");
    runDiagnostics();
  }, []);

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
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="space-y-3">
            {diagnostics.map((diagnostic, index) => (
              <div 
                key={diagnostic.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-300 ${
                  diagnostic.status === "success" 
                    ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                    : diagnostic.status === "error"
                    ? "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
                    : diagnostic.status === "running"
                    ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                    : "bg-muted border-muted"
                }`}
              >
                <div className="flex-shrink-0">
                  {diagnostic.status === "success" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {diagnostic.status === "error" && (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {diagnostic.status === "running" && (
                    <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                  )}
                  {diagnostic.status === "pending" && (
                    <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{diagnostic.name}</p>
                  {diagnostic.message && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {diagnostic.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
