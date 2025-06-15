import DebugLogExporter from "@/components/DebugLogExporter";
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
import WelcomeSplashScreen from "./pages/WelcomeSplashScreen";
import { elevenLabsService } from "./services/elevenlabs";
import { LanguageProvider } from "./contexts/LanguageContext"; // ✅ import
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
    // Adiciona logs de lifecycle do App
    logger.info("App.tsx montado - useEffect inicia");
    const enableFullScreen = async () => {
      try {
        // Request fullscreen
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        
        // Try to lock orientation in portrait (vertical) - using safe checks for compatibility
        try {
          if (screen.orientation) {
            // Check if orientation API is supported and use it safely
            try {
              // Use type assertion for TypeScript compatibility
              await (screen.orientation as any).lock('portrait');
            } catch (err) {
              console.log("Orientation lock not supported:", err);
            }
          } else if ((screen as any).msLockOrientation) {
            // For IE
            (screen as any).msLockOrientation.lock('portrait');
          } else if ((screen as any).mozLockOrientation) {
            // For Firefox
            (screen as any).mozLockOrientation.lock('portrait');
          }
        } catch (orientationError) {
          console.error("Erro ao bloquear orientação:", orientationError);
        }
        
        // Immersive mode for Android (hide status and navigation bars)
        const nav = navigator as any;
        if (nav.keyboard && nav.keyboard.lock) {
          try {
            await nav.keyboard.lock();
          } catch (keyboardError) {
            console.error("Erro ao bloquear teclado:", keyboardError);
          }
        }
        
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
      } catch (error) {
        console.error("Erro ao configurar modo tela cheia:", error);
      }
    };

    // Try to enable fullscreen on user interaction
    const handleUserInteraction = () => {
      enableFullScreen();
      // Remove event listeners after first interaction
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("touchstart", handleUserInteraction);

    // Prevent user from exiting fullscreen mode with ESC
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        enableFullScreen();
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

    // Initialize ElevenLabs if API key is stored in session
    if (elevenLabsService.hasApiKey()) {
      console.log("ElevenLabs API key found in session");
    }
    logger.info("App.tsx - finalizou useEffect setup");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* Logger Exporter Button */}
      <DebugLogExporter />
      <LanguageProvider>
        <TooltipProvider>
          <OnboardingProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </OnboardingProvider>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
