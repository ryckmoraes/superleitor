
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import IntroductionStepper from "@/components/onboarding/IntroductionStepper";
import { voskModelsService } from "@/services/voskModelsService";
import { toast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const [currentModelName, setCurrentModelName] = useState<string | null>(null);

  useEffect(() => {
    logger.info("SplashScreen carregado");
    
    const model = voskModelsService.getCurrentModel();
    setCurrentModelName(model ? `${model.name} (${model.language})` : null);
    
    // Notificação toast se modelo não for 'pt-br-small'
    if (model && model.id !== 'pt-br-small') {
      toast({
        title: "Idioma Ativado",
        description: `Modelo ${model.name} (${model.language}) ativado`,
      });
    }
  }, []);

  useEffect(() => {
    // Redirect if setup already completed
    if (onboardingData.setupCompleted) {
      logger.navigation("SplashScreen", "Index", "Setup já concluído");
      navigate("/");
    }
    
    // Adiciona animação após o componente ser montado
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [onboardingData.setupCompleted, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tl from-primary/5 via-background to-background p-6 overflow-hidden">
      <div className={`transition-all duration-1000 ease-out transform ${
        loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}>
        <IntroductionStepper />
        {/* Mostrar modelo atual na SplashScreen */}
        {currentModelName && (
          <div className="text-xs font-bold mt-6 mb-2 text-primary text-center">
            Idioma Selecionado: {currentModelName}
          </div>
        )}
      </div>
      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        Desenvolvido por Equipe Superleitor
      </div>
    </div>
  );
};

export default SplashScreen;
