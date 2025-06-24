
import DebugLogExporter from "@/components/DebugLogExporter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import Index from "./pages/Index";
import LoadingScreen from "./pages/LoadingScreen";
import DiagnosticPage from "./pages/DiagnosticPage";
import SplashScreen from "./pages/SplashScreen";
import RecordingScreen from "./pages/RecordingScreen";
import WelcomeSplashScreen from "./pages/WelcomeSplashScreen";
import NotFound from "./pages/NotFound";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import AppLockProvider from "./components/AppLockProvider";
import { logger } from "@/utils/logger";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page-transition"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/loading" element={<LoadingScreen />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/welcome" element={<WelcomeSplashScreen />} />
          <Route path="/setup" element={<SplashScreen />} />
          <Route path="/record" element={<RecordingScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  useEffect(() => {
    logger.info("=== APP.TSX MONTADO ===");
    
    const setupBasicFeatures = () => {
      logger.info("Configurando recursos básicos...");
      
      document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      }, { passive: false });
      
      logger.info("Recursos básicos configurados");
    };

    setupBasicFeatures();
    
    logger.info("=== APP.TSX SETUP CONCLUÍDO ===");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <DebugLogExporter />
      <LanguageProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLockProvider>
                <AnimatedRoutes />
              </AppLockProvider>
            </BrowserRouter>
          </OnboardingProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
