
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 2000, // Longer duration
    className: "toast-notification bottom-0 opacity-80", // Position at bottom with more visibility
  });
};

// Show toast with custom duration
export const showToastWithDuration = (
  title: string, 
  description: string, 
  variant: "default" | "destructive" = "default",
  duration: number = 2000
) => {
  toast({
    title,
    description,
    variant,
    duration,
    className: "toast-notification bottom-0 opacity-80", // Position at bottom with more visibility
  });
};

// Special mobile-friendly notification
export const showMobileNotification = (
  title: string,
  description: string,
  variant: "default" | "destructive" = "default"
) => {
  // Use a longer duration for mobile
  toast({
    title,
    description,
    variant,
    duration: 2000,
    className: "mobile-notification toast-small bottom-0 opacity-80", // Smaller and at bottom with more visibility
  });
};
