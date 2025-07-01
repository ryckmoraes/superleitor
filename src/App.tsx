
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import SplashScreen from "./pages/SplashScreen";
import RecordingScreen from "./pages/RecordingScreen";
import WelcomeSplashScreen from "./pages/WelcomeSplashScreen";
import NotFound from "./pages/NotFound";

// Type declaration for Capacitor
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
    console.log("App: Ultra-simplified version starting");
    
    // Hide Capacitor splash screen if available
    const capacitorWindow = window as CapacitorWindow;
    if (capacitorWindow.Capacitor?.Plugins?.SplashScreen) {
      console.log("App: Hiding Capacitor splash screen");
      capacitorWindow.Capacitor.Plugins.SplashScreen.hide().catch(console.log);
    }
  }, []);

  console.log("App: Rendering ultra-simplified version");

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/welcome" element={<WelcomeSplashScreen />} />
          <Route path="/setup" element={<SplashScreen />} />
          <Route path="/record" element={<RecordingScreen />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
