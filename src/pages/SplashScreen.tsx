
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import IntroductionStepper from "@/components/onboarding/IntroductionStepper";

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isFirstTimeUser } = useOnboarding();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Adiciona animação após o componente ser montado
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleNavigate = () => {
    navigate("/record");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 overflow-hidden">
      {isFirstTimeUser ? (
        // Show the introduction stepper for first-time users
        <div className={`transition-all duration-1000 ease-out transform ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}>
          <IntroductionStepper />
        </div>
      ) : (
        // Show the regular splash screen for returning users
        <div className={`flex flex-col items-center text-center transition-all duration-1000 ease-out transform ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}>
          <div className="mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" 
                style={{ animationDelay: "0.5s" }} />
            <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-primary/80 to-primary rounded-full flex items-center justify-center animate-float shadow-lg">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary-foreground"
              >
                <path 
                  d="M12 14a2 2 0 100-4 2 2 0 000 4z" 
                  fill="currentColor" 
                />
                <path 
                  d="M16.24 7.76a6 6 0 010 8.49m-8.48-.01a6 6 0 010-8.49m11.31-2.82a10 10 0 010 14.14m-14.14 0a10 10 0 010-14.14" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-semibold tracking-tight mb-3 text-primary">
            Esfera Sonora
          </h1>
          
          <p className="text-muted-foreground max-w-md mb-8">
            Visualize suas frequências sonoras com uma esfera reativa
          </p>
          
          <Button 
            onClick={handleNavigate}
            size="lg"
            className="group relative overflow-hidden rounded-full px-8 py-6 shadow-md transition-all duration-300 ease-out hover:shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <span className="relative z-10 flex items-center gap-2 font-medium">
              Continuar
              <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
