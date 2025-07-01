
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import IntroductionStepper from "@/components/onboarding/IntroductionStepper";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("SplashScreen: Loaded");
    
    // Check if setup is already completed
    try {
      const stored = localStorage.getItem("onboardingData");
      if (stored) {
        const data = JSON.parse(stored);
        if (data.setupCompleted) {
          console.log("SplashScreen: Setup already completed, redirecting");
          navigate("/", { replace: true });
          return;
        }
      }
    } catch (error) {
      console.log("SplashScreen: Error checking setup status");
    }
  }, [navigate]);

  return (
    <OnboardingProvider>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-tl from-primary/5 via-background to-background p-6 overflow-hidden">
        <div className="transition-all duration-1000 ease-out">
          <IntroductionStepper />
        </div>
        <div className="absolute bottom-4 text-center text-xs text-muted-foreground">
          Desenvolvido por Equipe Superleitor
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default SplashScreen;
