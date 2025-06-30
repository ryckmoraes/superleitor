
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
    // Configuração mobile básica
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Remover splash screen do Capacitor
    if (window.Capacitor?.Plugins?.SplashScreen) {
      window.Capacitor.Plugins.SplashScreen.hide();
    }
  }, []);

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
