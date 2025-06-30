
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    // Navegação imediata sem verificações complexas
    console.log("Index: Setup completed?", onboardingData.setupCompleted);
    
    const timer = setTimeout(() => {
      if (onboardingData.setupCompleted) {
        console.log("Index: Navegando para welcome");
        navigate("/welcome", { replace: true });
      } else {
        console.log("Index: Navegando para setup");
        navigate("/setup", { replace: true });
      }
    }, 100); // Timeout mínimo para garantir renderização

    return () => clearTimeout(timer);
  }, [navigate, onboardingData.setupCompleted]);

  // Tela de loading ultra-simples
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-600 mb-2">Superleitor</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
