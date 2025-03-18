
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { loadImage, removeBackground } from "@/utils/imageUtils";
import { ElevenLabsSetup } from "@/components/ElevenLabsSetup";
import { useElevenLabsContext } from "@/contexts/ElevenLabsContext";
import { toast } from "@/components/ui/use-toast";

// Use the image provided by the user (uploaded)
const elephantImage = "/lovable-uploads/10b34317-e949-48a0-9866-905f6dfb17cd.png";

const WelcomeSplashScreen = () => {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const { isInitialized, apiKey } = useElevenLabsContext();

  // Process the elephant image to remove background
  useEffect(() => {
    const processElephantImage = async () => {
      try {
        setIsProcessingImage(true);
        const img = await loadImage(elephantImage);
        const processed = await removeBackground(img);
        setProcessedImage(processed);
      } catch (error) {
        console.error("Error processing elephant image:", error);
        setProcessedImage(elephantImage); // Fallback to original image
      } finally {
        setIsProcessingImage(false);
      }
    };

    processElephantImage();
  }, []);

  const handleContinue = () => {
    if (!isInitialized) {
      toast({
        title: "ElevenLabs API Key Required",
        description: "Please configure your ElevenLabs API key before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    // Continue to the recording screen
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-blue-50 to-indigo-100 text-center">
      <div className="w-full max-w-lg space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-indigo-800">Esfera Sonora</h1>
          <p className="text-xl text-indigo-600">
            Transform your voice into a 3D sound experience.
          </p>
        </div>

        <div className="flex justify-center py-4">
          {isProcessingImage ? (
            <div className="w-64 h-64 animate-pulse bg-gray-200 rounded-full"></div>
          ) : (
            <div className="w-64 h-64 relative">
              <img
                src={processedImage || elephantImage}
                alt="Sound Elephant"
                className="w-full h-full object-contain"
              />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ElevenLabsSetup />
          
          <div className="space-y-4">
            <Button
              className="w-full py-6 text-lg"
              size="lg"
              onClick={handleContinue}
              disabled={!isInitialized}
              asChild
            >
              <Link to="/record">
                Start Recording
              </Link>
            </Button>
            
            {!apiKey && (
              <p className="text-sm text-gray-500">
                Please enter your ElevenLabs API key above to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplashScreen;
