
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Loader2 } from "lucide-react";
import { logger } from "@/utils/logger";

const LoadingScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Iniciando sistema...");

  useEffect(() => {
    logger.info("LoadingScreen montado");
    
    const initializeApp = async () => {
      try {
        // Etapa 1
        setStatus("Carregando recursos...");
        setProgress(25);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Etapa 2
        setStatus("Configurando sistema...");
        setProgress(50);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Etapa 3
        setStatus("Finalizando...");
        setProgress(75);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Etapa 4
        setProgress(100);
        setStatus("Pronto!");
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navegar para a próxima tela
        logger.info("Navegando para welcome");
        navigate("/welcome", { replace: true });
        
      } catch (error) {
        logger.error("Erro na inicialização", error);
        // Em caso de erro, ainda navega para não ficar travado
        navigate("/welcome", { replace: true });
      }
    };

    initializeApp();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md mx-auto w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-blue-600">
            Superleitor
          </h1>
          <p className="text-gray-600 text-lg">
            {status}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Progresso</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-4" />
          </div>

          <div className="flex items-center justify-center space-x-4 p-6 rounded-xl border-2 border-blue-100 bg-blue-50">
            <div className="flex-shrink-0">
              {progress === 100 ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-lg font-semibold text-gray-800">{status}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
