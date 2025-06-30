
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOnboarding } from "@/contexts/OnboardingContext";

const Index = () => {
  const navigate = useNavigate();
  const { onboardingData } = useOnboarding();

  useEffect(() => {
    // Navegação direta e imediata
    if (onboardingData.setupCompleted) {
      navigate("/welcome", { replace: true });
    } else {
      navigate("/setup", { replace: true });
    }
  }, [navigate, onboardingData.setupCompleted]);

  // Tela de carregamento mínima
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-blue-600">Superleitor</h1>
        <p className="text-gray-600 mt-2">Inicializando...</p>
      </div>
    </div>
  );
};

export default Index;
