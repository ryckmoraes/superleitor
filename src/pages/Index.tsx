
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { logger } from "@/utils/logger";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    logger.info("Index page carregada");
    
    // Simular carregamento inicial
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Verificar se precisa fazer onboarding
      if (!onboardingData.setupCompleted) {
        logger.info("Redirecionando para setup");
        navigate("/setup", { replace: true });
      } else {
        logger.info("Redirecionando para loading");
        navigate("/loading", { replace: true });
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate, onboardingData.setupCompleted]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold text-blue-600">Superleitor</h1>
          <p className="text-gray-600 mt-2">Carregando...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
