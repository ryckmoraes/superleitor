
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useCallback } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import SplashScreen from "./pages/SplashScreen";
import RecordingScreen from "./pages/RecordingScreen";
import NotFound from "./pages/NotFound";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import WelcomeSplashScreen from "./pages/WelcomeSplashScreen";
import { 
  enterFullscreenMode, 
  blockBackNavigation,
  preventMinimize,
  keepScreenOn,
  requestAndroidPermissions,
  isAndroid,
  initializeAndroid
} from "./utils/androidHelper";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Prevent browser navigation
    const blockNavigation = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };
    
    // Add event listener for browser close/refresh
    window.addEventListener('beforeunload', blockNavigation);
    
    // Block back button INTENSIFIED
    blockBackNavigation(() => {
      window.alert("Use o menu para sair do aplicativo");
    });
    
    // Prevent ALL keys including F5 refresh, home button, etc
    const preventAllKeys = (e: KeyboardEvent) => {
      // Bloquear todas as teclas de navegação e função
      if (e.key === 'F5' || e.key === 'F1' || e.key === 'F3' || 
          e.key === 'Escape' || e.key === 'Home' || e.key === 'End' || 
          (e.ctrlKey && (e.key === 'r' || e.key === 'w' || e.key === 't')) ||
          (e.altKey && e.key === 'Home')) {
        e.preventDefault();
        console.log('Tecla bloqueada: ' + e.key);
      }
    };
    
    window.addEventListener('keydown', preventAllKeys, true);
    
    // Prevenir gestos de navegação no Android
    const preventTouchNavigation = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchstart', preventTouchNavigation, { passive: false });
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', blockNavigation);
      window.removeEventListener('keydown', preventAllKeys, true);
      document.removeEventListener('touchstart', preventTouchNavigation);
    };
  }, [navigate]);
  
  return (
    <TransitionGroup>
      <CSSTransition
        key={location.key}
        classNames="page-transition"
        timeout={300}
      >
        <Routes location={location}>
          <Route path="/" element={<WelcomeSplashScreen />} />
          <Route path="/setup" element={<SplashScreen />} />
          <Route path="/record" element={<RecordingScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </CSSTransition>
    </TransitionGroup>
  );
};

const App = () => {
  // Enhanced setup for fullscreen and permissions
  const setupFullscreenMode = useCallback(async () => {
    try {
      console.log("Configurando modo tela cheia e permissões");
      
      // Inicializar configurações específicas do Android
      if (isAndroid()) {
        await initializeAndroid();
      }
      
      // Enter fullscreen mode
      await enterFullscreenMode();
      
      // Request microphone permissions early and FORCE dialog
      if (isAndroid()) {
        await requestAndroidPermissions();
      }
      
      // Keep screen always active
      await keepScreenOn();
      
      // Prevent minimize actions
      await preventMinimize();
      
      // Prevent browser back behavior
      await blockBackNavigation(() => {
        window.alert("Use o menu para sair do aplicativo");
      });
      
      console.log("Configuração de modo tela cheia e permissões concluída");
    } catch (error) {
      console.error("Erro ao configurar modo tela cheia:", error);
    }
  }, []);

  useEffect(() => {
    // Set up fullscreen immediately and on any user interaction
    setupFullscreenMode();
    
    // Forçar re-configuração a cada interação do usuário
    const handleUserInteraction = () => {
      setupFullscreenMode();
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Add a periodic check to ensure we're still in fullscreen
    const fullscreenInterval = setInterval(() => {
      if (!document.fullscreenElement) {
        console.log("Detected exit from fullscreen, attempting to re-enter");
        enterFullscreenMode();
      }
    }, 2000);

    // Prevent user from exiting fullscreen mode with ESC
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        console.log("Fullscreen exited, attempting to re-enter");
        setTimeout(() => {
          enterFullscreenMode();
        }, 500);
      }
    });

    // Intensify prevention against navigation gestures on mobile devices
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
    
    document.addEventListener('touchmove', (e) => {
      // Evitar gestos de navegação como pinch/zoom ou swipes
      if (e.touches.length > 1 || e.scale !== undefined && e.scale !== 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Capture hardware back button events with high intensity
    if (isAndroid()) {
      document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        console.log("Hardware back button prevented");
        // Show an alert message
        window.alert('Use o menu para sair do aplicativo.');
      }, false);
    }

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      clearInterval(fullscreenInterval);
    };
  }, [setupFullscreenMode]);

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
