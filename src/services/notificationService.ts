
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 5000, // Much longer duration
    className: "toast-notification bottom-4 opacity-100", // Higher opacity
  });
};

// Show toast with custom duration
export const showToastWithDuration = (
  title: string, 
  description: string, 
  variant: "default" | "destructive" = "default",
  duration: number = 5000
) => {
  toast({
    title,
    description,
    variant,
    duration,
    className: "toast-notification bottom-4 opacity-100", // Higher opacity
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
    duration: 5000,
    className: "mobile-notification toast-small bottom-4 opacity-100", // Higher opacity
  });
};
