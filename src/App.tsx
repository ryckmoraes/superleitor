import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import SplashScreen from "./pages/SplashScreen";
import RecordingScreen from "./pages/RecordingScreen";
import NotFound from "./pages/NotFound";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import WelcomeSplashScreen from "./pages/WelcomeSplashScreen";
import { enterFullscreenMode, blockBackNavigation, isAndroid } from "./utils/androidHelper";

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
    
    // Block back button
    blockBackNavigation();
    
    // Prevent F5 refresh
    const preventRefresh = (e: KeyboardEvent) => {
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        console.log('Refresh prevented');
      }
    };
    
    window.addEventListener('keydown', preventRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', blockNavigation);
      window.removeEventListener('keydown', preventRefresh);
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
  useEffect(() => {
    const setupFullscreenMode = async () => {
      try {
        // Enter fullscreen mode
        await enterFullscreenMode();
        
        // Keep screen always active
        if ((navigator as any).wakeLock) {
          try {
            const wakeLock = await (navigator as any).wakeLock.request('screen');
            
            // Reactivate wakeLock if document becomes visible again
            document.addEventListener('visibilitychange', async () => {
              if (document.visibilityState === 'visible') {
                await (navigator as any).wakeLock.request('screen');
              }
            });
          } catch (wakeLockError) {
            console.error("Erro ao manter tela ativa:", wakeLockError);
          }
        }
        
        // Prevent browser back behavior
        blockBackNavigation();
        
        // Prevent device back button on Android
        if (isAndroid()) {
          document.addEventListener('backbutton', (e) => {
            e.preventDefault();
            alert('Por favor, use o menu para sair do aplicativo.');
          }, false);
        }
      } catch (error) {
        console.error("Erro ao configurar modo tela cheia:", error);
      }
    };

    // Set up fullscreen immediately and on any user interaction
    setupFullscreenMode();
    
    // Also try on user interaction for browsers that require it
    const handleUserInteraction = () => {
      setupFullscreenMode();
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Prevent user from exiting fullscreen mode with ESC
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        setTimeout(() => {
          enterFullscreenMode();
        }, 500);
      }
    });

    // Prevent navigation gestures (swipe back/forward) on mobile devices
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
