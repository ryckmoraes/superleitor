
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { logger } from "@/utils/logger";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    logger.navigation("Index", "Iniciando verificação", "Index page loaded");
    
    // Verificação simples e direta
    if (onboardingData.setupCompleted) {
      logger.navigation("Index", "Welcome", "Setup já concluído");
      navigate("/welcome", { replace: true });
    } else {
      logger.navigation("Index", "Setup", "Setup não concluído");
      navigate("/setup", { replace: true });
    }
  }, [navigate, onboardingData.setupCompleted]);

  // Tela de loading simples
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-600">Superleitor</h1>
        <p className="text-gray-600 mt-2">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
