
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ArrowRight, Lock } from "lucide-react";

const WelcomeSplashScreen = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Adiciona animação após o componente ser montado
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Check if this is the user's first time or if they've already completed setup
  useEffect(() => {
    // If setup was never completed and we're not in a "just exited" state,
    // redirect to the setup screen
    if (!onboardingData.setupCompleted && !localStorage.getItem("app_exited")) {
      navigate("/setup");
    }
    // Clear the exited flag if it exists
    localStorage.removeItem("app_exited");
  }, [onboardingData.setupCompleted, navigate]);

  const handleNavigate = () => {
    if (onboardingData.setupCompleted) {
      navigate("/record");
    } else {
      navigate("/setup");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary/20 to-background p-6 overflow-hidden">
      <div className={`flex flex-col items-center text-center transition-all duration-1000 ease-out transform ${
        loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}>
        <div className="mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" 
               style={{ animationDelay: "0.5s", width: "140px", height: "140px", transform: "translate(-10%, -10%)" }} />
          <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" 
               style={{ animationDelay: "1s", width: "160px", height: "160px", transform: "translate(-20%, -20%)" }} />
          
          {/* Elefantinho e cadeado */}
          <div className="relative z-10 w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
            <img 
              src="/lovable-uploads/10b34317-e949-48a0-9866-905f6dfb17cd.png" 
              alt="Elefantinho com cadeado"
              className="w-28 h-28 object-contain"
            />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-primary">
          Bem-vindo à
        </h1>
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Esfera Sonora
        </h2>
        
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          Visualize suas frequências sonoras com uma esfera reativa interativa
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleNavigate}
            size="lg"
            className="group relative overflow-hidden rounded-full px-8 py-6 shadow-lg transition-all duration-300 ease-out hover:shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <span className="relative z-10 flex items-center gap-2 font-medium text-lg">
              {onboardingData.setupCompleted ? "Iniciar" : "Configurar"}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </Button>
          
          {onboardingData.setupCompleted && (
            <p className="text-sm text-muted-foreground/80">
              Olá {onboardingData.adminName}! Bem-vindo de volta.
            </p>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 text-accent opacity-70">
        <Lock className="w-5 h-5" />
      </div>
    </div>
  );
};

export default WelcomeSplashScreen;
