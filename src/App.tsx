
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
import { OnboardingProvider } from "./contexts/OnboardingContext";

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
        
        // Bloqueia orientação em portrait (vertical) - usando try/catch para compatibilidade
        try {
          if (screen.orientation) {
            // Método correto para bloquear orientação
            await screen.orientation.lock('portrait');
          }
        } catch (orientationError) {
          console.error("Erro ao bloquear orientação:", orientationError);
        }
        
        // Modo imersivo para Android (ocultar barra de status e navegação)
        const nav = navigator as any;
        if (nav.keyboard && nav.keyboard.lock) {
          try {
            await nav.keyboard.lock();
          } catch (keyboardError) {
            console.error("Erro ao bloquear teclado:", keyboardError);
          }
        }
        
        // Mantém a tela sempre ativa
        if (navigator.wakeLock) {
          try {
            const wakeLock = await navigator.wakeLock.request('screen');
            
            // Reativa o wakeLock se o documento ficar visível novamente
            document.addEventListener('visibilitychange', async () => {
              if (document.visibilityState === 'visible') {
                await navigator.wakeLock.request('screen');
              }
            });
          } catch (wakeLockError) {
            console.error("Erro ao manter tela ativa:", wakeLockError);
          }
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

    // Previne gestos de navegação (swipe back/forward) em dispositivos móveis
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <OnboardingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </OnboardingProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
