
import { toast } from "@/components/ui/use-toast";

// Only show toast, don't speak it
export const showToastOnly = (title: string, description: string, variant: "default" | "destructive" = "default") => {
  toast({
    title,
    description,
    variant,
    duration: 500, // Very short duration
    className: "toast-notification bottom-0 opacity-40 scale-65", // Position at bottom with opacity
  });
};

// Show toast with custom duration
export const showToastWithDuration = (
  title: string, 
  description: string, 
  variant: "default" | "destructive" = "default",
  duration: number = 800
) => {
  toast({
    title,
    description,
    variant,
    duration,
    className: "toast-notification bottom-0 opacity-40 scale-65", // Position at bottom with opacity
  });
};

// Special mobile-friendly notification
export const showMobileNotification = (
  title: string,
  description: string,
  variant: "default" | "destructive" = "default"
) => {
  // Use a very short duration and simpler display for mobile
  toast({
    title,
    description,
    variant,
    duration: 500,
    className: "mobile-notification toast-small bottom-0 opacity-40 scale-65", // Smaller and at bottom with opacity
  });
};
