
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 1500, // Even shorter duration
    className: "toast-notification bottom-0 opacity-70", // Position at bottom with opacity
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
    className: "toast-notification bottom-0 opacity-70", // Position at bottom with opacity
  });
};

// Special mobile-friendly notification
export const showMobileNotification = (
  title: string,
  description: string,
  variant: "default" | "destructive" = "default"
) => {
  // Use a shorter duration and simpler display for mobile
  toast({
    title,
    description,
    variant,
    duration: 1200,
    className: "mobile-notification toast-small bottom-0 opacity-70", // Smaller and at bottom with opacity
  });
};
