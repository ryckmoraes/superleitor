import { useState, useEffect, useRef } from "react";
import { Menu, X, Settings as SettingsIcon, LogOut, Globe, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import Settings from "./Settings";
import LanguageSelector from "./LanguageSelector";
import SystemStatus from "./SystemStatus";
import PasswordDialog from "./PasswordDialog";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useTranslations } from "@/hooks/useTranslations";

interface HamburgerMenuProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const HamburgerMenu = ({ isDarkMode, toggleTheme }: HamburgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [languageSelectorOpen, setLanguageSelectorOpen] = useState(false);
  const [systemStatusOpen, setSystemStatusOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordAction, setPasswordAction] = useState<"settings" | "exit" | "logout" | "language" | "status">("settings");
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const { resetOnboarding } = useOnboarding();
  const { t } = useTranslations();

  useEffect(() => {
    setShowTrigger(true);
    console.log("HamburgerMenu mounted, showing trigger");
    
    return () => {
      if (triggerTimeoutRef.current) {
        clearTimeout(triggerTimeoutRef.current);
      }
    };
  }, []);

  const handleTriggerAreaEnter = () => {
    if (triggerTimeoutRef.current) {
      clearTimeout(triggerTimeoutRef.current);
      triggerTimeoutRef.current = null;
    }
    setShowTrigger(true);
  };

  const handleTriggerAreaLeave = () => {
    if (!isOpen) {
      triggerTimeoutRef.current = setTimeout(() => {
        setShowTrigger(false);
      }, 1000);
    }
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSettingsClick = () => {
    const hasPassword = !!localStorage.getItem("app_password");
    
    if (hasPassword) {
      setPasswordAction("settings");
      setPasswordDialogOpen(true);
    } else {
      setSettingsOpen(true);
    }
    
    setIsOpen(false);
  };

  const handleLanguageClick = () => {
    const hasPassword = !!localStorage.getItem("app_password");
    
    if (hasPassword) {
      setPasswordAction("language");
      setPasswordDialogOpen(true);
    } else {
      setLanguageSelectorOpen(true);
    }
    
    setIsOpen(false);
  };

  const handleStatusClick = () => {
    const hasPassword = !!localStorage.getItem("app_password");
    
    if (hasPassword) {
      setPasswordAction("status");
      setPasswordDialogOpen(true);
    } else {
      setSystemStatusOpen(true);
    }
    
    setIsOpen(false);
  };

  const handleExitClick = () => {
    const hasPassword = !!localStorage.getItem("app_password");
    
    if (hasPassword) {
      setPasswordAction("exit");
      setPasswordDialogOpen(true);
    } else {
      exitApp();
    }
  };

  const handleLogoutClick = () => {
    const hasPassword = !!localStorage.getItem("app_password");
    
    if (hasPassword) {
      setPasswordAction("logout");
      setPasswordDialogOpen(true);
    } else {
      logoutApp();
    }
    
    setIsOpen(false);
  };

  const handlePasswordSuccess = () => {
    setPasswordDialogOpen(false);
    
    if (passwordAction === "settings") {
      setSettingsOpen(true);
    } else if (passwordAction === "language") {
      setLanguageSelectorOpen(true);
    } else if (passwordAction === "status") {
      setSystemStatusOpen(true);
    } else if (passwordAction === "exit") {
      exitApp();
    } else if (passwordAction === "logout") {
      logoutApp();
    }
  };

  const exitApp = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      
      if (screen.orientation && screen.orientation.unlock) {
        await screen.orientation.unlock();
      }
      
      navigate("/");
      toast({
        title: t("menu.exitTitle"),
        description: t("menu.exitDescription"),
      });
    } catch (error) {
      console.error("Erro ao sair:", error);
      toast({
        title: t("menu.exitErrorTitle"),
        description: t("menu.exitErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const logoutApp = () => {
    resetOnboarding();
    navigate("/");
    toast({
      title: t("menu.logoutTitle"),
      description: t("menu.logoutDescription"),
    });
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 w-20 h-20 z-40"
        onMouseEnter={handleTriggerAreaEnter}
        onMouseLeave={handleTriggerAreaLeave}
      />

      <div 
        className={`fixed top-6 left-6 z-50 transition-all duration-300 ${
          showTrigger || isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          className={`h-10 w-10 rounded-full ${
            isDarkMode 
              ? "bg-white/10 hover:bg-white/20 border border-white/20" 
              : "bg-black/5 hover:bg-black/10 border border-black/10"
          }`}
          onClick={toggleMenu}
          aria-label={isOpen ? t("menu.closeMenu") : t("menu.openMenu")}
        >
          {isOpen ? (
            <X className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-black"}`} />
          ) : (
            <Menu className={`h-5 w-5 ${isDarkMode ? "text-white" : "text-black"}`} />
          )}
        </Button>
      </div>

      <div 
        ref={menuRef}
        className={`fixed top-0 left-0 h-full w-64 glass z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-medium">{t("menu.title")}</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleMenu}
              aria-label={t("menu.closeMenu")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Button
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={handleSettingsClick}
            >
              <SettingsIcon className="mr-2 h-4 w-4" />
              {t("menu.settings")}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={handleLanguageClick}
            >
              <Globe className="mr-2 h-4 w-4" />
              {t("menu.languages")}
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={handleStatusClick}
            >
              <Activity className="mr-2 h-4 w-4" />
              Status
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start mb-2"
              onClick={handleLogoutClick}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t("menu.resetOnboarding")}
            </Button>
          </div>
          
          <div className="mt-auto">
            <Button
              variant="destructive"
              className="w-full justify-start"
              onClick={handleExitClick}
            >
              <X className="mr-2 h-4 w-4" />
              {t("menu.exitApp")}
            </Button>
          </div>
        </div>
      </div>

      <Settings 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
      />

      <LanguageSelector
        isOpen={languageSelectorOpen}
        onClose={() => setLanguageSelectorOpen(false)}
      />

      <SystemStatus
        isOpen={systemStatusOpen}
        onClose={() => setSystemStatusOpen(false)}
      />

      <PasswordDialog
        isOpen={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        onSuccess={handlePasswordSuccess}
        mode="verify"
        title={
          passwordAction === "settings" 
            ? t("menu.accessSettings")
            : passwordAction === "language"
            ? t("menu.accessLanguages")
            : passwordAction === "status"
            ? "Acessar Status"
            : passwordAction === "logout"
            ? t("menu.resetOnboarding")
            : t("menu.exitApp")
        }
      />
    </>
  );
};

export default HamburgerMenu;
