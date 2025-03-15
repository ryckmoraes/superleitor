
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 8000, // Longer duration to ensure visibility
    className: "toast-notification bottom-4 opacity-100 border border-primary shadow-lg fixed z-50", // Improved visibility
  });
};

// Show toast with custom duration
export const showToastWithDuration = (
  title: string, 
  description: string, 
  variant: "default" | "destructive" = "default",
  duration: number = 8000
) => {
  toast({
    title,
    description,
    variant,
    duration,
    className: "toast-notification bottom-4 opacity-100 border border-primary shadow-lg fixed z-50", // Improved visibility
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
    duration: 10000, // Even longer for mobile
    className: "mobile-notification toast-small bottom-4 opacity-100 border border-primary shadow-lg fixed z-50", // Improved visibility
  });
};
