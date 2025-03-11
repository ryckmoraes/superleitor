import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTrigger, setShowTrigger] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Show menu trigger when mouse enters trigger area
  const handleTriggerAreaEnter = () => {
    if (triggerTimeoutRef.current) {
      clearTimeout(triggerTimeoutRef.current);
      triggerTimeoutRef.current = null;
    }
    setShowTrigger(true);
  };

  // Hide menu trigger after delay when mouse leaves
  const handleTriggerAreaLeave = () => {
    if (!isOpen) {
      triggerTimeoutRef.current = setTimeout(() => {
        setShowTrigger(false);
      }, 1000);
    }
  };

  // Toggle menu open/closed
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
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

  // Handle exit button click
  const handleExit = () => {
    navigate("/");
  };

  return (
    <>
      {/* Invisible trigger area */}
      <div 
        className="menu-hover-area"
        onMouseEnter={handleTriggerAreaEnter}
        onMouseLeave={handleTriggerAreaLeave}
      />

      {/* Menu trigger button */}
      <div 
        className={`fixed top-6 left-6 z-50 transition-all duration-300 ${
          showTrigger || isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full glass border-0 transition-all duration-300 hover:bg-primary/10"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
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
            <h2 className="text-lg font-medium">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={toggleMenu}
              aria-label="Fechar menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            {/* Itens do menu podem ser adicionados aqui */}
          </div>
          
          <div className="mt-auto">
            <Button
              variant="default"
              className="w-full justify-start"
              onClick={handleExit}
            >
              <X className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
