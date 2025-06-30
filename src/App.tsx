
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
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

// Type definition for Capacitor on window
interface CapacitorWindow extends Window {
  Capacitor?: {
    Plugins?: {
      SplashScreen?: {
        hide: () => Promise<void>;
      };
    };
  };
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  useEffect(() => {
    console.log("App: Iniciando aplicação");
    
    // Configuração mobile simplificada
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', handleTouch, { passive: false });
    
    // Remover splash screen do Capacitor
    const capacitorWindow = window as CapacitorWindow;
    if (capacitorWindow.Capacitor?.Plugins?.SplashScreen) {
      console.log("App: Ocultando splash screen do Capacitor");
      capacitorWindow.Capacitor.Plugins.SplashScreen.hide().catch(console.log);
    }
    
    console.log("App: Configuração concluída");
    
    return () => {
      document.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  console.log("App: Renderizando componente principal");

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppLockProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/loading" element={<LoadingScreen />} />
                  <Route path="/diagnostic" element={<DiagnosticPage />} />
                  <Route path="/welcome" element={<WelcomeSplashScreen />} />
                  <Route path="/setup" element={<SplashScreen />} />
                  <Route path="/record" element={<RecordingScreen />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AppLockProvider>
            </BrowserRouter>
          </OnboardingProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
