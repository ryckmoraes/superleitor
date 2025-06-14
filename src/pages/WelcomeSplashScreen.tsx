
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ArrowRight, Headphones, Volume2, BookOpen } from "lucide-react";
import { useElevenLabsSetup } from "@/hooks/useElevenLabsSetup";
import { useTranslations } from "@/hooks/useTranslations";

const WelcomeSplashScreen = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();
  const [loaded, setLoaded] = useState(false);
  const { hasApiKey } = useElevenLabsSetup();
  const { t } = useTranslations();
  
  useEffect(() => {
    // Add animation after component is mounted
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

  // Removed the welcome message speech effect that was causing duplication

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
               style={{ animationDelay: "0.5s", width: "170px", height: "170px", transform: "translate(-10%, -10%)" }} />
          <div className="absolute inset-0 rounded-full bg-primary/15 animate-pulse" 
               style={{ animationDelay: "1s", width: "190px", height: "190px", transform: "translate(-20%, -20%)" }} />
          
          {/* New audio logo with animation */}
          <div className="relative z-10 w-40 h-40 flex items-center justify-center overflow-visible animate-float" 
               style={{ animation: "float 3s ease-in-out infinite" }}>
            <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center shadow-lg">
              <div className="absolute w-40 h-40 rounded-full border-4 border-primary/30 animate-ping" 
                   style={{ animationDuration: "3s" }}></div>
              <div className="absolute w-44 h-44 rounded-full border-2 border-primary/20 animate-ping" 
                   style={{ animationDuration: "3.5s" }}></div>
              <Headphones className="w-16 h-16 text-white" />
              <Volume2 className="absolute -right-1 -top-1 w-10 h-10 text-accent animate-pulse" 
                      style={{ animationDuration: "2s" }} />
            </div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-primary">
          {t('welcomeSplash.heading')}
        </h1>
        <h2 className="text-5xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          {t('welcomeSplash.appName')}
        </h2>
        
        <p className="text-muted-foreground max-w-md mb-8 text-lg">
          {t('welcomeSplash.description')}
        </p>
        
        <div className="space-y-4">
          <Button 
            onClick={handleNavigate}
            size="lg"
            className="group relative overflow-hidden rounded-full px-8 py-6 shadow-lg transition-all duration-300 ease-out hover:shadow-xl bg-primary hover:bg-primary/90 text-primary-foreground animate-pulse"
            style={{ animationDuration: "4s" }}
          >
            <span className="relative z-10 flex items-center gap-2 font-medium text-lg">
              {onboardingData.setupCompleted ? t('welcomeSplash.startReading') : t('welcomeSplash.configure')}
              <ArrowRight className="w-5 h-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-foreground/5 to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </Button>
          
          {onboardingData.setupCompleted && (
            <p className="text-sm text-muted-foreground/80">
              {t('welcomeSplash.greetingWithName', { name: onboardingData.superReaderName || t('welcomeSplash.readerPlaceholder') })}
            </p>
          )}
        </div>
      </div>
      
      <div className="absolute bottom-4 right-4 flex items-center space-x-2 text-accent">
        <Volume2 className="w-5 h-5 animate-pulse" style={{ animationDuration: "3s" }} />
        <BookOpen className="w-5 h-5 text-secondary animate-pulse" style={{ animationDuration: "3.5s" }} />
      </div>
    </div>
  );
};

export default WelcomeSplashScreen;

