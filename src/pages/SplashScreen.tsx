
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import IntroductionStepper from "@/components/onboarding/IntroductionStepper";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Redirect if setup already completed
    if (onboardingData.setupCompleted) {
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
      </div>
      <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
        Superleitor - Transformando a maneira como você lê
      </div>
    </div>
  );
};

export default SplashScreen;
