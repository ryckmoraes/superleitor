
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Index: Starting simple navigation");
    
    // Simple check based on localStorage only
    const setupCompleted = localStorage.getItem("onboardingData");
    let isCompleted = false;
    
    try {
      if (setupCompleted) {
        const data = JSON.parse(setupCompleted);
        isCompleted = data.setupCompleted === true;
      }
    } catch (error) {
      console.log("Index: Error reading onboarding data, assuming not completed");
      isCompleted = false;
    }
    
    console.log("Index: Setup completed?", isCompleted);
    
    // Direct navigation without timeout
    if (isCompleted) {
      console.log("Index: Navigating to welcome");
      navigate("/welcome", { replace: true });
    } else {
      console.log("Index: Navigating to setup");
      navigate("/setup", { replace: true });
    }
  }, [navigate]);

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
