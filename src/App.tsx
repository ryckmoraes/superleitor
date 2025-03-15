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
  isAndroid, 
  keepScreenOn,
  preventMinimize,
  requestAndroidPermissions
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
  // Enhanced setup for fullscreen and permissions
  const setupFullscreenMode = useCallback(async () => {
    try {
      // Enter fullscreen mode
      await enterFullscreenMode();
      
      // Request microphone permissions early
      if (isAndroid()) {
        await requestAndroidPermissions();
      }
      
      // Keep screen always active
      await keepScreenOn();
      
      // Prevent minimize actions
      preventMinimize();
      
      // Prevent browser back behavior
      blockBackNavigation();
      
    } catch (error) {
      console.error("Erro ao configurar modo tela cheia:", error);
    }
  }, []);

  useEffect(() => {
    // Set up fullscreen immediately and on any user interaction
    setupFullscreenMode();
    
    // Also try on user interaction for browsers that require it
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

    // Prevent navigation gestures (swipe back/forward) on mobile devices
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Capture all hardware back button events
    if (isAndroid()) {
      document.addEventListener('backbutton', (e) => {
        e.preventDefault();
        console.log("Hardware back button prevented");
        // Show a toast message instead
        alert('Use o menu para sair do aplicativo.');
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
