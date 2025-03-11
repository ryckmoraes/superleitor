
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import SplashScreen from "./pages/SplashScreen";
import RecordingScreen from "./pages/RecordingScreen";
import NotFound from "./pages/NotFound";

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
          <Route path="/" element={<SplashScreen />} />
          <Route path="/record" element={<RecordingScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  useEffect(() => {
    const enableFullScreen = async () => {
      try {
        // Solicita tela cheia
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        
        // Bloqueia orientação em portrait (vertical)
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('portrait');
        }
        
        // Mantém a tela sempre ativa
        if (navigator.wakeLock) {
          const wakeLock = await navigator.wakeLock.request('screen');
          
          // Reativa o wakeLock se o documento ficar visível novamente
          document.addEventListener('visibilitychange', async () => {
            if (document.visibilityState === 'visible') {
              await navigator.wakeLock.request('screen');
            }
          });
        }
      } catch (error) {
        console.error("Erro ao configurar modo tela cheia:", error);
      }
    };

    // Tenta habilitar tela cheia na interação do usuário
    const handleUserInteraction = () => {
      enableFullScreen();
      // Remove os event listeners após a primeira interação
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Impede que o usuário saia do modo tela cheia com ESC
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        enableFullScreen();
      }
    });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
