
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 3000, // Shorter duration for mobile
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
    duration: 2500,
    className: "mobile-notification",
  });
};
