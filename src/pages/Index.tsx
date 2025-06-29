
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { logger } from "@/utils/logger";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    logger.info("=== INDEX INICIADO ===");
    
    // Dar tempo para contextos carregarem (especialmente importante no Android)
    const initTimer = setTimeout(() => {
      logger.info("Verificando dados de onboarding...", { 
        setupCompleted: onboardingData.setupCompleted 
      });
      
      if (onboardingData.setupCompleted) {
        logger.navigation("Index", "Welcome", "Setup concluído");
        navigate("/welcome", { replace: true });
      } else {
        logger.navigation("Index", "Setup", "Setup pendente");
        navigate("/setup", { replace: true });
      }
      
      setIsInitialized(true);
    }, 1000); // Dar mais tempo no Android

    return () => clearTimeout(initTimer);
  }, [navigate, onboardingData.setupCompleted]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-600">Superleitor</h1>
        <p className="text-gray-600 mt-2">
          {!isInitialized ? "Inicializando..." : "Carregando..."}
        </p>
      </div>
    </div>
  );
};

export default Index;
